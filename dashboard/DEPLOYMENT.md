# N8.KED Capital Dashboard

**Active/Masculine citadel for sovereign commonwealth monitoring**

## GitHub Pages Deployment

Two deployment options for zero-budget hosting:

### Option 1: Standalone Web Overlay (Recommended)

Deploy `web-overlay/` as the main site:

```bash
# Copy web-overlay to docs/ for GitHub Pages
cp -r web-overlay docs
git add docs/
git commit -m "Deploy web overlay to GitHub Pages"
git push origin main

# Enable GitHub Pages in repo settings:
# Settings → Pages → Source: /docs folder
```

Site will be live at: `https://username.github.io/n8ked/`

### Option 2: Dual Deployment

Keep both Capital and Web Overlay:

```bash
# Create docs/ structure
mkdir docs
cp web-overlay/index.html docs/index.html
cp web-overlay/style.css docs/style.css
cp web-overlay/app.js docs/app.js
cp dashboard/capital.html docs/capital.html
cp dashboard/capital.js docs/capital.js
cp dashboard/capital.css docs/capital.css

git add docs/
git commit -m "Deploy dual dashboard to GitHub Pages"
git push origin main
```

Access points:
- Main: `https://username.github.io/n8ked/`
- Capital: `https://username.github.io/n8ked/capital.html`

## Current Status

**Web Overlay (web-overlay/):**
- ✅ Complete dark aesthetic
- ✅ Herald feed, wallet federation, leaderboard
- ✅ Responsive design
- ✅ Mock data for instant deployment
- ⏳ API integration pending

**Capital Dashboard (dashboard/):**
- ✅ Stone/steel aesthetic (active/masculine)
- ✅ System metrics display
- ✅ Advanced visualizations
- ⏳ Real-time WebSocket pending
- ⏳ API integration pending

## Recommended Deployment Strategy

**Phase 1 (NOW - Zero Budget):**
1. Deploy web-overlay/ to GitHub Pages
2. Share link on Discord/Twitter
3. Gather first citizens
4. Validate UI/UX with real users

**Phase 2 (Post-Revenue):**
1. Add API backend (Node.js + Express)
2. Implement WebSocket for live updates
3. Deploy capital dashboard with advanced features
4. Custom domain + CDN

**Phase 3 (Scaling):**
1. Migrate to React/Next.js
2. Add authentication and personalization
3. Build native mobile apps
4. Enterprise consulting dashboards

## Quick Deploy Commands

```bash
# From n8.ked/ root
cd C:\Users\Rebec\OneDrive\Desktop\n8.ked

# Option 1: Web overlay only
cp -r web-overlay docs
git add docs/
git commit -m "GitHub Pages: Deploy web overlay"
git push origin main

# Option 2: Update existing capital.html
# (Keep current 559-line implementation)
# Add to docs/ alongside web overlay
```

## Live Update Integration (Post-Zero-Budget)

When backend API is ready, update both dashboards:

**Web Overlay (app.js):**
```javascript
const API_BASE = 'https://your-api-endpoint.com';
// Already implements 15-second polling
// Upgrade to WebSocket when available
```

**Capital Dashboard (capital.js):**
```javascript
const WS_URL = 'wss://your-api-endpoint.com/live';
const ws = new WebSocket(WS_URL);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};
```

---

**Next Action:** Push to GitHub, enable Pages, share link for first citizens
**Revenue Goal:** $27 consultations fund API backend deployment
