# api/check_and_add_user.py
import os
import requests
from instagrapi import Client
from dotenv import load_dotenv
from instagrapi.types import Story, UserShort

load_dotenv()

# Instagram and Airtable configuration
IG_USERNAME = os.getenv("IG_USERNAME")
IG_PASSWORD = os.getenv("IG_PASSWORD")
IG_CREDENTIAL_PATH = "./ig_settings.json"
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = "appcfPr9gkxX9wbty"
TABLE_NAME = "Table 1"
FIELD_NAME = "User"

class Bot:
    _cl = None

    def __init__(self):
        self._cl = Client()
        if os.path.exists(IG_CREDENTIAL_PATH):
            self._cl.load_settings(IG_CREDENTIAL_PATH)
            self._cl.login(IG_USERNAME, IG_PASSWORD)
        else:
            self._cl.login(IG_USERNAME, IG_PASSWORD)
            self._cl.dump_settings(IG_CREDENTIAL_PATH)

    def get_story_viewer_names(self):
        story_list = self._cl.user_stories(self._cl.account_info().pk)
        story_viewers = []
        for story in story_list:
            user_list = self._cl.story_viewers(story.pk)
            for user in user_list:
                story_viewers.append(user.full_name)
        return story_viewers

def check_and_add_user_to_airtable(value):
    # Airtable setup
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    params = {"filterByFormula": f"FIND('{value}', {{{FIELD_NAME}}})"}
    response = requests.get(url, headers=headers, params=params)
    response_data = response.json()

    if not response_data.get("records"):
        data = {"fields": {FIELD_NAME: value}}
        response = requests.post(url, headers=headers, json={"records": [data]})
        if response.status_code == 200:
            return f"Added '{value}' to Airtable."
        else:
            return f"Failed to add value: {response.json()}"
    return "User already exists in Airtable."

def handler(request):
    bot = Bot()
    viewer_names = bot.get_story_viewer_names()
    
    for name in viewer_names:
        result = check_and_add_user_to_airtable(name)
        if "Added" in result:
            return {
                "statusCode": 200,
                "body": result
            }
    
    return {
        "statusCode": 200,
        "body": "All viewers are already in Airtable."
    }
