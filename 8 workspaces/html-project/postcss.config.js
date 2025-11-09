import json

# Example: generate geometry node data (replace with your real data)
nodes = [
    {
        "core_id": "circle_1",
        "points": [(1, 2), (2, 3), (3, 1), (1, 2)]
    },
    {
        "core_id": "fiber_1",
        "data": [(0, 0), (1, 2), (2, 4), (3, 6)]
    }
]

with open("blender_nodes.json", "w") as f:
    json.dump(nodes, f)
print("Exported geometry nodes for Blender.")
