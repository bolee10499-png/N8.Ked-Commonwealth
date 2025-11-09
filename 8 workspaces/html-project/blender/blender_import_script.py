import bpy
import json

# Load exported geometry nodes from JSON
with open('blender_nodes.json', 'r') as f:
    nodes = json.load(f)

# Example: create mesh objects for each node
for node in nodes:
    if 'points' in node:
        # Create a circle mesh from points
        mesh = bpy.data.meshes.new(f"Circle_{node['core_id']}")
        obj = bpy.data.objects.new(f"Circle_{node['core_id']}", mesh)
        bpy.context.collection.objects.link(obj)
        verts = [(x, y, 0) for x, y in node['points']]
        edges = [(i, (i+1)%len(verts)) for i in range(len(verts))]
        mesh.from_pydata(verts, edges, [])
    elif 'data' in node:
        # Create a polyline for fiber or helix
        mesh = bpy.data.meshes.new("FiberOrHelix")
        obj = bpy.data.objects.new("FiberOrHelix", mesh)
        bpy.context.collection.objects.link(obj)
        verts = [(i, strand[0], strand[1] if len(strand)>1 else 0) for i, strand in enumerate(node['data'])]
        edges = [(i, i+1) for i in range(len(verts)-1)]
        mesh.from_pydata(verts, edges, [])

print("Imported geometry nodes into Blender.")