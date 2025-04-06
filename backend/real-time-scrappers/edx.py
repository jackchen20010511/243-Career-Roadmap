from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import pandas as pd
import os
import time

def scrapeEdx(search_key):
    driver_path = "243-Career-Roadmap/backend/chromedriver-win64/chromedriver.exe"
    driver_path = os.path.abspath(driver_path)
    service = Service(driver_path)
    options = webdriver.ChromeOptions()
    options.add_argument("--lang=en-US")  # Force browser to load English
    options.add_argument("--headless")  # Run in headless mode (no GUI)
    # Initialize the WebDriver
    browser = webdriver.Chrome(service=service, options=options)
    browser.get(f"https://www.edx.org/search?q={search_key}&tab=course&page=1")

    time.sleep(1)

    divs = browser.find_elements(By.CSS_SELECTOR, "div.flex.justify-center a.no-underline")
    data = []
    for div in divs:
        if div:
            link = "https://www.edx.org" + browser.execute_script("return arguments[0].getAttribute('href');", div) if div else None

            img_tag = div.find_elements(By.CSS_SELECTOR, "img.m-0.rounded-t-xl.object-cover")
            img_text = browser.execute_script("return arguments[0].getAttribute('srcset');", img_tag[0]) if img_tag else None
            img = "https://www.edx.org" + str.split(img_text, " ")[0] if img_text else None

            title_tag = div.find_elements(By.CSS_SELECTOR, "span.font-bold.text-base.m-0.break-words.line-clamp-3")
            title = browser.execute_script("return arguments[0].textContent;", title_tag[0]) if title_tag else None

            partner_tag = div.find_elements(By.CSS_SELECTOR, "p.text-sm.mt-1.mb-0.truncate.font-normal")
            partner = browser.execute_script("return arguments[0].textContent;", partner_tag[0]) if partner_tag else None

            course = {
                "link": link,
                "img": img,
                "title": title,
                "partner":partner
            }

            data.append(course)
    browser.quit()
    return pd.DataFrame(data)



    