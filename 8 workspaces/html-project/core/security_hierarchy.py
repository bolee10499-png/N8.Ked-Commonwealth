class SecurityHierarchy:
    """Implements a nested hierarchy of security levels."""
    def __init__(self):
        self.levels = {}
    def add_level(self, name, parent=None):
        self.levels[name] = {"parent": parent, "children": []}
        if parent and parent in self.levels:
            self.levels[parent]["children"].append(name)
    def get_hierarchy(self):
        return self.levels
