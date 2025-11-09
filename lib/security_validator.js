/**
 * SECURITY VALIDATOR
 * 
 * Real security validation replacing placeholder returns
 * Three-layer protection:
 * 1. Rate limiting (prevent abuse)
 * 2. Input sanitization (prevent injection)
 * 3. Module authentication (verify dimensional bridge access)
 * 
 * NO MORE PLACEHOLDER "return true"
 */

class SecurityValidator {
  constructor() {
    // Rate limiting state
    this.rateLimits = new Map(); // userId -> { count, resetTime, violations }
    this.MAX_COMMANDS_PER_MINUTE = 10;
    this.MAX_COMMANDS_PER_HOUR = 100;
    this.VIOLATION_THRESHOLD = 3; // Temp ban after 3 violations
    this.BAN_DURATION = 3600000; // 1 hour ban

    // Module authentication
    this.authorizedModules = new Set([
      'discord_bot',
      'herald_voice',
      'ai_observer',
      'dust_economy',
      'blender_client'
    ]);

    // Input validation patterns
    this.dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /\$\{.*\}/,
      /`.*`/,
      /__proto__/,
      /constructor/,
      /\.\./,  // Path traversal
      /[;|&$]/ // Shell injection
    ];

    // Cleanup interval (every 5 minutes)
    setInterval(() => this.cleanupExpiredLimits(), 300000);
  }

  /**
   * VALIDATE COMMAND EXECUTION
   * 
   * @param {string} command - Command name
   * @param {Array} args - Command arguments
   * @param {string} userId - User ID
   * @returns {Object} - { approved: boolean, sanitized: Array, reason: string }
   */
  async validateCommand(command, args, userId) {
    // 1. Check rate limits
    const rateLimitCheck = this.checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      this.recordViolation(userId, 'rate_limit');
      return {
        approved: false,
        reason: rateLimitCheck.reason,
        sanitized: []
      };
    }

    // 2. Check if user is banned
    const banCheck = this.checkBanStatus(userId);
    if (banCheck.banned) {
      return {
        approved: false,
        reason: `Temporarily banned: ${banCheck.reason}. Expires: ${new Date(banCheck.expiresAt).toLocaleString()}`,
        sanitized: []
      };
    }

    // 3. Sanitize inputs
    const sanitized = args.map(arg => this.sanitizeInput(arg));

    // 4. Validate sanitized inputs
    const inputValidation = this.validateInputs(sanitized);
    if (!inputValidation.safe) {
      this.recordViolation(userId, 'dangerous_input');
      return {
        approved: false,
        reason: `Dangerous input detected: ${inputValidation.threat}`,
        sanitized: []
      };
    }

    // 5. Command-specific validation
    const commandValidation = this.validateCommandSpecific(command, sanitized, userId);
    if (!commandValidation.approved) {
      return commandValidation;
    }

    // All checks passed
    return {
      approved: true,
      sanitized,
      analyst_report: 'No threats detected',
      pentester_result: 'Input validated',
      timestamp: Date.now()
    };
  }

  /**
   * RATE LIMIT CHECK
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = this.rateLimits.get(userId);

    // First request
    if (!userLimit) {
      this.rateLimits.set(userId, {
        minuteCount: 1,
        hourCount: 1,
        minuteReset: now + 60000,
        hourReset: now + 3600000,
        violations: 0,
        banUntil: null
      });
      return { allowed: true };
    }

    // Reset minute counter
    if (now > userLimit.minuteReset) {
      userLimit.minuteCount = 0;
      userLimit.minuteReset = now + 60000;
    }

    // Reset hour counter
    if (now > userLimit.hourReset) {
      userLimit.hourCount = 0;
      userLimit.hourReset = now + 3600000;
    }

    // Check limits
    if (userLimit.minuteCount >= this.MAX_COMMANDS_PER_MINUTE) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.MAX_COMMANDS_PER_MINUTE} commands/minute. Try again in ${Math.ceil((userLimit.minuteReset - now) / 1000)}s`
      };
    }

    if (userLimit.hourCount >= this.MAX_COMMANDS_PER_HOUR) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.MAX_COMMANDS_PER_HOUR} commands/hour. Try again in ${Math.ceil((userLimit.hourReset - now) / 60000)}m`
      };
    }

    // Increment counters
    userLimit.minuteCount++;
    userLimit.hourCount++;

    return { allowed: true };
  }

  /**
   * SANITIZE INPUT
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Remove dangerous characters
    let sanitized = input
      .replace(/[<>\"'`]/g, '') // HTML/JS injection
      .replace(/[\r\n]/g, '')   // Newlines
      .replace(/\\/g, '')       // Backslashes
      .trim();

    // Limit length
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }

    return sanitized;
  }

  /**
   * VALIDATE INPUTS
   */
  validateInputs(inputs) {
    for (const input of inputs) {
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(input)) {
          return {
            safe: false,
            threat: `Pattern matched: ${pattern.source}`
          };
        }
      }
    }

    return { safe: true };
  }

  /**
   * COMMAND-SPECIFIC VALIDATION
   */
  validateCommandSpecific(command, args, userId) {
    switch (command) {
      case 'explore':
        // Location must be alphanumeric + underscores only
        const location = args[0] || '';
        if (!/^[a-z_]+$/.test(location)) {
          return {
            approved: false,
            reason: 'Invalid location format. Use lowercase letters and underscores only.',
            sanitized: []
          };
        }
        break;

      case 'challenge':
        // Wager must be reasonable
        const wager = parseInt(args[1]) || 0;
        if (wager < 0 || wager > 10000) {
          return {
            approved: false,
            reason: 'Invalid wager amount (0-10000)',
            sanitized: []
          };
        }
        break;

      case 'build':
        // Circuit type validation
        const validCircuits = ['control_dial', 'data_pipe', 'redstone_node', 'logic_gate'];
        if (!validCircuits.includes(args[0])) {
          return {
            approved: false,
            reason: 'Invalid circuit type',
            sanitized: []
          };
        }
        break;
    }

    return { approved: true };
  }

  /**
   * CHECK BAN STATUS
   */
  checkBanStatus(userId) {
    const userLimit = this.rateLimits.get(userId);
    if (!userLimit || !userLimit.banUntil) {
      return { banned: false };
    }

    const now = Date.now();
    if (now < userLimit.banUntil) {
      return {
        banned: true,
        reason: `${userLimit.violations} security violations`,
        expiresAt: userLimit.banUntil
      };
    }

    // Ban expired
    userLimit.banUntil = null;
    userLimit.violations = 0;
    return { banned: false };
  }

  /**
   * RECORD VIOLATION
   */
  recordViolation(userId, type) {
    const userLimit = this.rateLimits.get(userId);
    if (!userLimit) return;

    userLimit.violations++;

    console.warn(`[SECURITY] Violation for ${userId}: ${type} (total: ${userLimit.violations})`);

    // Temp ban after threshold
    if (userLimit.violations >= this.VIOLATION_THRESHOLD) {
      userLimit.banUntil = Date.now() + this.BAN_DURATION;
      console.warn(`[SECURITY] User ${userId} temporarily banned until ${new Date(userLimit.banUntil).toISOString()}`);
    }
  }

  /**
   * VALIDATE MODULE ACCESS (Dimensional Bridge)
   */
  validateModuleAccess(moduleId, action) {
    if (!this.authorizedModules.has(moduleId)) {
      console.error(`[SECURITY] Unauthorized module access: ${moduleId}`);
      return {
        authorized: false,
        reason: 'Module not authorized for dimensional bridge access'
      };
    }

    // All authorized modules can perform any action
    // In production, implement action-level permissions
    return {
      authorized: true,
      module: moduleId,
      action,
      timestamp: Date.now()
    };
  }

  /**
   * CLEANUP EXPIRED LIMITS
   */
  cleanupExpiredLimits() {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, limit] of this.rateLimits.entries()) {
      // Remove if both counters expired and no active ban
      if (now > limit.hourReset && !limit.banUntil) {
        this.rateLimits.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[SECURITY] Cleaned ${cleaned} expired rate limits`);
    }
  }

  /**
   * GET SECURITY METRICS
   */
  getSecurityMetrics() {
    const metrics = {
      totalTrackedUsers: this.rateLimits.size,
      activeBans: 0,
      totalViolations: 0,
      rateLimitConfig: {
        maxPerMinute: this.MAX_COMMANDS_PER_MINUTE,
        maxPerHour: this.MAX_COMMANDS_PER_HOUR,
        violationThreshold: this.VIOLATION_THRESHOLD,
        banDuration: this.BAN_DURATION / 60000 + ' minutes'
      }
    };

    for (const limit of this.rateLimits.values()) {
      if (limit.banUntil && Date.now() < limit.banUntil) {
        metrics.activeBans++;
      }
      metrics.totalViolations += limit.violations;
    }

    return metrics;
  }
}

module.exports = SecurityValidator;
