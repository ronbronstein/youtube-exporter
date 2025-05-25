/**
 * Environment Detection & Initialization Utilities
 * Simplified: GitHub Pages = Demo/Live modes, Local = Simple API key usage
 */

import { CONFIG, updateGlobalState } from '../config.js';
import { debugLog } from './debug.js';

/**
 * Detect the current deployment environment
 * @returns {string} Environment type: 'demo', 'live', or 'local'
 */
export function detectEnvironment() {
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost');
    
    // TEMPORARY: Force LIVE mode for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'live' || urlParams.get('test') === 'live') {
        return 'live';
    }
    
    // Local development - simple mode, no demo/live switching
    if (isLocalhost) {
        return 'local';
    }
    
    // GitHub Pages - check for mode parameter or default to demo
    if (isGitHubPages) {
        const searchParams = new URLSearchParams(window.location.search);
        const modeParam = searchParams.get('mode');
        
        if (modeParam === 'live') {
            return 'live';
        }
        
        // Check localStorage for user preference
        const savedMode = localStorage.getItem('yt_hub_mode');
        if (savedMode === 'live') {
            return 'live';
        }
        
        return 'demo'; // Default to demo for GitHub Pages
    }
    
    // Self-hosted defaults to local mode
    return 'local';
}

/**
 * Initialize environment-specific configuration
 */
export function initializeEnvironment() {
    const currentEnvironment = detectEnvironment();
    CONFIG.ENVIRONMENT.DETECTED = currentEnvironment;
    updateGlobalState('currentEnvironment', currentEnvironment);
    
    debugLog(`🌍 Environment initialized: ${currentEnvironment} mode`);
    
    switch (currentEnvironment) {
        case 'local':
            initializeLocalMode();
            break;
        case 'demo':
            initializeDemoMode();
            break;
        case 'live':
            initializeLiveMode();
            break;
        default:
            console.warn('Unknown environment, defaulting to local mode');
            initializeLocalMode();
    }
}

/**
 * Initialize local development mode - simple API key from .env
 */
function initializeLocalMode() {
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Try to get API key from environment
    const apiKey = import.meta.env.YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY || null;
    if (apiKey) {
        updateGlobalState('youtubeApiKey', apiKey);
        updateGlobalState('apiMode', 'local');
        debugLog('✅ Local mode: API key loaded from environment');
    } else {
        console.warn('⚠️ Local mode: No API key found. Add YOUTUBE_API_KEY to your .env file');
    }
    
    debugLog('🏠 Local mode initialized - Full functionality with your API key');
}

/**
 * Initialize demo mode with built-in API key
 */
function initializeDemoMode() {
    CONFIG.DEMO.ENABLED = true;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Set demo API key from environment variable
    const demoApiKey = import.meta.env.VITE_DEMO_API_KEY || null;
    if (demoApiKey) {
        updateGlobalState('youtubeApiKey', demoApiKey);
        updateGlobalState('apiMode', 'demo');
        debugLog('✅ Demo mode: Built-in API key loaded');
    } else {
        console.warn('⚠️ Demo mode: No API key found in environment');
    }
    
    debugLog('🎭 Demo mode initialized - Limited to 100 videos per analysis');
}

/**
 * Initialize live mode (user brings own API key)
 */
function initializeLiveMode() {
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    updateGlobalState('apiMode', 'live');
    
    debugLog('🌐 Live mode initialized - Full functionality with user API key');
}

/**
 * Get current mode
 * @returns {string} Current mode: 'demo' or 'live'
 */
export function getCurrentMode() {
    return CONFIG.ENVIRONMENT.DETECTED || 'demo';
}

/**
 * Check if currently in demo mode
 * @returns {boolean}
 */
export function isDemoMode() {
    return getCurrentMode() === 'demo';
}

/**
 * Check if currently in live mode
 * @returns {boolean}
 */
export function isLiveMode() {
    return getCurrentMode() === 'live';
} 