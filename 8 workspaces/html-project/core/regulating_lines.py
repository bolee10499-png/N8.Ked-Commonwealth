class RegulatingLines:
    """Handles regulating lines logic for spatial organization."""
    def __init__(self):
        self.lines = []
    def add_line(self, start, end):
        self.lines.append({"start": start, "end": end})
    def get_lines(self):
        return self.lines
