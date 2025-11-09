# blender_ws_client.py
# WebSocket client for sending real-time topology updates to Blender
import asyncio
import websockets
import json

class BlenderWSClient:
    def __init__(self, ws_url='ws://localhost:8765'):
        self.ws_url = ws_url
        self.websocket = None

    async def connect(self):
        self.websocket = await websockets.connect(self.ws_url)
        print(f"Connected to Blender WebSocket at {self.ws_url}")

    async def send_topology_update(self, circle_data):
        if not self.websocket:
            await self.connect()
        message = json.dumps({
            'type': 'topology_update',
            'circles': circle_data
        })
        await self.websocket.send(message)
        print(f"Sent topology update: {circle_data}")
        # Optionally, wait for scene_ready response
        response = await self.websocket.recv()
        data = json.loads(response)
        if data.get('type') == 'scene_ready':
            print(f"Scene ready: {data.get('scene_path')}")
        return data

    async def close(self):
        if self.websocket:
            await self.websocket.close()
            print("WebSocket connection closed.")

# Example usage
if __name__ == "__main__":
    async def main():
        client = BlenderWSClient()
        await client.connect()
        # Dummy circle data
        circle_data = {
            'circle1': [{'x': 0, 'y': 0, 'z': 0, 'value': 1}],
            'circle2': [{'x': 5, 'y': 5, 'z': 0, 'value': 2}]
        }
        await client.send_topology_update(circle_data)
        await client.close()
    asyncio.run(main())
