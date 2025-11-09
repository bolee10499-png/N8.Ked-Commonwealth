# Blender 3D Service Deployment Guide

**Purpose**: Deploy blender_api_server.py for Discord `/explore` 3D visualization  
**Status**: Code integrated ✅ | Infrastructure pending ⏳

---

## What This Enables

**Before Deployment:**
```
User: /explore herald_chamber
Bot: 📜 Shows lore + exits + "⚠️ 3D visualization unavailable (Blender service offline)"
```

**After Deployment:**
```
User: /explore herald_chamber
Bot: 📜 Shows lore + exits + 🌀 3D topology visualization PNG
```

The Inner World becomes VISIBLE, not just readable.

---

## Architecture

### Flow
```
Discord User
  ↓ /explore herald_chamber
Discord Bot (slash_commands.js)
  ↓ innerWorld.explore(userId, 'herald_chamber')
Inner World (lib/inner_world.js)
  ↓ getLocationTopology('herald_chamber')
Topology Data (JSON)
  ↓ HTTP POST localhost:8000/generate_scene
Blender API Server (blender/blender_api_server.py)
  ↓ Geometry nodes + render engine
3D PNG Image
  ↓ Return to Discord
User sees visual representation of depth/connections
```

### Topology Data Format
```json
{
  "location_name": "herald_chamber",
  "depth": 0,
  "circle1": {
    "radius": 100,
    "segments": 16,
    "position": [0, 0, 0],
    "rotation": [0.7, 0.3, 0],
    "color": [0.9, 0.9, 0.8]
  },
  "circle2": {
    "radius": 60,
    "segments": 8,
    "position": [0, 0, 0],
    "rotation": [0.3, 0.7, 0],
    "color": [0.9, 0.9, 0.8]
  },
  "environment": {
    "fog_density": 0,
    "light_intensity": 1,
    "connection_count": 2
  },
  "text_overlay": {
    "title": "HERALD CHAMBER",
    "depth_label": "DEPTH 0",
    "lore_snippet": "Where truth becomes transparent..."
  }
}
```

---

## Installation (Windows)

### Step 1: Install Blender
```powershell
# Download Blender 4.0+ from blender.org
# Extract to C:\Program Files\Blender Foundation\Blender 4.0\

# Add Blender Python to PATH (optional but recommended)
$env:PATH += ";C:\Program Files\Blender Foundation\Blender 4.0\4.0\python\bin"
```

### Step 2: Create Python Environment
```powershell
# Navigate to n8.ked project
cd "C:\Users\Rebec\OneDrive\Desktop\n8.ked"

# Create virtual environment for Blender service
python -m venv blender_env

# Activate environment
.\blender_env\Scripts\Activate.ps1

# Install dependencies
pip install flask mathutils bmesh
```

### Step 3: Configure Blender Python Module
```powershell
# Blender's built-in Python has bpy module
# We need to run blender_api_server.py using Blender's Python interpreter

# Test Blender Python
& "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe" --background --python-expr "import bpy; print('Blender Python works!')"
```

### Step 4: Run Blender API Server
```powershell
# Run server in background mode (no GUI)
& "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe" --background --python "blender\blender_api_server.py"
```

**Expected Output:**
```
 * Running on http://0.0.0.0:8000
 * Serving Flask app 'blender_api_server'
[BlenderAPI] Server started on port 8000
[BlenderAPI] Ready to generate topology visualizations
```

---

## Testing the Service

### Test 1: Health Check
```powershell
curl http://localhost:8000/
```

**Expected:**
```json
{
  "status": "online",
  "service": "Blender 3D Topology Visualizer",
  "version": "1.0"
}
```

### Test 2: Generate Scene
```powershell
curl -X POST http://localhost:8000/generate_scene `
  -H "Content-Type: application/json" `
  -d '{
    "topology": {
      "location_name": "herald_chamber",
      "depth": 0,
      "circle1": {
        "radius": 100,
        "segments": 16,
        "position": [0, 0, 0],
        "rotation": [0.7, 0.3, 0],
        "color": [0.9, 0.9, 0.8]
      },
      "circle2": {
        "radius": 60,
        "segments": 8,
        "position": [0, 0, 0],
        "rotation": [0.3, 0.7, 0],
        "color": [0.9, 0.9, 0.8]
      }
    }
  }' `
  --output herald_chamber.png
