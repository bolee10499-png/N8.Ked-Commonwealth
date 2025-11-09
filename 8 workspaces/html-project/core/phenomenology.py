class PhenomenologyAnalyzer:
    """Analyzes phenomenological aspects of space and experience."""
    def __init__(self):
        self.events = []
    def log_event(self, event, perception):
        self.events.append({"event": event, "perception": perception})
    def get_events(self):
        return self.events
