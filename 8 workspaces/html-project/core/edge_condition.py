class EdgeConditionDetector:
    """Detects and manages edge conditions in spatial logic."""
    def __init__(self):
        self.edges = []
    def add_edge(self, location, type):
        self.edges.append({"location": location, "type": type})
    def get_edges(self):
        return self.edges
