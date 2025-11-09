class InterstitialSpaceManager:
    """Manages interstitial spaces between entities."""
    def __init__(self):
        self.spaces = []
    def add_space(self, between, properties):
        self.spaces.append({"between": between, "properties": properties})
    def get_spaces(self):
        return self.spaces
