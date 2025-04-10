import json
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User_Goal
from pydantic import BaseModel
from typing import Optional
from caches.goal_cache import (
    get_cached_user_goal,
    cache_user_goal,
    clear_user_goal_cache,
    clear_all_user_goal_cache,
)

UPLOAD_DIR = "./data/uploaded_resumes"


router = APIRouter(tags=["User Goal"])


# ✅ Request Model
class GoalRequest(BaseModel):
    target_position: str
    industry: str
    exp_level: str
    duration_weeks: int
    weekly_hours: int
    isMonday: bool
    isTuesday: bool
    isWednesday: bool
    isThursday: bool
    isFriday: bool
    isSaturday: bool
    isSunday: bool
    resume_text: Optional[str]  # Can be None
    responsibility: Optional[str]


# ✅ Fetch User Goal
@router.get("/{user_id}")
def get_user_goal(user_id: int, db: Session = Depends(get_db)):
    cached = get_cached_user_goal(user_id)
    if cached:
        goal = jsonable_encoder(cached)
        print(goal["exp_level"])
        return goal
    
    goal = db.query(User_Goal).filter(User_Goal.user_id == user_id).first()
    if not goal:
        return None
    cache_user_goal(user_id, goal)
    return goal


# ✅ Update or Create User Goal
@router.post("/{user_id}")
def update_user_goal(user_id: int, request: GoalRequest, db: Session = Depends(get_db)):
    goal = db.query(User_Goal).filter(User_Goal.user_id == user_id).first()
    if goal:
        for field, value in request.model_dump().items():
            setattr(goal, field, value)
    else:
        goal = User_Goal(user_id=user_id, **request.model_dump())
        db.add(goal)

    db.commit()
    # ✅ Refresh cache after DB commit
    cache_user_goal(user_id, goal)

    return {"message": "User goal updated successfully!"}

@router.get("/get-resume-url/{user_id}")
def get_resume_url(user_id: int):
    user_dir = os.path.join(UPLOAD_DIR, str(user_id))
    file_path = os.path.join(user_dir, "resume.pdf")

    if os.path.exists(file_path):
        return {"url": f"/resumes/{user_id}/resume.pdf"}
    else:
        return JSONResponse(status_code=404, content={"message": "Resume not found."})
    
@router.post("/save-resume/{user_id}")
async def save_resume(user_id: int, file: UploadFile = File(...)):
    # ✅ Create directory for the user if it doesn't exist
    user_dir = os.path.join(UPLOAD_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)

    # ✅ Save file
    file_path = os.path.join(user_dir, "resume.pdf")
    file_bytes = await file.read()
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return {"message": "Resume saved successfully."}

@router.post("/remove-resume/{user_id}")
async def remove_resume(user_id: int):
    user_dir = os.path.join(UPLOAD_DIR, str(user_id))
    file_path = os.path.join(user_dir, "resume.pdf")

    # ✅ Check and delete file
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "Resume removed successfully."}
    else:
        return {"message": "No resume found for this user."}