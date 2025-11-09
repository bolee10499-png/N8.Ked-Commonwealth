class FieldConditions:
    """Models field conditions and spatial algorithms."""
    def __init__(self):
        self.conditions = []
    def add_condition(self, condition, value):
        self.conditions.append({"condition": condition, "value": value})
    def get_conditions(self):
        return self.conditions
