# Centralized configuration and secrets loader for HTML Project
import os

class Config:
    HTML_BOT_TOKEN = os.getenv('HTML_BOT_TOKEN')
    SECRETS_PATH = r"c:\Secrets"
