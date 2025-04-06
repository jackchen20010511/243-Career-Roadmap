# Re-import necessary libraries after execution state reset
import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
import pandas as pd
from isodate import parse_duration

def scrapeYoutube(search_key):
    # Reload API Key from .env file
    load_dotenv()
    API_KEY = os.getenv("YOUTUBE_API_KEY")

    # Initialize YouTube API client
    youtube = build("youtube", "v3", developerKey=API_KEY)

    def get_video_details(video_ids):
        """Fetch likes, channel IDs, duration, and descriptions for each video."""
        request = youtube.videos().list(
            part="snippet,statistics,contentDetails",
            id=",".join(video_ids)  # Pass multiple video IDs
        )
        response = request.execute()

        video_data = {}
        for item in response.get("items", []):
            video_id = item["id"]
            likes = item["statistics"].get("likeCount", "N/A")
            channel_id = item["snippet"]["channelId"]
            description = item["snippet"].get("description", "No description available")
            duration = parse_duration(item["contentDetails"]["duration"]).total_seconds() if "duration" in item["contentDetails"] else "N/A"

            video_data[video_id] = {
                "likes": likes,
                "channel_id": channel_id,
                "description": description,
                "duration": duration
            }
        
        return video_data

    def get_channel_subscribers(channel_ids):
        """Fetch subscriber count for each channel."""
        request = youtube.channels().list(
            part="statistics",
            id=",".join(set(channel_ids))  # Avoid duplicate requests
        )
        response = request.execute()

        channel_data = {}
        for item in response.get("items", []):
            channel_id = item["id"]
            subs = item["statistics"].get("subscriberCount", "N/A")
            channel_data[channel_id] = subs
        
        return channel_data

    def search_videos(search_query, max_results=10):
        """Search for YouTube videos and fetch likes, subscribers, duration, and descriptions."""
        request = youtube.search().list(
            part="snippet",
            q=search_query,
            type="video",
            maxResults=max_results,
            order="relevance"
        )
        response = request.execute()

        video_ids = []
        video_details = []

        for item in response.get("items", []):
            video_id = item["id"]["videoId"]
            video_ids.append(video_id)

            video_details.append({
                "Video ID": video_id,
                "Title": item["snippet"]["title"],
                "Channel": item["snippet"]["channelTitle"],
                "Published At": item["snippet"]["publishedAt"],
                "URL": f"https://www.youtube.com/watch?v={video_id}"
            })

        # Fetch Likes, Channel IDs, Duration, and Descriptions
        video_data = get_video_details(video_ids)

        # Fetch Subscribers using Channel IDs
        channel_ids = [video_data[v]["channel_id"] for v in video_ids if v in video_data]
        channel_data = get_channel_subscribers(channel_ids)

        # Add Likes, Subscribers, Duration, and Description to Video Details
        for video in video_details:
            vid_id = video["Video ID"]
            video["Likes"] = video_data.get(vid_id, {}).get("likes", "N/A")
            video["Description"] = video_data.get(vid_id, {}).get("description", "No description available")
            video["Duration (Seconds)"] = video_data.get(vid_id, {}).get("duration", "N/A")
            channel_id = video_data.get(vid_id, {}).get("channel_id", "")
            video["Subscribers"] = channel_data.get(channel_id, "N/A")

        return pd.DataFrame(video_details)

    df_videos = search_videos(search_key, max_results=10)
    return df_videos