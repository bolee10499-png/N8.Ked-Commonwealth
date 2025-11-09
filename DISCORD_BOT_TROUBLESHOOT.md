# Discord Bot Troubleshooting Guide

## Quick Fix Checklist

### 1. Check Discord Bot Token
```powershell
# Verify .env file has Discord token
cat .env | Select-String "DISCORD_TOKEN"
```

**If missing or says "your_discord_bot_token_here":**
- Go to https://discord.com/developers/applications
- Select your bot application
- Go to "Bot" section
- Click "Reset Token" and copy new token
- Add to .env: `DISCORD_TOKEN=your_actual_token_here`

---

### 2. Check Bot Permissions in Discord Server

**Required permissions:**
- ✅ Send Messages
- ✅ Use Slash Commands
- ✅ Embed Links
- ✅ Attach Files
- ✅ Read Message History
- ✅ Add Reactions

**Bot Invite Link (with correct permissions):**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025508416&scope=bot%20applications.commands
```

**Replace YOUR_CLIENT_ID** with your bot's Application ID from Discord Developer Portal

---

### 3. Enable Privileged Gateway Intents

Go to Discord Developer Portal → Your Bot → Bot Settings:
- ✅ Enable "SERVER MEMBERS INTENT"
- ✅ Enable "MESSAGE CONTENT INTENT"
- ✅ Enable "PRESENCE INTENT"

**Save changes** (important!)

---

### 4. Start the Bot

```powershell
# Start bot with logging
npm run dev

# Or directly:
node index.js
```

**Expected output:**
```
[N8KED_BOT] Initializing...
[N8KED_BOT] Registering slash commands...
[N8KED_BOT] ✓ Logged in as YourBotName#1234
[N8KED_BOT] ✓ Ready to serve 1 guilds
```

---

### 5. Test Slash Commands

In Discord server:
1. Type `/` - You should see bot commands in autocomplete
2. Try `/status` - Should show system health
3. Try `/help` - Should show command list

---

## Common Issues

### Issue: "Invalid Token"
**Cause:** Token in .env is wrong or expired  
**Fix:** 
```powershell
# Get fresh token from Discord Developer Portal
# Update .env:
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GhTvWx.actual_token_here
```

### Issue: Bot shows online but doesn't respond to slash commands
**Cause:** Commands not registered or bot missing permissions  
**Fix:**
```powershell
# Re-register slash commands
node discord/register_commands.js

# Check bot has "applications.commands" scope in invite
```

### Issue: "Missing Access" error
**Cause:** Bot doesn't have permission in that channel  
**Fix:**
- Right-click channel → Edit Channel → Permissions
- Add bot role with "Send Messages" and "Use Slash Commands"

### Issue: Bot crashes immediately
**Cause:** Missing dependencies or database  
**Fix:**
```powershell
# Reinstall dependencies
npm install

# Check if database exists
Test-Path database/n8ked.db

# If missing, initialize:
node database/init_db.js
```

---

## Manual Registration of Slash Commands

If slash commands aren't showing:

```powershell
# Create register_commands.js if it doesn't exist
node -e "
require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'status',
    description: 'Check N8.KED system health'
  },
  {
    name: 'help',
    description: 'Show available commands'
  },
  {
    name: 'reputation',
    description: 'Check your reputation score',
  },
  {
    name: 'dust',
    description: 'Check your dust balance',
  },
  {
    name: 'explore',
    description: 'Explore Inner World locations',
    options: [{
      name: 'location',
      description: 'Location to explore',
      type: 3,
      required: true
    }]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✓ Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
"
```

**Note:** You need `CLIENT_ID` in .env (your bot's Application ID)

---

## Verify Bot Configuration

```powershell
# Check all required env vars
cat .env

# Should have:
DISCORD_TOKEN=actual_token
OWNER_ID=your_discord_user_id
CLIENT_ID=bot_application_id (optional but recommended)
```

---

## Debug Mode

Start bot with full logging:

```powershell
$env:LOG_LEVEL="debug"
node index.js
```

Look for:
- ✓ "Logged in as..."
- ✓ "Ready to serve X guilds"
- ✗ Any error messages

---

## Nuclear Option (Full Reset)

If nothing works:

```powershell
# 1. Stop all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clear node modules
Remove-Item -Recurse -Force node_modules

# 3. Reinstall
npm install

# 4. Reset database
Remove-Item database/n8ked.db -ErrorAction SilentlyContinue
node database/init_db.js

# 5. Get fresh bot token from Discord Developer Portal

# 6. Update .env with new token

# 7. Start bot
npm run dev
```

---

## Contact Support

If still not working, provide:
1. Output of `npm run dev`
2. Content of .env (WITHOUT showing actual token)
3. Discord bot permissions screenshot
4. Any error messages

**The Herald will help debug the testimony engine.** 🏛️
