from unittest.mock import Base
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from requests import Session
from sqlalchemy import Engine
from routers import user_login, user_goal  # ✅ Ensure correct imports
import fitz

app = FastAPI()

Base.metadata.create_all(bind=Engine)

app.mount("/resumes", StaticFiles(directory="uploaded_resumes"), name="resumes")

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

# ✅ Root Endpoint (Optional)
@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    doc = fitz.open(stream=await file.read(), filetype="pdf")
    text = "\n".join([page.get_text("text") for page in doc])

    return {"text": text}