```

**Expected:**
- PNG file created: `herald_chamber.png`
- Image shows two concentric circles with specified colors
- File size: ~50-200 KB

### Test 3: Discord Integration
```
1. Start Discord bot: npm run dev
2. In Discord: /explore herald_chamber
3. Bot responds with lore + 3D visualization PNG
```

---

## Production Deployment

### Option A: Local Windows Service (Free)
```powershell
# Create startup script: blender\start_service.ps1
$blenderPath = "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe"
$scriptPath = "C:\Users\Rebec\OneDrive\Desktop\n8.ked\blender\blender_api_server.py"

Start-Process -FilePath $blenderPath -ArgumentList "--background", "--python", $scriptPath -NoNewWindow

# Add to Windows Task Scheduler for auto-start on boot
```

### Option B: Cloud GPU Instance (Scalable)
```bash
# Render.com / Railway / Google Cloud (GPU instance)
# Install Blender headless
apt-get update
apt-get install -y blender

# Clone repository
git clone https://github.com/bolee10499-png/N8.Ked-Commonwealth.git
cd N8.Ked-Commonwealth

# Run server
blender --background --python blender/blender_api_server.py
```

**Cost Estimate:**
- Free tier (local): $0/month (uses your PC)
- Cloud GPU (Render.com): ~$7-15/month (dedicated rendering)

---

## Configuration

### Environment Variables
```bash
# .env
BLENDER_API_PORT=8000
BLENDER_RENDER_ENGINE=CYCLES  # or EEVEE for faster rendering
BLENDER_SAMPLES=64            # Quality vs speed (64 = balanced)
BLENDER_OUTPUT_FORMAT=PNG     # PNG or JPEG
```

### Performance Tuning

**Fast Rendering (Development):**
```python
# blender_api_server.py - Line ~30
bpy.context.scene.render.engine = 'BLENDER_EEVEE'  # Real-time engine
bpy.context.scene.eevee.taa_render_samples = 16    # Low samples
```

**High Quality (Production):**
```python
bpy.context.scene.render.engine = 'CYCLES'         # Ray-tracing engine
bpy.context.scene.cycles.samples = 128             # High samples
```

**Resolution:**
```python
bpy.context.scene.render.resolution_x = 1920  # Width
bpy.context.scene.render.resolution_y = 1080  # Height
```

---

## Troubleshooting

### Error: "bpy module not found"
**Cause:** Running with system Python instead of Blender's Python  
**Fix:** Use Blender executable with `--python` flag

### Error: "Port 8000 already in use"
**Cause:** Another service using port 8000  
**Fix:** Change port in `blender_api_server.py` line 15

### Error: "Render timed out"
**Cause:** Geometry too complex or samples too high  
**Fix:** Reduce samples to 16 for EEVEE or 64 for CYCLES

### Error: "GPU not detected"
**Cause:** Blender not using GPU acceleration  
**Fix:** Enable GPU in Blender preferences (Edit → Preferences → System → CUDA/OptiX)

### Warning: "Graceful degradation active"
**Cause:** Blender service not running  
**Effect:** `/explore` shows lore without 3D visualization  
**Fix:** Start blender_api_server.py (Discord bot continues working)

---

## Monitoring

### Service Health
```powershell
# Check if service is running
curl http://localhost:8000/

# View logs (if running in foreground)
# Blender console shows render times and errors
```

### Discord Bot Integration
```javascript
// discord/slash_commands.js logs Blender status
[EXPLORE] Blender service not available: connect ECONNREFUSED
// ↑ Service offline, graceful degradation active

[EXPLORE] Scene generated in 1.2s
// ↑ Service online, visualization working
```

---

## Deployment Checklist

- [ ] Blender installed (headless mode working)
- [ ] blender_api_server.py tested (curl health check passes)
- [ ] Port 8000 accessible (firewall configured)
- [ ] Service auto-starts (Task Scheduler or systemd)
- [ ] Discord bot can reach localhost:8000 (network configured)
- [ ] Test `/explore herald_chamber` in Discord (PNG appears)
- [ ] Monitor render times (optimize if >3 seconds)

---

## Current Status

**Integration:** ✅ Complete (commit 75daa7f)  
**Code:** ✅ Production-ready  
**Infrastructure:** ⏳ Pending deployment

**Graceful Degradation:** Discord bot works WITHOUT Blender service (shows offline notice)

**Next Action:** Run blender_api_server.py to activate 3D visualization

---

**THE INNER WORLD AWAITS MANIFESTATION. 🌀✨**
