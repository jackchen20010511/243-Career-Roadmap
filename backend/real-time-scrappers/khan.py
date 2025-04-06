from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import pandas as pd
import os
import time

def scrapeKhan(search_key):
    driver_path = "243-Career-Roadmap/backend/chromedriver-win64/chromedriver.exe"
    driver_path = os.path.abspath(driver_path)
    service = Service(driver_path)
    options = webdriver.ChromeOptions()
    options.add_argument("--lang=en-US")  # Force browser to load English
    options.add_argument("--headless")  # Run in headless mode (no GUI)
    # Initialize the WebDriver
    browser = webdriver.Chrome(service=service, options=options)
    browser.get(f"https://www.khanacademy.org/search?page_search_query={search_key}&content_kinds=Topic")

    time.sleep(1)

    link_tag = browser.find_elements(By.CSS_SELECTOR, "div._16owliz9 a._xne4a47")
    link = "https://www.khanacademy.org/" + browser.execute_script("return arguments[0].getAttribute('href');", link_tag[0]) if link_tag else None

    img_tag = browser.find_elements(By.CSS_SELECTOR, "div._16owliz9 div._zg4g6mb img._10znikg")
    img = browser.execute_script("return arguments[0].getAttribute('src');", img_tag[0]) if img_tag else None

    title_tag = browser.find_elements(By.CSS_SELECTOR, "div._16owliz9 div._pxfwtyj div._2dibcm7")
    title = browser.execute_script("return arguments[0].textContent;", title_tag[0]) if title_tag else None

    des_tag = browser.find_elements(By.CSS_SELECTOR, "div._16owliz9 div._pxfwtyj span._w68pn83")
    des = browser.execute_script("return arguments[0].textContent;", des_tag[0]) if des_tag else None

    course = {
        "link": link,
        "img": img,
        "title": title,
        "description":des
    }

    browser.quit()
    return pd.DataFrame([course])



    