/**
 * Environment Detection & Initialization Utilities
 * Simplified Two-Mode System: Demo vs Live
 */

import { CONFIG, updateGlobalState } from '../config.js';
import { debugLog } from './debug.js';

/**
 * Detect the current deployment environment
 * Simplified to two modes: 'demo' or 'live'
 * @returns {string} Environment type: 'demo' or 'live'
 */
export function detectEnvironment() {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Check for explicit mode parameter
    const modeParam = searchParams.get('mode');
    if (modeParam === 'demo' || modeParam === 'live') {
        return modeParam;
    }
    
    // Check for legacy demo parameter
    if (searchParams.has('demo')) {
        return 'demo';
    }
    
    // Check localStorage for user preference
    const savedMode = localStorage.getItem('yt_hub_mode');
    if (savedMode === 'demo' || savedMode === 'live') {
        return savedMode;
    }
    
    // Default based on environment:
    // - GitHub Pages: Start with demo mode for easy onboarding
    // - Local development: Start with live mode for development
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost');
    
    if (isGitHubPages) {
        return 'demo'; // GitHub Pages defaults to demo for easy user onboarding
    } else if (isLocalhost) {
        return 'live'; // Local development defaults to live mode
    } else {
        return 'demo'; // Self-hosted defaults to demo for safety
    }
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
        case 'demo':
            initializeDemoMode();
            break;
        case 'live':
            initializeLiveMode();
            break;
        default:
            console.warn('Unknown environment, defaulting to demo mode');
            initializeDemoMode();
    }
}

/**
 * Switch to a specific mode and persist the choice
 * @param {string} mode - 'demo' or 'live'
 */
export function switchToMode(mode) {
    if (mode !== 'demo' && mode !== 'live') {
        console.error('Invalid mode:', mode);
        return;
    }
    
    // Save user preference
    localStorage.setItem('yt_hub_mode', mode);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('mode', mode);
    window.history.replaceState({}, '', url);
    
    // Update global state
    CONFIG.ENVIRONMENT.DETECTED = mode;
    updateGlobalState('currentEnvironment', mode);
    
    debugLog(`🔄 Switched to ${mode} mode`);
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