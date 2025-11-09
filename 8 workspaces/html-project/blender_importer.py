import json
from topographical_circle import blender_nodes

def export_blender_nodes_to_json(filepath='blender_nodes.json'):
    with open(filepath, 'w') as f:
        json.dump(blender_nodes, f, indent=2)
    print(f'Blender nodes exported to {filepath}')

# Example usage: export nodes for Blender visualization
if __name__ == '__main__':
    export_blender_nodes_to_json()
