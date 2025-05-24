/**
 * Environment Detection & Initialization Utilities
 * Handles different deployment environments (GitHub Pages, local, etc.)
 */

import { CONFIG, updateGlobalState } from '../config.js';
import { debugLog } from './debug.js';

/**
 * Detect the current deployment environment
 * @returns {string} Environment type: 'demo', 'live', 'local-server', 'local-file'
 */
export function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Check for demo mode via URL parameter
    if (searchParams.has('demo') || searchParams.get('mode') === 'demo') {
        return 'demo';
    }
    
    // Check if running on GitHub Pages (live environment)
    if (CONFIG.ENVIRONMENT.GITHUB_PAGES_DOMAINS.some(domain => hostname.includes(domain))) {
        return 'live';
    }
    
    // Check if running as local file
    if (protocol === 'file:') {
        return 'local-file';
    }
    
    // Check if running on local development server
    if (CONFIG.ENVIRONMENT.LOCAL_DOMAINS.includes(hostname)) {
        return 'local-server';
    }
    
    // Default to live for any other domain
    return 'live';
}

/**
 * Initialize environment-specific configuration
 */
export function initializeEnvironment() {
    const currentEnvironment = detectEnvironment();
    CONFIG.ENVIRONMENT.DETECTED = currentEnvironment;
    updateGlobalState('currentEnvironment', currentEnvironment);
    
    debugLog(`Environment detected: ${currentEnvironment}`);
    
    switch (currentEnvironment) {
        case 'demo':
            initializeDemoEnvironment();
            break;
        case 'live':
            initializeLiveEnvironment();
            break;
        case 'local-server':
            initializeLocalServer();
            break;
        case 'local-file':
            initializeLocalFile();
            break;
        default:
            console.warn('Unknown environment, defaulting to live mode');
            initializeLiveEnvironment();
    }
}

/**
 * Initialize demo environment with built-in API key
 */
function initializeDemoEnvironment() {
    CONFIG.DEMO.ENABLED = true;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Set demo API key from environment variable (will be set in GitHub secrets)
    const demoApiKey = import.meta.env.VITE_DEMO_API_KEY || null;
    if (demoApiKey) {
        updateGlobalState('youtubeApiKey', demoApiKey);
        updateGlobalState('apiMode', 'demo');
        debugLog('✅ Demo mode initialized with built-in API key');
    } else {
        console.warn('⚠️ Demo mode enabled but no API key found');
    }
    
    showEnvironmentBanner('🎭 Demo Mode - Limited functionality with built-in API key');
}

/**
 * Initialize live environment (user brings own API key)
 */
function initializeLiveEnvironment() {
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    updateGlobalState('apiMode', 'live');
    
    showEnvironmentBanner('🌐 Live Version - Enter your YouTube API key to get started');
    debugLog('✅ Live environment initialized');
}

/**
 * Initialize local server environment
 */
function initializeLocalServer() {
    CONFIG.DEMO.ENABLED = false;
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    updateGlobalState('apiMode', 'local');
    
    showEnvironmentBanner('🔧 Local Server - Development Mode');
    debugLog('Local server mode initialized');
}

/**
 * Initialize local file environment
 */
function initializeLocalFile() {
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    showEnvironmentBanner('🏠 Local Development - Direct File Access');
    debugLog('Local file mode initialized');
}

/**
 * Show environment banner (temporary implementation - will be moved to UI component)
 * @param {string} message - Banner message to display
 */
function showEnvironmentBanner(message) {
    // For now, just log to console
    // This will be replaced with proper UI banner in the App component
    console.log(`🏷️ Environment Banner: ${message}`);
} 