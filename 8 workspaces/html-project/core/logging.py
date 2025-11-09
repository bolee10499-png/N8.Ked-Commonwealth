# Logging and audit trail for HTML Project
import logging

logging.basicConfig(filename='html_project.log', level=logging.INFO)

def log_event(event):
    logging.info(f"EVENT: {event}")

def log_error(error):
    logging.error(f"ERROR: {error}")
