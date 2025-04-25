import requests


def extractGoalSkills(api_url, title, level, industry, responsibility):
    if responsibility:
        res = [industry] + responsibility.split(",")
    else:
        res = [industry]
    payload = {
        "job_title": title,
        "experience_level": level,
        "responsibilities": res
    }

    response = requests.post(api_url, json=payload)

    if response.status_code != 200:
        print(f"[❌ ERROR] Request failed with status: {response.status_code}")
        print(f"[📭 BODY] Response: {response.text}")
        return []

    try:
        json_data = response.json()
        return json_data.get("predicted_skills", "")
    except Exception as e:
        print(f"[🔥 JSON ERROR] Could not parse response: {e}")
        print(f"[📭 RAW TEXT] {response.text}")
        return []