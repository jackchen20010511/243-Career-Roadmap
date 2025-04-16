import re
import json
import os
from typing import Dict, List, Any, Optional, Tuple
import fitz  # PyMuPDF
import hashlib
from llama_cpp import Llama

class LocalLLMResumeAnalyzer:
    """
    A resume analyzer using locally running LLMs to extract technical skills,
    assign confidence scores, and categorize by domain.
    """
    
    def __init__(self, model_path=None, use_cache=True):
        """
        Initialize the local LLM resume analyzer
        
        Args:
            model_path: Path to the GGUF model file
            use_cache: Whether to cache results to avoid redundant processing
        """
        self.use_cache = use_cache
        self.cache_dir = ".resume_cache"
        
        # Set default model path or use provided one
        self.model_path = model_path or "Nous-Hermes-2-Mistral-7B-DPO.Q4_K_M.gguf"
        
        # Initialize the model
        self._initialize_model()
        
        # Create cache directory if it doesn't exist
        if self.use_cache and not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def _initialize_model(self):
        """Initialize the local LLM"""
        try:
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=8192,  # Context window size
                n_threads=8,  # Adjust based on your CPU
                n_gpu_layers=0  # Set higher if you have GPU
            )
            print(f"Model initialized: {self.model_path}")
        except Exception as e:
            print(f"Error initializing model: {e}")
            self.llm = None
    
    def extract_text_from_pdf(self, file_bytes) -> str:
        """Extract text from a PDF file"""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text("text") + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_text_from_docx(self, file_bytes) -> str:
        """Extract text from a DOCX file"""
        try:
            import io
            from docx import Document
            
            doc = Document(io.BytesIO(file_bytes))
            text = []
            for para in doc.paragraphs:
                text.append(para.text)
            return "\n".join(text)
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""
    
    def extract_text_from_file(self, file_bytes, file_type) -> str:
        """Extract text from a file based on its type"""
        if file_type.lower() == "pdf":
            return self.extract_text_from_pdf(file_bytes)
        elif file_type.lower() == "docx":
            return self.extract_text_from_docx(file_bytes)
        else:
            # Assume plain text
            try:
                return file_bytes.decode("utf-8")
            except:
                return ""
    
    def _generate_cache_key(self, text: str) -> str:
        """Generate a cache key based on the text content"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get cached results if available"""
        if not self.use_cache:
            return None
            
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    return json.load(f)
            except:
                return None
        return None
    
    def _save_to_cache(self, cache_key: str, data: Dict) -> None:
        """Save results to cache"""
        if not self.use_cache:
            return
            
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        try:
            with open(cache_file, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            print(f"Error saving to cache: {e}")
    
    def _call_local_llm(self, prompt: str) -> str:
        """Call the local LLM"""
        if not self.llm:
            raise ValueError("LLM model not initialized successfully.")
        
        try:
            # Use a template with system prompt first
            system_prompt = "You are an expert resume analyzer focused on identifying technical skills with high precision."
            
            # Format for instruct models
            complete_prompt = f"""<s>[INST] {system_prompt}

{prompt} [/INST]
"""
            
            # Call the model
            output = self.llm(
                complete_prompt,
                max_tokens=4000,
                temperature=0.1,
                top_p=0.9,
                stop=["</s>"]
            )
            
            return output["choices"][0]["text"]
        except Exception as e:
            print(f"Error calling local LLM: {e}")
            return ""
    
    def _parse_json_response(self, response: str) -> List[Dict]:
        """Parse the JSON response from the LLM"""
        # Find JSON content in the response (it might be embedded in text)
        json_pattern = r'```json\s*([\s\S]*?)\s*```'
        json_match = re.search(json_pattern, response)
        
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON without code blocks
            json_pattern = r'\[\s*\{.*\}\s*\]'
            json_match = re.search(json_pattern, response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # Last resort, assume the entire response is JSON
                json_str = response
        
        try:
            data = json.loads(json_str)
            return data if isinstance(data, list) else []
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Response: {response}")
            return []
    
    def _remove_duplicates(self, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate skills by keeping the highest confidence version"""
        # Create a dictionary to store the highest confidence score for each skill
        skill_dict = {}
        
        # Process each skill
        for skill in skills:
            skill_name = skill.get('skill', '').lower()  # Normalize to lowercase
            confidence = skill.get('confidence', 0)
            
            # If this skill doesn't exist yet or has a higher confidence, update
            if skill_name not in skill_dict or confidence > skill_dict[skill_name].get('confidence', 0):
                skill_dict[skill_name] = skill
        
        # Convert back to list, sorting by confidence
        unique_skills = list(skill_dict.values())
        return sorted(unique_skills, key=lambda x: x.get('confidence', 0), reverse=True)
    
    def extract_skills_with_llm(self, resume_text: str) -> List[Dict[str, Any]]:
        """
        Extract technical skills from resume text using a local LLM
        
        Args:
            resume_text: The text content of the resume
            
        Returns:
            List of skills with confidence scores and domains
        """
        # Check cache first
        cache_key = self._generate_cache_key(resume_text)
        cached_result = self._get_from_cache(cache_key)
        
        if cached_result:
            return cached_result
        
        # Create prompt for skill extraction
        prompt = f"""
TASK:
Extract technical skills from the resume below. For each skill:
1. Provide a confidence score (1.0-5.0, where 5.0 is highest)
2. Categorize into one of these domains: "Software Engineering", "Data Science", "Machine Learning", "DevOps", "Web Development", or "Other"

GUIDELINES:
- Focus on specific technical skills (programming languages, frameworks, tools, platforms)
- Ignore soft skills, generic terms, and non-technical abilities
- Merge related skills (e.g., "Python programming" and "Python" should be just "Python")
- Use canonical forms of skills (e.g., "React.js" should be "React")
- Only include skills that appear to be part of the person's genuine expertise
- Assign confidence based on context (expertise claims, years of experience, projects, etc.)
- Exclude overly generic terms like "programming", "software", "tools", etc.
- Avoid duplicating skills in your response - each skill should appear exactly once

RESPONSE FORMAT:
Respond with a valid JSON array of objects with these properties:
- skill: The canonical skill name
- confidence: Numeric score from 1.0 to 5.0
- domain: One of the domain categories

RESUME:
{resume_text}

Remember to only return a valid JSON array with NO DUPLICATE SKILLS.
"""
        
        # Call LLM
        response = self._call_local_llm(prompt)
        
        # Parse response
        skills = self._parse_json_response(response)
        
        # Remove any duplicates that might still be present
        unique_skills = self._remove_duplicates(skills)
        
        # Save to cache
        self._save_to_cache(cache_key, unique_skills)
        
        return unique_skills
    
    def analyze_resume(self, file_bytes, file_type="pdf") -> List[Dict[str, Any]]:
        """
        Analyze a resume file and extract technical skills with confidence scores
        
        Args:
            file_bytes: The resume file as bytes
            file_type: The file type ('pdf', 'docx', or 'txt')
            
        Returns:
            List of skills with confidence scores and domains
        """
        # Extract text from resume
        text = self.extract_text_from_file(file_bytes, file_type)
        
        if not text:
            return []
        
        # Extract skills using LLM
        skills = self.extract_skills_with_llm(text)
        
        # Additional check to ensure no duplicates (in case LLM includes them despite instructions)
        unique_skills = self._remove_duplicates(skills)
        
        return unique_skills
    
    def get_skills_as_tuples(self, skills: List[Dict[str, Any]]) -> List[Tuple[str, float]]:
        """
        Convert skills dictionaries to a list of tuples (skill_name, confidence_score)
        
        Args:
            skills: List of skill dictionaries
            
        Returns:
            List of (skill_name, confidence_score) tuples
        """
        # Process each skill and create tuples
        skill_tuples = []
        seen_skills = set()
        
        for skill in skills:
            skill_name = skill.get('skill', 'Unknown')
            confidence = skill.get('confidence', 0)
            
            # Skip duplicates (case-insensitive)
            if skill_name.lower() in seen_skills:
                continue
                
            seen_skills.add(skill_name.lower())
            
            # Add to the list
            skill_tuples.append((skill_name, confidence))
            
        return skill_tuples
    
    def format_output(self, skills: List[Dict[str, Any]], include_domain=False, as_tuples=False) -> str:
        """Format the output of detected skills
        
        Args:
            skills: List of skill dictionaries with skill, domain, and confidence
            include_domain: Whether to include domain information in output
            as_tuples: Whether to format as a list of tuples
            
        Returns:
            Formatted string of skills with confidence scores
        """
        if not skills:
            return "No skills detected."
        
        if as_tuples:
            # Get skills as tuples and create string representation
            skill_tuples = self.get_skills_as_tuples(skills)
            return str(skill_tuples)
        
        # Traditional format
        seen_skills = set()
        lines = []
        
        for skill in skills:
            skill_name = skill.get('skill', 'Unknown')
            skill_lower = skill_name.lower()
            
            # Skip if we've already seen this skill
            if skill_lower in seen_skills:
                continue
                
            seen_skills.add(skill_lower)
            
            if include_domain:
                lines.append(f"{skill_name} ({skill.get('domain', 'Unknown')}) | Confidence: {skill.get('confidence', 0):.1f}")
            else:
                lines.append(f"{skill_name} | Confidence: {skill.get('confidence', 0):.1f}")
                
        return "\n".join(lines)


def analyze_resume_file(file_path, file_type="pdf", include_domain=False, model_path=None, as_tuples=False):
    """
    Analyze a resume file and extract technical skills using a local LLM
    
    Args:
        file_path: Path to the resume file
        file_type: File type ('pdf', 'docx', or 'txt')
        include_domain: Whether to include domain information in output
        model_path: Path to the GGUF model file
        as_tuples: Whether to return skills as a list of tuples
    
    Returns:
        Formatted string of skills with confidence scores or a list of tuples
    """
    analyzer = LocalLLMResumeAnalyzer(model_path=model_path)
    
    with open(file_path, "rb") as f:
        file_bytes = f.read()
        
    skills = analyzer.analyze_resume(file_bytes, file_type)
    
    if as_tuples:
        return analyzer.get_skills_as_tuples(skills)
    else:
        return analyzer.format_output(skills, include_domain)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze technical skills in a resume using a local LLM.')
    parser.add_argument('file_path', help='Path to the resume file')
    parser.add_argument('--file_type', default='pdf', help='File type (pdf, docx, txt)')
    parser.add_argument('--include_domain', action='store_true', help='Include domain information in output')
    parser.add_argument('--model_path', help='Path to the GGUF model file')
    parser.add_argument('--as_tuples', action='store_true', help='Output skills as a list of tuples')
    
    args = parser.parse_args()
    
    result = analyze_resume_file(
        args.file_path, 
        args.file_type, 
        args.include_domain,
        args.model_path,
        args.as_tuples
    )
    
    print(result)