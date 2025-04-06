import requests
from dotenv import load_dotenv
import os
import pandas as pd

def scrapeGitHub(skill):

    load_dotenv()
    GITHUB_TOKEN = os.getenv("GITHUB_API_KEY")
    GITHUB_API_URL = "https://api.github.com/search/repositories"

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    params = {
        "q": f"{skill} project in:readme,description",
        "sort": "stars",
        "order": "desc",
        "per_page": 5
    }
    
    response = requests.get(GITHUB_API_URL, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        projects = []
        for item in data["items"]:
            projects.append({
                "name": item["name"],
                "avatar": item["owner"]["avatar_url"],
                "url": item["owner"]["html_url"],
                "watcher": item["watchers"],
                "description": item["description"]
            })
        return projects
    else:
        return {"error": f"Failed to fetch data: {response.status_code}"}
