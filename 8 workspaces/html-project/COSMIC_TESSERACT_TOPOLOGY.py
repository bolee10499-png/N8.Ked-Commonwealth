# COSMIC_TESSERACT_TOPOLOGY.py
# ...existing code...

# Save render to tesseract_render.png for Discord bot automation
import bpy
bpy.context.scene.render.filepath = r"C:\html-project\tesseract_render.png"
bpy.ops.render.render(write_still=True)
