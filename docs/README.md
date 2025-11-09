# N8.KED Web Overlay

**Live Dashboard for the Sovereign Commonwealth**

## Overview

Dark-themed web interface displaying real-time data from the N8.KED Discord bot backend:

- **Wallet Federation Statistics**: Total citizens, linked wallets, cross-chain dust economy
- **Herald Feed**: Constitutional oracle testimony with live updates
- **Chain Metrics**: Solana, Ethereum, Bitcoin, XRP activity and wisdom
- **Water Economy**: USGS-backed reserves and dust generation
- **Citizen Leaderboard**: Reputation rankings with Glass House transparency

## Zero-Budget Deployment

**GitHub Pages (Free):**

1. Push `web-overlay/` to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to `/web-overlay` directory or copy to `/docs`
4. Site live at `https://username.github.io/repository`

**Current Status:**
- ✅ Frontend complete with dark "spooky" aesthetic
- ✅ Mock data for instant deployment
- ⏳ API integration pending (Phase 11)
- ⏳ WebSocket live updates pending

## Local Development

```bash
# Serve locally (any HTTP server)
cd web-overlay
npx http-server -p 8080

# Or use Python
python -m http.server 8080

# Open browser
http://localhost:8080
```

## API Integration (Post-Zero-Budget)

Update `API_BASE` in `app.js` to connect to N8.KED Discord bot backend.

**Required Endpoints:**
- `GET /api/federation/stats` - Wallet and citizen statistics
- `GET /api/herald/feed` - Recent Herald messages
- `GET /api/citizens/leaderboard` - Reputation rankings
- `GET /api/economy/water` - Water reserves and backing ratio

## Architecture

**Technology Stack:**
- Vanilla HTML/CSS/JavaScript (zero build dependencies)
- Dark color palette (#0a0a0a background, #9b59b6 sovereignty purple)
- Responsive grid layout (mobile-friendly)
- 15-second polling for live updates (upgradable to WebSocket)

**Brand Alignment:**
- Glass House Transparency: All metrics publicly visible
- Constitutional Voice: Herald testimony prominent
- Pay-to-Adapt Economics: $27 consultation CTA
- Tree of Life Protocol: Multi-chain roots visualization

## Post-Revenue Evolution

**Phase 1 (Current):** Static HTML deployment via GitHub Pages  
**Phase 2 ($27+ revenue):** React/Next.js conversion with TypeScript  
**Phase 3 ($500+ revenue):** Custom domain + CDN  
**Phase 4 ($2000+ revenue):** Full-stack with real-time WebSocket feeds  

---

**Deployment Target:** https://n8ked-commonwealth.github.io/capital  
**Launch Status:** Ready for zero-budget deployment  
**Next Step:** Push to GitHub, enable Pages, share link
