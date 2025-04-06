import requests
from bs4 import BeautifulSoup
from random import choice
import pandas as pd

def scrapeCoursera(search_key):
    session = requests.Session()
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]
    # Fake user-agent to mimic a real browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/"
    }
    headers["User-Agent"] = choice(user_agents)

    # Amazon product search URL (modify based on what you're looking for)
    url = f"https://www.coursera.org/search?query={search_key.replace(' ', '%20')}"

    # Send GET request
    response = session.get(url, headers=headers)
    # Check response
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
    else:
        print(f"Failed to fetch page, status code: {response.status_code}")

    # Find all product containers
    course_divs = soup.find_all('div', class_= "cds-ProductCard-gridCard")
    # Extract information
    data = []
    for div in course_divs:
        if div:
            # Extract course image link
            img_div = div.find("div", class_="cds-CommonCard-previewImage")
            img_tag = img_div.find("img") if img_div else None
            img_link = img_tag['src'] if img_tag else None

            #Extract Link
            link_div = div.find("a", class_="cds-119 cds-113 cds-115 cds-CommonCard-titleLink css-vflzcf cds-142")
            link = "https://www.coursera.org" + link_div['href'] if link_div else None

            # Extract partner name
            partner_tag = div.find('p', class_='cds-ProductCard-partnerNames css-vac8rf')
            partner = partner_tag.text.strip() if partner_tag else None

            # Extract course title
            title_tag = div.find('h3', class_='cds-CommonCard-title css-6ecy9b')
            title = title_tag.text.strip() if title_tag else None

            # Extract skills
            skill_div = div.find("div", class_="cds-ProductCard-body")
            skill_tag = skill_div.find('p', class_="css-vac8rf") if skill_div else None
            text = skill_tag.find_all(string=True, recursive=False) if skill_tag else None
            skill = [word.strip() for word in "".join(text).strip().split(",")] if text else None


            # Extract rating
            rating_tag = div.find('span', class_='css-6ecy9b')
            rating = float(rating_tag.text.strip()) if rating_tag else None

            def convert_reviews(text):
                text = text.replace("reviews", "").strip()  # Remove "reviews" and trim spaces
                if "K" in text:
                    return int(float(text.replace("K", "")) * 1000)  # Convert "2.1K" → 2100
                return int(text)  # Convert normal numbers

            # Extract number of reviews
            num_review_div = div.find("div", class_="cds-CommonCard-ratings")
            num_review_tag = num_review_div.find('div', class_='css-vac8rf') if num_review_div else None
            num_review = convert_reviews(num_review_tag.text.strip()) if num_review_tag else None

            # Extract course info
            info_div = div.find("div", class_="cds-CommonCard-metadata")
            info_tag = info_div.find('p', class_='css-vac8rf') if info_div else None
            info = info_tag.text.strip() if info_tag else None
            # Allowed difficulty levels
            difficulty_levels = {"Beginner", "Intermediate", "Advanced", "Mixed"}
            # Duration keywords
            duration_units = {"Weeks", "Months", "Hours"}
            def extract_info(text):
                parts = [part.strip() for part in text.split("·")]  # Split by '·' and clean spaces
                # Default buckets
                difficulty, course_type, duration = None, None, None
                for part in parts:
                    part = part.replace(" Â", "")
                    if part in difficulty_levels:
                        difficulty = part  # Assign as difficulty
                    elif any(unit in part for unit in duration_units):  # Check for duration keywords
                        duration = part
                    else:
                        course_type = part  # Assign as type if it's neither difficulty nor duration
                return difficulty, course_type, duration
            difficulty, course_type, duration = extract_info(info) if info else (None, None, None)
            
            # Append extracted data
            data.append({
                'link':link,
                'image_link': img_link,
                'partner': partner,
                'title': title,
                'course_skill': skill,
                'rating': rating,
                'num_review': num_review,
                'difficulty': difficulty,
                'course_type': course_type,
                'duration': duration
            })
    return pd.DataFrame(data)


