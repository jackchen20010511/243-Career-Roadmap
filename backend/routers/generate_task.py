import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import json
import os
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from models import Scheduled_Tasks, Learn_Skill, User_Goal

# Adjust imports according to your helper path
from utils.skill_extractor_helper.match_job_domain import matchJobDomain
from utils.schedule_generator_helper.embedding_model import embedding_model
from utils.schedule_generator_helper.module_generator import build_prereq_graph_from_edges, parse_prerequisite_edges, generate_modules
from utils.schedule_generator_helper.course_selection import suggest_courses
from utils.schedule_generator_helper.task_generator import schedule_all_modules

router = APIRouter(tags=["Generate Tasks"])

COURSE_DIR = "data/courses/"
DOMAIN_SKILL_DIR = "data/job_domain_skills.json"
SKILL_GRAPH_DIR = "data/skill_graph"

class GenerateScheduleRequest(BaseModel):
    user_id: int
    start_date: Optional[str] = None  # format: YYYY-MM-DD

@router.post("/")
async def generate_scheduled_tasks(req: GenerateScheduleRequest, db: Session = Depends(get_db)):
    try:
        goal = db.query(User_Goal).filter(User_Goal.user_id == req.user_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="User goal not found")
        target_position = goal.target_position
        total_weeks = goal.duration_weeks
        weekly_hours = goal.weekly_hours

        skills = db.query(Learn_Skill).filter(Learn_Skill.user_id == req.user_id).all()
        if not skills:
            raise HTTPException(status_code=404, detail="User skills not found")
        skill_list = [[s.skill_name, s.focus_score, s.confidence_score] for s in skills]

        learning_days = {
            "Monday": goal.isMonday,
            "Tuesday": goal.isTuesday,
            "Wednesday": goal.isWednesday,
            "Thursday": goal.isThursday,
            "Friday": goal.isFriday,
            "Saturday": goal.isSaturday,
            "Sunday": goal.isSunday,
        }

        # Parse start date or use tomorrow
        start_date = (
            datetime.strptime(req.start_date, "%Y-%m-%d")
            if req.start_date
            else datetime.today() + timedelta(days=1)
        )

        domain = matchJobDomain(target_position).lower()
        print(f"matched domain: {domain}")

        # Load course dataset
        print("started df")
        start_time = time.time()
        course_df = pd.read_csv(f"{COURSE_DIR}/{domain}.csv")
        end_time = time.time()
        print(f"df Execution time: {end_time - start_time:.4f} seconds")
        
        # Load skill graph for the given domain
        skill_graph_path = os.path.join(SKILL_GRAPH_DIR, f"{domain}.json")
        if not os.path.exists(skill_graph_path):
            raise FileNotFoundError(f"Skill graph not found for domain: {domain}")
        

        print("started graph")
        start_time = time.time()
        prereq_graph = build_prereq_graph_from_edges(parse_prerequisite_edges(skill_graph_path, skill_list))
        end_time = time.time()
        print(f"graph Execution time: {end_time - start_time:.4f} seconds")

        print("started modules")
        start_time = time.time()
        modules = generate_modules(skill_graph_path, domain, skill_list, total_weeks, weekly_hours, 0.4, 0.7)
        end_time = time.time()
        print(f"modules Execution time: {end_time - start_time:.4f} seconds")

        print("started courses")
        start_time = time.time()
        courses = suggest_courses(embedding_model, course_df, skill_list, total_weeks, weekly_hours,
                                  domain, modules, prereq_graph, portion=1)
        end_time = time.time()
        print(f"courses Execution time: {end_time - start_time:.4f} seconds")
        
        print("started tasks")
        start_time = time.time()
        tasks = schedule_all_modules(modules, start_date, weekly_hours, learning_days, courses, req.user_id)
        end_time = time.time()
        print(f"tasks Execution time: {end_time - start_time:.4f} seconds")
        # Insert into DB
        for task in tasks:
            db_task = Scheduled_Tasks(
                user_id=task["user_id"],
                module=task["module"],
                skill=task["skill"],
                date=task["date"],
                resource_name=task["resource_name"],
                resource_url=task["resource_url"],
                thumbnail_url=task['thumbnail_url'],
                start=task["start"],
                end=task["end"],
                status=task["status"]
            )            
            db.add(db_task)

        db.commit()

        return {"message": f"Scheduled {len(tasks)} tasks for user {req.user_id}", "tasks": tasks, "modules": modules, "courses": courses}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
