from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, Text, Boolean, Time
from database import Base
from datetime import datetime

# ✅ Enum Types (Match DB Constraints)
from enum import Enum as PyEnum

class ResourceType(PyEnum):
    course = "course"
    book = "book"
    video = "video"
    project = "project"

class StudyStatus(PyEnum):
    pending = "pending"
    completed = "completed"
    skipped = "skipped"

class Weekday(PyEnum):
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"
    Sunday = "Sunday"

class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_login.id"), nullable=False)

    week = Column(Integer, nullable=False)
    day = Column(String(10), nullable=False)

    # 🔗 Resource Info (hybrid)
    learning_resource_id = Column(Integer, ForeignKey("learning_resource.id"), nullable=False)
    resource_name = Column(String(255), nullable=False)
    resource_url = Column(Text, nullable=False)

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    status = Column(String(20), default="pending")

# ✅ User Login Table
class User_Login(Base):
    __tablename__ = "user_login"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    security_question = Column(String(255), nullable=False)
    security_answer = Column(String(255), nullable=False)

# ✅ User Skill Table
class User_Skill(Base):
    __tablename__ = "user_skill"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_login.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    skill_level = Column(Float, nullable=False)  # Consider changing to Integer if needed

class User_Goal(Base):
    __tablename__ = "user_goal"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_login.id"), nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    weekly_hours = Column(Integer, nullable=False)
    target_position = Column(String(255), nullable=False)
    industry = Column(String(255), nullable=False)
    exp_level = Column(String(255), nullable=False)
    responsibility = Column(Text, nullable=True)
    
    # 🔹 Move study days to user_goal
    isMonday = Column(Boolean, default=False)
    isTuesday = Column(Boolean, default=False)
    isWednesday = Column(Boolean, default=False)
    isThursday = Column(Boolean, default=False)
    isFriday = Column(Boolean, default=False)
    isSaturday = Column(Boolean, default=False)
    isSunday = Column(Boolean, default=False)

    # 🔹 Integrate resume text into user_goal
    resume_text = Column(Text, nullable=True)  # Store extracted resume content

# ✅ Learning Resource Table
class Learning_Resource(Base):
    __tablename__ = "learning_resource"

    id = Column(Integer, primary_key=True, index=True)
    learn_skill_id = Column(Integer, ForeignKey("learn_skill.id"), nullable=False)
    resource_name = Column(String(255), nullable=False)
    resource_url = Column(String(500), nullable=False)
    thumbnail_url = Column(Text)  # ✅ Match TEXT field
    provider = Column(String(255))
    resource_type = Column(Enum(ResourceType), nullable=False)
    estimated_hours = Column(Float, nullable=False)
    completed_hours = Column(Float, default=0)
    price = Column(Float, default=0)

# ✅ Learn Skill Table
class Learn_Skill(Base):
    __tablename__ = "learn_skill"

    id = Column(Integer, primary_key=True, index=True)
    user_goal_id = Column(Integer, ForeignKey("user_goal.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    focus_score = Column(Float, nullable=False)

# ✅ Job Skill Table
class Job_Skill(Base):
    __tablename__ = "job_skill"

    id = Column(Integer, primary_key=True, index=True)
    user_goal_id = Column(Integer, ForeignKey("user_goal.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    importance_score = Column(Float, nullable=False)
