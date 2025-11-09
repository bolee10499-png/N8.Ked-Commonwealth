class SerialityManager:
    """Handles seriality and sequence logic."""
    def __init__(self):
        self.sequence = []
    def add_step(self, step):
        self.sequence.append(step)
    def get_sequence(self):
        return self.sequence
