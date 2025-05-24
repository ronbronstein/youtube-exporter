/**
 * Demo Mode Rate Limiting Utilities
 * Prevents abuse of demo API quota by limiting usage per IP and globally
 */

export class DemoRateLimiter {
    constructor(config) {
        this.config = config;
        this.isDemoMode = false;
    }

    /**
     * Enable or disable demo mode
     * @param {boolean} enabled - Whether demo mode is active
     */
    setDemoMode(enabled) {
        this.isDemoMode = enabled;
    }

    /**
     * Check if user has exceeded rate limits
     * @returns {object} Rate limit status with allowed boolean and remaining count
     */
    checkRateLimit() {
        if (!this.isDemoMode) return { allowed: true, remaining: Infinity };
        
        const today = new Date().toDateString();
        const usage = this.getUsage();
        
        // Check if user has exceeded daily limit
        const userToday = usage.perIP[this.getUserIP()] || {};
        const userTodayCount = userToday[today] || 0;
        
        if (userTodayCount >= this.config.DEMO.MAX_ANALYSES_PER_IP_PER_DAY) {
            return {
                allowed: false,
                reason: 'daily_limit_per_ip',
                remaining: 0,
                resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()
            };
        }
        
        // Check global daily limit
        const globalToday = usage.global[today] || 0;
        if (globalToday >= this.config.DEMO.GLOBAL_DAILY_LIMIT) {
            return {
                allowed: false,
                reason: 'global_daily_limit',
                remaining: 0,
                resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()
            };
        }
        
        return {
            allowed: true,
            remaining: this.config.DEMO.MAX_ANALYSES_PER_IP_PER_DAY - userTodayCount,
            globalRemaining: this.config.DEMO.GLOBAL_DAILY_LIMIT - globalToday
        };
    }

    /**
     * Increment usage counters after a successful analysis
     */
    incrementUsage() {
        if (!this.isDemoMode) return;
        
        const today = new Date().toDateString();
        const usage = this.getUsage();
        const userIP = this.getUserIP();
        
        // Increment per-IP counter
        if (!usage.perIP[userIP]) usage.perIP[userIP] = {};
        usage.perIP[userIP][today] = (usage.perIP[userIP][today] || 0) + 1;
        
        // Increment global counter
        usage.global[today] = (usage.global[today] || 0) + 1;
        
        // Clean old entries (keep only last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        Object.keys(usage.global).forEach(date => {
            if (new Date(date) < sevenDaysAgo) {
                delete usage.global[date];
            }
        });
        
        // Clean old IP entries
        Object.keys(usage.perIP).forEach(ip => {
            Object.keys(usage.perIP[ip]).forEach(date => {
                if (new Date(date) < sevenDaysAgo) {
                    delete usage.perIP[ip][date];
                }
            });
        });
        
        localStorage.setItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY, JSON.stringify(usage));
    }

    /**
     * Get current usage data from localStorage
     * @returns {object} Usage data with perIP and global counters
     */
    getUsage() {
        try {
            const stored = localStorage.getItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY);
            return stored ? JSON.parse(stored) : { perIP: {}, global: {} };
        } catch (error) {
            return { perIP: {}, global: {} };
        }
    }

    /**
     * Generate a simple user fingerprint for rate limiting
     * Not perfect but good enough for demo abuse prevention
     * @returns {string} User fingerprint hash
     */
    getUserIP() {
        // Simple IP approximation using screen resolution + timezone + user agent
        const fingerprint = [
            screen.width,
            screen.height,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.userAgent.substr(0, 50)
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Reset all usage data (for testing or admin purposes)
     */
    resetUsage() {
        localStorage.removeItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY);
    }

    /**
     * Get detailed usage statistics
     * @returns {object} Detailed usage information
     */
    getUsageStats() {
        const usage = this.getUsage();
        const today = new Date().toDateString();
        const userIP = this.getUserIP();
        
        return {
            todayGlobal: usage.global[today] || 0,
            todayUser: usage.perIP[userIP]?.[today] || 0,
            totalDays: Object.keys(usage.global).length,
            userFingerprint: userIP
        };
    }
} 