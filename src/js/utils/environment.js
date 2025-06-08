/**
 * Environment Detection & Initialization Utilities
 * Unified: Local development identical to GitHub Pages with auto-loaded API keys
 */

import { CONFIG, updateGlobalState, getGlobalState } from '../config.js';
import { debugLog } from './debug.js';

/**
 * Detect the current deployment environment
 * @returns {string} Environment type: 'local' or 'github-pages'
 */
export function detectEnvironment() {
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('localhost') || hostname.includes('10.100.102.7');
    
    if (isLocalhost) {
        return 'local';
    }
    
    if (isGitHubPages) {
        return 'github-pages';
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
    
    debugLog(`🌍 Environment initialized: ${currentEnvironment}`);
    
    switch (currentEnvironment) {
        case 'local':
            initializeLocalDevelopment();
            break;
        case 'github-pages':
            initializeGitHubPages();
            break;
        default:
            console.warn('Unknown environment, defaulting to local development');
            initializeLocalDevelopment();
    }
}

/**
 * Initialize local development - identical to GitHub Pages but with auto-loaded API key
 */
function initializeLocalDevelopment() {
    // Set up identical configuration to GitHub Pages
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Try to auto-load API key from .env file
    const apiKey = import.meta.env.VITE_DEMO_API_KEY || 
                   import.meta.env.VITE_YOUTUBE_API_KEY || 
                   import.meta.env.YOUTUBE_API_KEY || 
                   null;
    
    if (apiKey) {
        updateGlobalState('youtubeApiKey', apiKey);
        updateGlobalState('apiMode', 'local-auto');
        updateGlobalState('apiKeySource', 'env-file');
        debugLog('✅ Local development: API key auto-loaded from .env file');
    } else {
        updateGlobalState('apiMode', 'manual');
        updateGlobalState('apiKeySource', 'manual');
        console.warn('⚠️ Local development: No API key found in .env file');
        console.warn('📖 Add VITE_DEMO_API_KEY or VITE_YOUTUBE_API_KEY to your .env file');
    }
    
    debugLog('🏠 Local development initialized - Identical to GitHub Pages with auto-loaded API key');
}

/**
 * Initialize GitHub Pages - standard demo/live mode functionality
 */
function initializeGitHubPages() {
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Check for mode parameter or localStorage preference
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const savedMode = localStorage.getItem('yt_hub_mode');
    
    if (modeParam === 'live' || savedMode === 'live') {
        // Live mode - user provides API key
        updateGlobalState('apiMode', 'live');
        updateGlobalState('apiKeySource', 'user-input');
        debugLog('🌐 GitHub Pages: Live mode - User provides API key');
    } else {
        // Demo mode - built-in API key
    const demoApiKey = import.meta.env.VITE_DEMO_API_KEY || null;
    if (demoApiKey) {
        updateGlobalState('youtubeApiKey', demoApiKey);
        updateGlobalState('apiMode', 'demo');
            updateGlobalState('apiKeySource', 'demo-builtin');
            CONFIG.DEMO.ENABLED = true;
            debugLog('✅ GitHub Pages: Demo mode - Built-in API key loaded');
    } else {
            console.warn('⚠️ GitHub Pages: No demo API key found');
            updateGlobalState('apiMode', 'live');
            updateGlobalState('apiKeySource', 'user-input');
        }
    }
    
    debugLog('🚀 GitHub Pages initialized - Demo/Live mode functionality');
}

/**
 * Get current mode
 * @returns {string} Current mode: 'demo', 'live', or 'local-auto'
 */
export function getCurrentMode() {
    return getGlobalState('apiMode') || 'demo';
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

/**
 * Check if currently in local development with auto-loaded API key
 * @returns {boolean}
 */
export function isLocalAutoMode() {
    return getCurrentMode() === 'local-auto';
}

/**
 * Check if running in local development environment
 * @returns {boolean}
 */
export function isLocalEnvironment() {
    return CONFIG.ENVIRONMENT.DETECTED === 'local';
}

/**
 * Check if running on GitHub Pages
 * @returns {boolean}
 */
export function isGitHubPages() {
    return CONFIG.ENVIRONMENT.DETECTED === 'github-pages';
} 