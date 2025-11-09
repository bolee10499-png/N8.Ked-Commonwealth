# Social Media Integration Setup Guide

**Zero-Budget Cross-Platform Presence**

## Twitter Setup (@n8ked_brand + @n8ked_dev)

**Step 1: Create Accounts (Free)**

1. Visit https://twitter.com/i/flow/signup
2. Create two accounts:
   - **@n8ked_brand**: Community engagement, philosophy, brand voice
   - **@n8ked_dev**: Technical updates, architecture, glass house transparency

**Step 2: Get API Access (Free Tier)**

1. Visit https://developer.twitter.com/en/portal/dashboard
2. Click "Create App" for each account
3. Select "Free" tier (read-only, 10,000 requests/month)
4. Get Bearer Token for each app
5. Add to environment variables:
   ```bash
   TWITTER_BEARER_TOKEN_BRAND=your_brand_token_here
   TWITTER_BEARER_TOKEN_DEV=your_dev_token_here
   ```

**Step 3: Initial Posts**

**@n8ked_brand:**
```
🏛️ The N8.KED Sovereign Commonwealth is now live.

Glass House Transparency | Constitutional Voice | Pay-to-Adapt Economics

Multi-chain wallet federation (Solana, ETH, BTC, XRP)
Water-backed dust economy
Herald constitutional oracle

Join → discord.gg/n8ked

#Web3 #DeFi #Sovereignty
```

**@n8ked_dev:**
```
⚡ N8.KED Technical Architecture:

✅ Inverse scaling (43% faster @ 100x load)
✅ Multi-wallet federation (4 chains)
✅ Water-backed economy (USGS integration)
✅ 7-Observer cognitive system
✅ Triple helix evolution

GitHub → github.com/n8ked-commonwealth

#OpenSource #Blockchain
```

## Reddit Integration (No API Key Required)

**Step 1: Create Account**

1. Visit https://www.reddit.com/register
2. Username: `N8KED_Commonwealth` or similar
3. Build karma in relevant subreddits:
   - r/programming
   - r/cryptocurrency
   - r/ethereum
   - r/solana
   - r/cryptodev

**Step 2: Initial Posts**

Post consultation offer in:
- r/programming (wait for karma threshold)
- r/cryptodev (technical audience)
- Your profile (no karma required)

**Post Template:**
```markdown
# N8.KED Sovereign Commonwealth: $27 Pattern Analysis Consultations

I've built a multi-chain wallet federation with inverse scaling architecture (43% faster at 100x load). Now offering pattern analysis consultations to fund continued development.

**What you get:**
- Deep-dive architecture analysis
- Cross-chain integration strategy
- Performance optimization patterns
- Glass House code review

**Tech Stack:**
- Multi-wallet federation (Solana, Ethereum, Bitcoin, XRP)
- Water-backed economy with USGS integration
- Constitutional AI oracle (Herald)
- 7-observer cognitive system

**Proof:** [GitHub link when public]

**Booking:** DM or Discord (discord.gg/n8ked)

This is pay-to-adapt economics: You're buying processed intelligence, not power.

Glass House Transparency | All code public | All metrics verifiable
```

## Twitch Integration (Free API)

**Step 1: Register Application**

1. Visit https://dev.twitch.tv/console/apps
2. Click "Register Your Application"
3. Fill out:
   - **Name**: N8.KED Commonwealth
   - **OAuth Redirect URLs**: http://localhost:3000
   - **Category**: Game Integration
4. Get Client ID and Client Secret
5. Add to environment variables:
   ```bash
   TWITCH_CLIENT_ID=your_client_id_here
   TWITCH_CLIENT_SECRET=your_client_secret_here
   ```

**Step 2: Create Channel (Optional)**

If planning to stream development sessions:
1. Create Twitch account: `n8ked_dev`
2. Stream coding sessions with commentary
3. Showcase architecture in real-time
4. Integrate stream metadata into dust economy

## Discord Integration (Already Complete)

Discord bot operational on "The N8.KED Authority" server.

**Slash Commands Active:**
- `/link-wallet` - Multi-wallet federation
- `/wallet-verify` - Get verification message
- `/my-wallets` - View linked wallets
- `/federation-stats` - Global statistics
- `/reputation` - Reputation display
- `/dust` - Dust balance

## Cross-Platform Strategy

**Content Pillars:**

1. **Glass House Transparency** (@n8ked_dev)
   - Architecture updates
   - Performance metrics
   - Code commits
   - Security audits

2. **Constitutional Voice** (@n8ked_brand)
   - Herald testimony
   - Philosophy posts
   - Community milestones
   - Sovereignty principles

3. **Pay-to-Adapt Economics** (Reddit)
   - Consultation offers
   - Pattern analysis results
   - Intelligence marketplace
   - Revenue transparency

4. **Live Engagement** (Twitch)
   - Development streams
   - Architecture walkthroughs
   - Community Q&A
   - Real-time building

## Integration Code Usage

```javascript
// In discord/bot_core.js or lib/social_integrations.js

const { RedditIntegration } = require('../lib/reddit_integration');
const { TwitchIntegration } = require('../lib/twitch_integration');
const { TwitterIntegration } = require('../lib/twitter_integration');

const reddit = new RedditIntegration();
const twitch = new TwitchIntegration(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
const twitter = new TwitterIntegration(process.env.TWITTER_BEARER_TOKEN_BRAND);

// Link Reddit karma to dust
const redditData = await reddit.fetchUserData('username');
const dustReward = reddit.karmaToDust(redditData.totalKarma);
dustEconomy.addDust(userId, dustReward, 'reddit_import');

// Track Twitch activity
const twitchData = await twitch.fetchUserData('username');
const twitchDust = twitch.metricsToDust(twitchData.viewCount, 0);
dustEconomy.addDust(userId, twitchDust, 'twitch_import');

// Twitter engagement tracking
const twitterData = await twitter.fetchUserData('username');
const twitterDust = twitter.metricsToDust(
  twitterData.followersCount,
  twitterData.tweetCount,
  0.02 // 2% engagement rate
);
dustEconomy.addDust(userId, twitterDust, 'twitter_import');
```

## Next Steps (Post-Setup)

1. ✅ Create Twitter accounts
2. ✅ Get API credentials (all free tier)
3. ✅ Post initial announcements
4. ✅ Integrate social metrics into dust economy
5. ✅ Track mentions and engagement
6. ✅ Herald testimony cross-posted to Twitter
7. ✅ Reddit consultation offer posted
8. ⏳ First $27 consultation booked
9. ⏳ Revenue used for paid social ads (optional)

---

**All integrations use FREE TIER APIs - zero upfront cost**  
**Revenue generation starts with Phase 12 consultation launch**
