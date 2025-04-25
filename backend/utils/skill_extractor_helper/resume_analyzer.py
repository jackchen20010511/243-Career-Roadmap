import re
import json
import os
from typing import Dict, List, Any, Optional, Tuple
import fitz  # PyMuPDF
import hashlib
from llama_cpp import Llama
import torch

class LocalLLMResumeAnalyzer:
    """
    A resume analyzer using locally running LLMs to extract technical skills,
    assign confidence scores, and categorize by domain.
    """
    
    def __init__(self, model_path=None, use_cache=False):
        self.model_path = model_path or "Nous-Hermes-2-Mistral-7B-DPO.Q4_K_M.gguf"
        self._initialize_model()

    def _initialize_model(self):
        """Initialize the local LLM with CPU-only settings."""
        try:
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=3000,          # reduce context window (faster, less memory)
                n_threads=os.cpu_count(),  # auto-assign based on CPU
                use_mmap=False,      # faster load, especially on SSD
                use_mlock=False,     # allow paging for better memory efficiency
                verbose=False
            )
            print(f"[LLM] Initialized on CPU: {self.model_path}")
        except Exception as e:
            print(f"[LLM] Initialization error: {e}")
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
    
    def _call_local_llm(self, prompt: str) -> str:
        if not self.llm:
            raise RuntimeError("Model not initialized.")
        system = "You are an expert resume analyzer."
        instr  = f"[INST] {system}\n{prompt} [/INST]"
        resp = self.llm(
            instr,            # pass a string, not bytes
            max_tokens=512,
            temperature=0.1,
            top_p=0.9,
        )
        return resp["choices"][0]["text"]
        
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
    
    def extract_skills_with_llm(self, skill_list, resume_text: str) -> List[Dict[str, Any]]:
        """
        Extract technical skills from resume text using a local LLM
        
        Args:
            resume_text: The text content of the resume
            
        Returns:
            List of skills with confidence scores and domains
        """
        
        # Create prompt for skill extraction

        prompt = f"""
TASK:
You are an expert AI tasked with analyzing resumes to evaluate the candidate's demonstrated proficiency in each technical skill from a predefined list.
Your objective is to assign a **confidence score between 0.0 and 100.0** for each skill in the SKILL LIST, reflecting how well that skill is evidenced in the RESUME.
No explanations or commentary are allowed — **output only the JSON array**.

SCORING GUIDELINES (for each skill):
**100.0** - Extensive, clearly demonstrated expertise (e.g. multiple job roles, advanced projects, certifications, tools or libraries tied to the skill)
**75.0 - 99.9** - Strong, practical usage (e.g. used in key projects, listed in responsibilities, paired with related tools or platforms)
**50.0 - 74.9** - Moderate or partial exposure (e.g. mentioned once or used as a supporting tool, course or internship)
**25.0 - 49.9** - Light familiarity or vague mention (e.g. in a course list, minor project, or soft skill grouping)
**0.0 - 24.9** - No evidence or only superficial mention (e.g. resume includes unrelated topics or lacks any mention)

EVIDENCE TO CONSIDER:
- **Direct mentions**: skills listed explicitly in work experience, education, certifications, or project descriptions
- **Indirect indicators**: tools or frameworks tightly associated with a skill (e.g. “Pandas” implies some Python; “Spring Boot” implies Java)
- **Depth signals**: frequency of mention, job title relevance (e.g. “Data Scientist” implies Python + ML), verbs like *built, led, optimized*
- **Recency and context**: Recent and active usage counts more than passive learning or outdated experience
- Avoid guessing. If a skill appears indirectly, give partial confidence — do not assume full proficiency unless clearly justified by the resume.

SKILL LIST:
{skill_list}

RESUME:
{resume_text}

RESPONSE FORMAT:
Respond with a single valid JSON array of objects with these properties:
- skill: The canonical skill name
- confidence: Numeric score from 0.0 to 100.0

Remember to only return a valid JSON array.
"""

        
        # Call LLM
        response = self._call_local_llm(prompt)
        # Parse response
        skills = self._parse_json_response(response)
        
        # Remove any duplicates that might still be present
        unique_skills = self._remove_duplicates(skills)
        
        return unique_skills
    
    def analyze_resume(self, skill_list, file_bytes, file_type="pdf") -> List[Dict[str, Any]]:
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
        skills = self.extract_skills_with_llm(skill_list, text)
        
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


def analyze_resume_file(file_path, file_type="pdf", skill_list=[], model_path=None):
    """
    Analyze a resume file and extract technical skills using a local LLM
    
    Args:
        file_path: Path to the resume file
        file_type: File type ('pdf', 'docx', or 'txt')
        skill_list: Skill list from job market
        model_path: Path to the GGUF model file
    
    Returns:
        Formatted string of skills with confidence scores or a list of tuples
    """
    analyzer = LocalLLMResumeAnalyzer(model_path=model_path, use_cache=False)
    
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    skills = analyzer.analyze_resume(skill_list, file_bytes, file_type)

    return analyzer.get_skills_as_tuples(skills)