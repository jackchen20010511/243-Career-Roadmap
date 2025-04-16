import random
import traceback
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User_Goal, Learn_Skill
import os
import json

# Helpers
from utils.skill_extractor_helper.calculate_skill_importance import calculate_skill_importance


router = APIRouter(tags=["Generate Skills"])

UPLOAD_DIR = "data/uploaded_resumes"

class GenerateSkillsRequest(BaseModel):
    user_id: int

def add_confidence_scores(skills):
    return [
        [skill[0], skill[1], round(random.uniform(3, 5) * 2) / 2]  # Ensures 0.5 step increments
        for skill in skills
    ]

def normalize_skills(skills: list[list]) -> list[list]:
    """
    Normalize focus_score (sum to 1) and confidence_score (scale to 0–1) 
    for a list of [skill_name, focus_score, confidence_score] items.
    """
    total_focus = sum(s[1] for s in skills)
    max_conf = max(s[2] for s in skills) if skills else 1

    return [
        [
            s[0],
            round(s[1] / total_focus, 2) if total_focus > 0 else 0.0,
            round(s[2] / max_conf, 2) if max_conf > 0 else 0.0
        ]
        for s in skills
    ]

@router.post("/")
def generate_skills(req: GenerateSkillsRequest, db: Session = Depends(get_db)):
    try:
        # 1. Load user goal
        goal = db.query(User_Goal).filter(User_Goal.user_id == req.user_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="User goal not found")
        target_position = goal.target_position
        responsibility = goal.responsibility
        industry = goal.industry
        seniority_level = goal.exp_level

        llm_output = "Technical Skills:\n- Python\nSkill application: Develop Python-based analysis capabilities" \
        " for resiliency testbed\nTechnical skill type: language\n- Java\nSkill application: Develop Java-based" \
        " applications for data processing and adaptation\nTechnical skill type: language\n- Angular\nSkill" \
        " application: Develop web app front ends in Angular\nTechnical skill type: tool\n- Json\nSkill" \
        " application: Experience with JSON for data processing\nTechnical skill type: concept\n- Protobuf\nSkill" \
        " application: Experience with Protobufs for data serialization\nTechnical skill type: tool\n- Maven\nSkill" \
        " application: Experience with Maven for project management\nTechnical skill type: tool\n- Agile" \
        " Software Development\nSkill application: Experience in Agile software development practices\nTechnical" \
        " skill type: methodology\n- Docker\nSkill application: Experience developing deployment pipelines using" \
        " Docker\nTechnical skill type: tool\n- Ansible\nSkill application: Experience in infrastructure automation" \
        " with Ansible\nTechnical skill type: tool\n- TerraForm\nSkill application: Experience in infrastructure" \
        " configuration with Terraform\nTechnical skill type: tool\n- Elastic Stack\nSkill application: Experience" \
        " with Elastic Stack for data analysis\nTechnical skill type: tool\n- Apache Nifi\nSkill application:" \
        " Experience with Apache NIFI for data flow management\nTechnical skill type: tool\n- Unit Testing\nSkill" \
        " application: Experience in unit testing for software quality assurance\nTechnical skill type:" \
        " methodology\n- Integration Testing\nSkill application: Experience in integration testing for software" \
        " quality assurance\nTechnical skill type: methodology\n- ActiveMQ\nSkill application: Experience with" \
        " ActiveMQ for message-oriented middleware\nTechnical skill type: tool\n- Kafka\nSkill application: Experience" \
        " with Kafka for distributed streaming platforms\nTechnical skill type: tool"

        result = calculate_skill_importance(llm_output, target_position, seniority_level)
        skill_scores = result["skill_scores"]
        domain = result["domain"]

        skill_scores = add_confidence_scores(skill_scores)

        # Normalize scores to sum to 1.0
        normalized_skills = normalize_skills(skill_scores)

        db.query(Learn_Skill).filter(Learn_Skill.user_id == req.user_id).delete()

        for skill in normalized_skills:
            db.add(Learn_Skill(
                user_id=req.user_id,
                skill_name=skill[0],
                focus_score=skill[1],
                confidence_score=skill[2]
            ))

        db.commit()
        
        return {"message": f"Generated {len(normalized_skills)} skills for user {req.user_id}", "skills": normalized_skills}

    except Exception as e:
        db.rollback()
        print("🔥 Exception occurred:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))