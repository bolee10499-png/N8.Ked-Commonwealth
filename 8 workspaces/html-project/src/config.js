// Update these URLs after ngrok starts
// Check http://localhost:4040 for your URLs

export const API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://YOUR-NGROK-URL.ngrok.app'; // Update this after starting ngrok

export const APP_URL = import.meta.env.DEV
  ? 'http://localhost:3666'
  : 'https://YOUR-NGROK-URL.ngrok.app'; // Update this after starting ngrok

export const NGROK_AUTH = 'PBM65LQZ2V6EXS3UJECW5PC3HKMAIKBW';