class HiveMind:
    """Simulates hive mind logic and collective intelligence."""
    def __init__(self):
        self.nodes = []
    def add_node(self, node_id, state):
        self.nodes.append({"id": node_id, "state": state})
    def get_shared_state(self):
        if not self.nodes:
            return None
        # Example: average state
        return sum(n["state"] for n in self.nodes) / len(self.nodes)
