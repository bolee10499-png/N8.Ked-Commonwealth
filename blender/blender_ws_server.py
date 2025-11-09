# blender_ws_server.py
# WebSocket server for real-time topology updates in Blender
# Run with: blender --background --python blender_ws_server.py

import bpy
import asyncio
import websockets
import json
import threading

PORT = 8765

async def handle_ws(websocket, path):
    print(f"WebSocket connection established: {path}")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get('type') == 'topology_update':
                # Update Blender scene with new topology data
                # (Stub: replace with real update logic)
                print(f"Received topology update: {data.get('circles')}")
                # Optionally, trigger a render or update geometry nodes here
                await websocket.send(json.dumps({'type': 'scene_ready', 'scene_path': 'render.png'}))
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed.")

# Start the WebSocket server in a background thread

def start_ws_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    ws_server = websockets.serve(handle_ws, 'localhost', PORT)
    print(f"Blender WebSocket server running on ws://localhost:{PORT}")
    loop.run_until_complete(ws_server)
    loop.run_forever()

if __name__ == "__main__":
    ws_thread = threading.Thread(target=start_ws_server)
    ws_thread.daemon = True
    ws_thread.start()
    # Keep Blender running
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("🛑 Shutting down Blender WebSocket server")
