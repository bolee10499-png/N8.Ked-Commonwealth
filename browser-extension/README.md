# N8.KED - The Naked Authority
## Browser Extension (The Banner)

**No lies. No hype. No backdoors.**

This is not an app. It's a lens into your sovereign identity.

---

## Philosophy

**N8.KED** is a triple entendre:
- **N8** = Navigate (the journey to sovereignty)
- **KED** = Clicked (the connection that feels fated)
- **N8.KED** = Naked (radical transparency)

This extension is the **banner on the highway** - a lightweight tool that shows you:
- Your sovereign public key
- Your current reputation score
- Your percentile ranking
- Your verifiable claims count
- A button to visit the Capital (the dashboard)

It doesn't force you into a new app. It meets you where you are and shows you what's yours.

---

## Installation (Development)

1. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `browser-extension/` folder

2. **Configure API Endpoint:**
   - Edit `popup.js` line 9: Set `API_BASE` to your server URL
   - Edit `popup.js` line 197: Set dashboard URL for "Visit the Capital" button
   - Edit `background.js` line 24: Set API URL for background sync

3. **Test:**
   - Click the N8.KED icon in Chrome toolbar
   - Should display registration prompt if no key found
   - Register a sovereign key via the Capital dashboard
   - Extension will sync and display your identity

---

## Files

- **manifest.json**: Chrome extension configuration (Manifest V3)
- **popup.html**: Extension popup interface
- **popup.css**: Constitutional design system (parchment aesthetic)
- **popup.js**: Identity display logic
- **background.js**: Background sync service worker
- **icons/**: Extension icons (16x16, 48x48, 128x128)

---

## Design System

**Constitutional Aesthetic:**
- Parchment color palette (#faf8f3 background)
- Serif typography (Georgia, Palatino)
- Seal red (#8b2e2e) for authority
- Seal gold (#c9a961) for highlights
- Monospace fonts for cryptographic data

**The Glass House Principle:**
Every element is transparent about its purpose. No hidden tracking. No data collection. Just your sovereign identity, visible and verifiable.

---

## Chrome Web Store Listing

**Title:**
N8.KED - The Naked Authority

**Short Description:**
Your sovereign identity lens. See your reputation, verify your claims, visit the commonwealth. No lies. No hype. No backdoors.

**Category:**
Productivity

**Privacy Policy:**
This extension stores your sovereign public key locally. No data is sent to third parties. All API calls go to your chosen N8.KED commonwealth instance. The code is open source - see the Glass House.

**Screenshots Needed:**
1. Extension popup showing sovereign key and reputation
2. "Visit the Capital" button
3. Philosophy section ("No lies. No hype. No backdoors.")
4. Registration prompt for new users

---

## Roadmap

- [ ] Add notification badge for reputation changes
- [ ] Display recent claims in popup
- [ ] Show AI Observer alerts (whale activity, governance changes)
- [ ] Multi-commonwealth support (switch between instances)
- [ ] Export portable identity feature
- [ ] QR code for sovereign key sharing

---

## The Banner Philosophy

This extension is not an app. It's a **declaration.**

It says: "You are sovereign. Your identity is yours. The authority that governs you is naked - you can see every line of code, every rule, every transaction. There are no secrets here. Only law."

The banner doesn't trap you. It **invites** you. And the invitation feels like a two-kilometer walk to a place that was always just there, waiting.

**See the code. Join the commonwealth.**

---

*Built with radical transparency. Governed by constitutional law. Powered by the Foundational Sentinels.*
