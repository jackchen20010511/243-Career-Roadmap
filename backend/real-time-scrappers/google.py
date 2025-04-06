import requests
import pandas as pd

def scrapeGoogle(search_key):
    url = f"https://www.googleapis.com/books/v1/volumes?q={search_key}"  # No API key needed

    response = requests.get(url)
    data = response.json()

    count = 0
    idx = 0
    result =[]
    while count < 5:
        book = data.get("items", [])[idx]
        info = {
            "title" : book["volumeInfo"].get("title", "No title available"),
            "authors" : book["volumeInfo"].get("authors", ["Unknown author"]),
            "publisher" : book["volumeInfo"].get("publisher", "Unknown publisher"),
            "image" : book["volumeInfo"].get("imageLinks", "No Image").get("thumbnail", "No Image"),
            "previewLink" : book["volumeInfo"].get("previewLink", "No Link"),
            "rating" : book["volumeInfo"].get("averageRating", "No Rating"),
            "num_rating" : book["volumeInfo"].get("ratingsCount", "No Num_Rating"),
            "pdf" : book["accessInfo"].get("pdf", "No PDF").get("isAvailable", "No PDF")
        }
        if info["pdf"]:
            result.append(info)
            count += 1
        idx += 1
    return pd.DataFrame(result)


