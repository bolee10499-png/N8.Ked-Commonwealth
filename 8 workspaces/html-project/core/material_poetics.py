class MaterialPoetics:
    """Models material poetics and expressive qualities."""
    def __init__(self):
        self.materials = []
    def add_material(self, name, poetic_quality):
        self.materials.append({"name": name, "poetic_quality": poetic_quality})
    def get_materials(self):
        return self.materials
