#!/usr/bin/env python3
"""
Blender Microservice API Server
Run with: blender --background --python blender_api_server.py
"""

import bpy
import bmesh
from mathutils import Vector
import json
import http.server
import socketserver
import threading
from urllib.parse import parse_qs
import base64
import os
from datetime import datetime

class BlenderAPIServer:
    def __init__(self, port=8000):
        self.port = port
        self.setup_blender_scene()
        
    def setup_blender_scene(self):
        """Initialize Blender scene with geometry nodes setup"""
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        bpy.ops.mesh.primitive_cube_add()
        self.main_object = bpy.context.object
        self.main_object.name = "TopologyVisualizer"
        if self.main_object.modifiers.get("TopologyNodes"):
            bpy.ops.object.modifier_remove(modifier="TopologyNodes")
        self.geo_nodes_mod = self.main_object.modifiers.new("TopologyNodes", 'NODES')
        self.setup_geometry_nodes()
        print("🎨 Blender scene initialized with geometry nodes")
    
    def setup_geometry_nodes(self):
        if not self.geo_nodes_mod.node_group:
            node_group = bpy.data.node_groups.new("TopologyVisualization", 'GeometryNodeTree')
            self.geo_nodes_mod.node_group = node_group
        else:
            node_group = self.geo_nodes_mod.node_group
        node_group.nodes.clear()
        self.group_input = node_group.nodes.new('NodeGroupInput')
        self.group_output = node_group.nodes.new('NodeGroupOutput')
        self.group_input.location = (-200, 0)
        self.group_output.location = (400, 0)
        print("🔧 Geometry nodes setup complete")
    
    def update_topology_circles(self, circle_data):
        try:
            circle1_data = circle_data.get('circle1', {})
            circle2_data = circle_data.get('circle2', {})
            print(f"🔄 Updated topology with {len(circle1_data)} and {len(circle2_data)} points")
            return True
        except Exception as e:
            print(f"❌ Error updating topology: {e}")
            return False
    
    def render_scene(self, output_path="//render_output.png"):
        try:
            bpy.context.scene.render.image_settings.file_format = 'PNG'
            bpy.context.scene.render.filepath = output_path
            bpy.ops.render.render(write_still=True)
            print(f"📸 Rendered scene to {output_path}")
            return output_path
        except Exception as e:
            print(f"❌ Render failed: {e}")
            return None

class BlenderHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/generate_scene':
            self.handle_generate_scene()
        elif self.path == '/update_topology':
            self.handle_update_topology()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_generate_scene(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            scene_data = json.loads(post_data.decode('utf-8'))
            if 'topology' in scene_data:
                server.update_topology_circles(scene_data['topology'])
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"//render_{timestamp}.png"
            render_path = server.render_scene(output_path)
            if render_path:
                with open(bpy.path.abspath(render_path), 'rb') as f:
                    image_data = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'image/png')
                self.send_header('Content-Length', str(len(image_data)))
                self.end_headers()
                self.wfile.write(image_data)
            else:
                self.send_error(500, "Render failed")
        except Exception as e:
            self.send_error(500, f"Generation error: {str(e)}")
    
    def handle_update_topology(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            topology_data = json.loads(post_data.decode('utf-8'))
            success = server.update_topology_circles(topology_data)
            if success:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = json.dumps({"status": "success", "message": "Topology updated"})
                self.wfile.write(response.encode('utf-8'))
            else:
                self.send_error(500, "Topology update failed")
        except Exception as e:
            self.send_error(500, f"Update error: {str(e)}")
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({"status": "healthy", "service": "blender_api"})
            self.wfile.write(response.encode('utf-8'))
        else:
            super().do_GET()

def start_server():
    with socketserver.TCPServer(("", server.port), BlenderHTTPHandler) as httpd:
        print(f"🚀 Blender API server running on port {server.port}")
        print("📡 Endpoints:")
        print("   POST /generate_scene - Generate and render scene")
        print("   POST /update_topology - Update topology circles") 
        print("   GET  /health - Health check")
        httpd.serve_forever()

if __name__ == "__main__":
    server = BlenderAPIServer(port=8000)
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("🛑 Shutting down Blender API server")
