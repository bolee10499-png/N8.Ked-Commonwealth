class SpaceChoreographer:
    """Handles the choreography of space, movement, and spatial logic."""
    def __init__(self):
        self.movements = []
    def add_movement(self, entity, from_pos, to_pos, time):
        self.movements.append({
            "entity": entity,
            "from": from_pos,
            "to": to_pos,
            "time": time
        })
    def get_choreography(self):
        return self.movements
