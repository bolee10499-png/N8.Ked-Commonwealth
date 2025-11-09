class FigureGroundReversal:
    """Handles figure-ground reversal logic."""
    def __init__(self):
        self.figures = []
        self.grounds = []
    def add_figure(self, figure):
        self.figures.append(figure)
    def add_ground(self, ground):
        self.grounds.append(ground)
    def reverse(self):
        self.figures, self.grounds = self.grounds, self.figures
    def get_state(self):
        return {"figures": self.figures, "grounds": self.grounds}
