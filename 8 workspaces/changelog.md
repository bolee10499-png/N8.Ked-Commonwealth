# Changelog

## 2025-10-24

### sup.dep (Revision Support Bot)
- Established dedicated Discord application identity "sup.dep" for the Revision control framework.
- Documented environment variables required for Python bot (`DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `REVISION_GUILD_ID`, `REVISION_CHANNEL_ID`).
- Provided matching `.env` guidance for the Node bridge (`BOT_TOKEN`, `CHANNEL_ID`, `ALLOWED_ORIGINS`, `PORT`).
- Confirmed coexistence strategy alongside N8.bot within the same guild and channel safeguards.

### N8.bot
- Clarified that N8.bot remains active as the legacy automations agent with no configuration changes.
- Noted separation of responsibilities: N8.bot retains original workloads while sup.dep handles Revision control and growth throttling.

### Workspace & Process Notes
- Completed accessibility and performance overhaul for Helix Organic Web (shared scaffold, WCAG-compliant palette, deferred scripts).
- Logged instructions for obtaining Discord credentials, running Lighthouse (Chrome DevTools & CLI), and renaming the Revision bot entity.
- Recorded conversation decisions regarding bot naming, dual-bot strategy, and changelog maintenance.
