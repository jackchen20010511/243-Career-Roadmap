# 243-Career-Roadmap

## 1. clone project
git clone (http link here)

cd 243-Career-Roadmap

## 2️. Create a Separate Branch (Recommended)
git checkout -b (your branch name)

## 3️. Set Up the Backend (FastAPI) navigate to backend folder in terminal
cd backend

python -m venv venv

## 4. Activate the Virtual Environment
Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

## 5. Install Backend Dependencies
pip install -r requirements.txt

## 6. Create .env File for Backend and paste api keys
touch .env (not needed now)

## ✅ Backend is now set up!

## 7. start backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000

## 8. Set Up the Frontend (Next.js) navigate to frontend folder in terminal
cd frontend

npm install

touch .env.local (not needed now)

## ✅ Frontend is now set up!

## 9. start frontend
npm run dev
