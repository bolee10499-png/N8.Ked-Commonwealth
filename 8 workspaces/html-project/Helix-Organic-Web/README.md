# Helix Organic Web

A multi-page organic interface scaffold exploring the Helix governance metaphor across research, commerce, and immersive dashboards.

## Structure

```
Helix-Organic-Web/
├── index.html
├── pages/
│   ├── about.html
│   ├── networkai.html
│   ├── vision.html
│   ├── projects.html
│   ├── docs.html
│   ├── blog.html
│   ├── lab.html
│   ├── store.html
│   ├── dashboard.html
│   └── contact.html
├── assets/
│   ├── css/
│   │   ├── theme.css
│   │   └── animations.css
│   ├── js/
│   │   ├── main.js
│   │   ├── three-scene.js
│   │   ├── gsap-transitions.js
│   │   └── webhook.js
│   ├── fonts/
│   ├── images/
│   └── shaders/
├── api/
│   ├── stripe.js
│   └── discord.js
└── README.md
```

## Getting Started

1. Install dependencies in the root folder (`npm install`).
2. Serve the folder locally (`npm start`) and open `http://localhost:3000`.
3. In `/api`, run `npm install` then start the bridge server (`npm start`).
4. Populate `assets/images/`, `assets/fonts/`, and `assets/shaders/` as the design evolves.
5. Configure `.env` in `/api` with `BOT_TOKEN` and `CHANNEL_ID` so dashboard signals reach Discord.

## Notes

- Navigation uses relative paths so all pages share the same header.
- JavaScript modules (`three-scene.js`, `gsap-transitions.js`) ship with placeholders for future immersive features.
- CSS highlights a dark, bioluminescent-inspired aesthetic consistent with the Helix theme.
- Shared constants (`config/constants.json`) provide math-driven configuration for both frontend and API layers.
