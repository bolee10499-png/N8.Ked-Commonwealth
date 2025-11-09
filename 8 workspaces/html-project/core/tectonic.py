class TectonicExpression:
    """Models tectonic expression in spatial structures."""
    def __init__(self):
        self.elements = []
    def add_element(self, element, force):
        self.elements.append({"element": element, "force": force})
    def get_expression(self):
        return self.elements
