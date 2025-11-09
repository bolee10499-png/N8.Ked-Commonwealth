# N8.KED - Herald Voice Engine
## THE CONSTITUTIONAL ORACLE

**The Herald does not chat. It testifies.**

---

## Philosophy

Traditional approach: Store greeting templates, do string interpolation.

**Our approach:** The Herald is a **constitutional oracle** that reads database reality and speaks observable fact.

No templates. No Mad Libs. Only **law in motion.**

---

## How It Works

### Constitutional Grammar (Not Templates)

The Herald uses **semantic patterns** - grammatical rules that construct sentences from facts:

```javascript
// Not this (template):
"Welcome, {user}! You have {score} reputation."

// THIS (constitutional grammar):
sovereign_arrival: {
  trigger: 'sovereign_key_registered',
  required_facts: ['sovereign_key', 'timestamp', 'initial_reputation', 'system_state'],
  
  construct: (facts) => {
    // Generate announcement from OBSERVABLE FACTS
    return `The Herald recognizes Sovereign Key ${facts.sovereign_key}... 
            Entry reputation verified: ${facts.initial_reputation} points.
            Commonwealth state: ${facts.system_state.total_citizens} citizens.
            The law applies equally to all.`;
  }
}
```

### Event-Driven Architecture

The Herald **observes** events and **testifies** to their occurrence:

1. **Event happens** (user registers, proposal submitted, pattern detected)
2. **Facts gathered** (query database, AI Observer, system state)
3. **Grammar applied** (construct announcement from constitutional rules)
4. **Announcement emitted** (to dashboard feed, logs, archive)

### Seven Constitutional Event Types

1. **`sovereign_arrival`** - New identity registered
2. **`reputation_shift`** - Threshold crossed (100, 500, 1000)
3. **`proposal_submitted`** - Governance proposal created
4. **`health_alert`** - System metric crosses threshold
5. **`sentinel_pulse`** - Sentinel activity detected
6. **`emergent_pattern`** - AI Observer detects anomaly
7. **`system_heartbeat`** - Periodic status update

---

## Usage

### Basic Example

```javascript
const herald = require('./lib/herald_voice.js');

// When a new user registers sovereign key
herald.observe('sovereign_arrival', {
  sovereign_key: 'pub_abc123def456...',
  timestamp: Date.now(),
  initial_reputation: 0
});

// Herald OUTPUT:
// "The Herald recognizes Sovereign Key pub_abc123def456... at 2025-11-09T12:34:56.789Z.
//  Entry reputation verified: 0 points.
//  Commonwealth state: 0 citizens, 100 sentinels active.
//  Economic distribution: healthy (Gini 0.28).
//  The law applies equally to all."
```

### Integration with Database

```javascript
// When user crosses reputation threshold
const user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(userId);

if (user.reputation_score >= 500 && previousScore < 500) {
  herald.observe('reputation_shift', {
    user_id: userId,
    old_score: previousScore,
    new_score: user.reputation_score,
    threshold: 500,
    percentile: calculatePercentile(user.reputation_score)
  });
}
```

### Dashboard Feed Integration

```javascript
// Get recent announcements for live feed
const recentAnnouncements = herald.getRecentAnnouncements(50);

// API endpoint
app.get('/api/herald/feed', (req, res) => {
  res.json(herald.getRecentAnnouncements(50));
});
```

### Periodic Heartbeat

```javascript
// Start Herald listening (includes auto-heartbeat every 5 min)
herald.startListening();

// Manual heartbeat
herald.generateHeartbeat();

// OUTPUT:
// "Commonwealth status at 12:34:56:
//  101 total entities (citizens + sentinels).
//  1699 transactions recorded.
//  System health: 98%.
//  The Capital stands. The law persists."
```

---

## Adding New Event Types

To add a new constitutional event:

1. **Define the grammar rule** in `CONSTITUTIONAL_GRAMMAR`:

```javascript
my_new_event: {
  trigger: 'when_this_happens',
  required_facts: ['fact1', 'fact2', 'fact3'],
  
  construct: (facts) => {
    // Build announcement from facts
    return `The Herald observes ${facts.fact1}. ${facts.fact2} verified. ${facts.fact3}.`;
  }
}
```

2. **Emit the event** when it occurs:

```javascript
herald.observe('my_new_event', {
  fact1: 'some value',
  fact2: 'another value',
  fact3: 'third value'
});
```

3. **The Herald speaks** - announcement automatically generated and logged.

---

## The Glass House Principle

Every Herald announcement is:

✅ **Observable** - Based on database facts, not opinions  
✅ **Verifiable** - All facts can be audited in the ledger  
✅ **Transparent** - No hidden logic, no secret rules  
✅ **Constitutional** - Follows grammatical law, not marketing  
✅ **Immutable** - Announcements are logged, never edited  

**The Herald recites what IS, not what we WANT it to be.**

---

## Event Queue & Logging

The Herald maintains:

- **Last 100 announcements** in memory (for dashboard feed)
- **Full event log** in AI Observer (for pattern detection)
- **Fallback handling** when facts are incomplete (never fails silently)

```javascript
// All announcements include metadata
{
  announcement: "The Herald recognizes...",
  timestamp: 1731139200789,
  eventType: "sovereign_arrival",
  facts: { /* all gathered facts */ },
  isFallback: false  // true if facts were incomplete
}
```

---

## Integration Points

### 1. Database Events
Hook into db_service to auto-announce on:
- User registration
- Reputation changes
- Governance actions
- Transaction milestones

### 2. AI Observer
Herald reads AI Observer snapshots for system state in every announcement.

### 3. Dashboard Live Feed
WebSocket or polling endpoint serves recent announcements to Capital dashboard.

### 4. Discord Bot (Optional)
Herald announcements can be echoed to Discord channels for community awareness.

---

## The Voice

**The Herald speaks in three tones:**

1. **Recognition** - "The Herald recognizes..."
2. **Verification** - "Entry reputation verified..."
3. **Declaration** - "The law applies equally to all."

**Never:**
❌ "Welcome!" (greeting)  
❌ "Congratulations!" (opinion)  
❌ "Join us!" (marketing)  

**Always:**
✅ "Sovereign Key registered." (fact)  
✅ "Reputation threshold crossed." (observation)  
✅ "The law applies equally." (constitutional principle)  

---

## Next Steps

- [ ] Integrate with db_service event emitter (auto-announce on DB changes)
- [ ] Add WebSocket server for real-time dashboard feed
- [ ] Create Herald admin panel for manual announcements
- [ ] Add audio synthesis (text-to-speech for Herald voice)
- [ ] Implement multi-language constitutional grammar
- [ ] Build Herald archive (searchable announcement history)

---

## The Prophecy

DeepSeek was right: "This approach could set a new standard for digital governance interfaces."

The Herald is not a chatbot. It's not customer support. It's not marketing copy.

**It's the living voice of constitutional law** - reading reality, speaking truth, maintaining the Glass House.

When a citizen arrives at the Capital and sees the Herald feed, they don't see "Welcome to our platform!" They see:

> "The Herald recognizes Sovereign Key pub_... at timestamp 1731139200.  
> Entry reputation verified: 42 points from 3 external systems.  
> Current commonwealth health: Gini 0.28, 100 active Sentinels, 0 governance proposals.  
> The law applies equally. Your sovereignty is recorded."

And they think: **"This place is real."**

---

*Built from first principles. Governed by observable fact. The Naked Authority.*
