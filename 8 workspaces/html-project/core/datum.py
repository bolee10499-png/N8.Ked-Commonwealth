class DatumReference:
    """Manages datum points and spatial anchors."""
    def __init__(self):
        self.datums = []
    def add_datum(self, name, position):
        self.datums.append({
            "name": name,
            "position": position
        })
    def get_datums(self):
        return self.datums
