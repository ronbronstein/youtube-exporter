/**
 * Global Configuration for YouTube Research Hub
 * Centralized configuration constants and settings
 */

export const CONFIG = {
    API: {
        BASE_URL: 'https://www.googleapis.com/youtube/v3',
        BATCH_SIZE: 50,
        QUOTA_COSTS: {
            search: 100,
            channel: 1,
            playlistItems: 1,
            videos: 1
        }
    },
    AUTH: {
        GITHUB_OAUTH_ENABLED: false, // Will be enabled for GitHub Pages
        CLIENT_ID: '', // Will be set based on environment
        REDIRECT_URI: '', // Will be set based on environment
        SCOPES: 'read:user', // Minimal GitHub scopes needed
        STORAGE_KEY: 'yt_encrypted_key',
        SESSION_KEY: 'yt_github_session',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
    },
    ENVIRONMENT: {
        DETECTED: null, // Will be set on initialization
        GITHUB_PAGES_DOMAINS: ['github.io', 'github.dev'],
        LOCAL_DOMAINS: ['localhost', '127.0.0.1'],
        SUPPORTED_ENVIRONMENTS: ['github-pages', 'local-file', 'local-server', 'custom-domain']
    },
    UI: {
        CHART_COLORS: {
            primary: 'rgb(0, 120, 212)',
            secondary: 'rgb(76, 175, 80)',
            background: 'rgba(0, 120, 212, 0.1)'
        },
        ANIMATION_DURATION: 400
    },
    STORAGE: {
        MAX_SAVED_SEARCHES: 10,
        CACHE_EXPIRY_HOURS: 24
    },
    DEMO: {
        ENABLED: false, // Will be set by environment detection
        MAX_VIDEOS_PER_ANALYSIS: 50, // Reduced from 100 for demo
        MAX_ANALYSES_PER_IP_PER_DAY: 5, // Increased from 3 for better demo experience
        GLOBAL_DAILY_LIMIT: 200, // Increased from 100
        RATE_LIMIT_STORAGE_KEY: 'yt_demo_usage',
        API_QUOTA_PER_ANALYSIS: 150 // Estimate: channel(1) + search(100) + videos(50)
    }
};

/**
 * Global state variables (to be migrated to proper state management later)
 * These are exported for backward compatibility during migration
 */
export let globalState = {
    videosData: [],
    filteredData: [],
    youtubeApiKey: null,
    currentView: 'list',
    currentSort: { column: null, direction: 'asc' },
    apiMode: null, // 'local', 'web', or 'demo'
    isDemoMode: false,
    
    // Authentication & environment state
    currentEnvironment: null,
    githubUser: null,
    githubSession: null,
    isAuthenticated: false
};

/**
 * Update global state (temporary helper during migration)
 * @param {string} key - State key to update
 * @param {*} value - New value
 */
export function updateGlobalState(key, value) {
    globalState[key] = value;
}

/**
 * Get global state value (temporary helper during migration)
 * @param {string} key - State key to get
 * @returns {*} State value
 */
export function getGlobalState(key) {
    return globalState[key];
} 