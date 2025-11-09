import asyncio
from blender_client import BlenderClient

async def test_connection():
    async with BlenderClient() as blender:
        healthy = await blender.health_check()
        print(f"✅ Blender API healthy: {healthy}")
        test_topology = {
            "circle1": [{"x": 0, "y": 0, "z": 0, "value": 1}],
            "circle2": [{"x": 5, "y": 5, "z": 0, "value": 2}]
        }
        try:
            image_data = await blender.generate_scene(test_topology)
            with open("test_output.png", "wb") as f:
                f.write(image_data)
            print("✅ Test render successful - check test_output.png")
        except Exception as e:
            print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
