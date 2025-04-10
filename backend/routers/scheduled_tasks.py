from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Scheduled_Tasks
from typing import List
from pydantic import BaseModel
from caches.scheduled_tasks_cache import (
    get_cached_tasks,
    cache_tasks,
    clear_task_cache
)

router = APIRouter(tags=["Scheduled Tasks"])

class TaskRequest(BaseModel):
    user_id: int
    week: int
    day: str
    resource_name: str
    resource_url: str
    start_time: str  # format HH:MM
    end_time: str    # format HH:MM
    status: str

class TaskResponse(BaseModel):
    user_id: int
    week: int
    day: str
    resource_name: str
    resource_url: str
    start_time: str
    end_time: str
    status: str

    class Config:
        from_attributes = True  

@router.get("/{user_id}", response_model=List[TaskResponse])
def get_scheduled_tasks(user_id: int, db: Session = Depends(get_db)):
    cached = get_cached_tasks(user_id)
    if cached:
        return cached

    tasks = db.query(Scheduled_Tasks).filter(Scheduled_Tasks.user_id == user_id).all()
    if not tasks:
        return []

    cache_tasks(user_id, tasks)
    return tasks

# ✅ Replace all existing scheduled tasks for user
@router.post("/{user_id}")
def update_scheduled_tasks(user_id: int, request: List[TaskRequest], db: Session = Depends(get_db)):
    db.query(Scheduled_Tasks).filter(Scheduled_Tasks.user_id == user_id).delete()
    db.commit()

    new_tasks = [Scheduled_Tasks(**task.model_dump()) for task in request]
    db.add_all(new_tasks)
    db.commit()

    clear_task_cache(user_id)
    return {"message": "Scheduled tasks updated successfully!", "user_id": user_id, "tasks_added": len(new_tasks)}
