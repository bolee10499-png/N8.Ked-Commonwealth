# COMMAND SIMPLIFICATION SPECIFICATION

## THE PROBLEM
Current commands are AI-generated abstract nonsense that nobody (including the creator) can understand.

Example: `!activate_n8ked_roach` - What does this DO?

## THE SOLUTION: THREE-TIER COMMAND SYSTEM

### Tier 1: Simple Commands (The Steering Wheel)
For all users. Clear, obvious, single-word verbs.

```
!balance          → Check your fragments
!daily            → Claim daily reward
!transfer @user X → Send money
!vote ID yes/no   → Vote on proposal
!nft create       → Make an NFT
!sync             → Sync all data (formerly !quantum_reality_mesh)
!scan             → Run security scan (formerly !activate_n8ked_roach)
!fix              → Auto-solve problems (formerly !loofah_breakthrough)
!status           → System health
!help             → Show commands
```

### Tier 2: Advanced Commands (The Dashboard)
For power users. Shows details and options.

```
!sync detailed     → Show what's being synchronized
!scan deep         → Deep security analysis
!fix manual        → Manual problem-solving wizard
!performance       → Detailed metrics
!architecture      → Show system architecture
```

### Tier 3: Genius Commands (The Engine Room)
For developers and admins. Original complex names preserved.

```
!quantum_reality_mesh           → Original sync command
!activate_n8ked_roach           → Original security command
!loofah_breakthrough            → Original problem-solving
!stress_test_menu               → Stress testing interface
!admin_config <key> <value>     → System configuration
```

## IMPLEMENTATION PLAN

### Phase 1: Command Aliasing
Create alias system without breaking existing commands:

```javascript
// discord/command_aliases.js
const COMMAND_ALIASES = {
  'sync': 'quantum_reality_mesh',
  'scan': 'activate_n8ked_roach',
  'fix': 'loofah_breakthrough',
  'status': 'system_metrics'
};

class CommandAliasSystem {
  async resolveCommand(userInput) {
    const simple = COMMAND_ALIASES[userInput];
    if (simple) {
      return await this.executeCommand(simple);
    }
    return await this.executeCommand(userInput); // Advanced/genius tier
  }
}
```

### Phase 2: Progressive Disclosure Help System
Users discover complexity gradually:

```javascript
// !help → Shows only simple commands
// !help advanced → Shows power user commands
// !help genius → Shows all original complex commands
```

### Phase 3: Deprecation Warning
Warn users when using old abstract commands:

```
⚠️ Warning: !quantum_reality_mesh is deprecated. Use !sync instead.
This alias will be removed in v2.0.
```

## TESTING CHECKLIST
- [ ] All simple commands work
- [ ] Advanced commands show detailed output
- [ ] Genius commands still function
- [ ] Help system shows appropriate tier
- [ ] Aliases resolve correctly
- [ ] New users can accomplish basic tasks without reading docs

## SUCCESS METRICS
- New user can execute 5 basic commands in 60 seconds
- No user asks "what does this command do?"
- Command completion rate >80% (users don't abort mid-execution)

---

**The system is a self-driving car. Users need a steering wheel, not aerospace controls.**
