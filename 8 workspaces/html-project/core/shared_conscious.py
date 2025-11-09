class SharedConscious:
    """Models a shared conscious state among entities."""
    def __init__(self):
        self.thoughts = []
    def broadcast_thought(self, thought):
        self.thoughts.append(thought)
    def get_collective_thoughts(self):
        return self.thoughts
