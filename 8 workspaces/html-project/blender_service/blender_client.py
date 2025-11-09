import aiohttp
import json
import sys
from typing import Dict, Any

sys.path.append(r'C:\security_team')
import sys
sys.path.append(r'C:\security_team')
from orchestrator import SecurityOrchestrator

class BlenderClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None

    def module_states_to_topology(self, module_states, strand_states=None):
        """
        Convert 7-module and triple-helix data to Blender topology format.
        module_states: list of 7 floats/ints (one per module)
        strand_states: list of 3 floats/ints (triple-helix strands)
        Returns dict with 'circle1' and 'circle2' for Blender.
        """
        import math
        n = len(module_states)
        circle1 = []
        for i, value in enumerate(module_states):
            angle = 2 * math.pi * i / n
            x = math.cos(angle) * (5 + value)
            y = math.sin(angle) * (5 + value)
            circle1.append({'x': x, 'y': y, 'z': 0, 'value': value, 'module': f'module_{i}'})
        circle2 = []
        if strand_states:
            for i, value in enumerate(strand_states):
                t = i * 2 * math.pi / len(strand_states)
                x = math.cos(t) * (2 + value)
                y = math.sin(t) * (2 + value)
                z = value * 2
                circle2.append({'x': x, 'y': y, 'z': z, 'value': value, 'strand': f'strand_{i}'})
        return {'circle1': circle1, 'circle2': circle2}

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def health_check(self) -> bool:
        if self.session is None:
            self.session = aiohttp.ClientSession()
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                return response.status == 200
        except:
            return False

    async def generate_scene(self, topology_data: Dict[str, Any]) -> bytes:
        if self.session is None:
            self.session = aiohttp.ClientSession()
        payload = {
            "topology": topology_data
        }
        async with self.session.post(
            f"{self.base_url}/generate_scene",
            json=payload
        ) as response:
            if response.status == 200:
                return await response.read()
            else:
                error_text = await response.text()
                raise Exception(f"Blender API error: {error_text}")

    async def update_topology(self, circle1_data: list, circle2_data: list) -> bool:
        if self.session is None:
            self.session = aiohttp.ClientSession()
        payload = {
            "circle1": circle1_data,
            "circle2": circle2_data
        }
        async with self.session.post(
            f"{self.base_url}/update_topology", 
            json=payload
        ) as response:
            return response.status == 200
