from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from requests import Session
from database import engine, Base
from routers import user_login, user_goal, learn_skill, scheduled_tasks, generate_task, generate_skills  # ✅ Ensure correct imports
import fitz

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.mount("/resumes", StaticFiles(directory="./data/uploaded_resumes"), name="resumes")

# ✅ CORS Configuration (Allow Frontend to Access API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routers (Matches `api.ts` structure)
app.include_router(user_login.router, prefix="/user-login")  # ✅ Matches API_BASE_URL in frontend
app.include_router(user_goal.router, prefix="/user-goal")    # ✅ Matches frontend API calls
app.include_router(learn_skill.router, prefix="/learn-skill")
app.include_router(scheduled_tasks.router, prefix="/scheduled-tasks")
app.include_router(generate_task.router, prefix="/generate-scheduled-tasks")
app.include_router(generate_skills.router, prefix="/generate-learn-skills")

# ✅ Root Endpoint (Optional)
@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}
