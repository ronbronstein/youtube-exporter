/**
 * Environment Detection & Initialization Utilities
 * Handles different deployment environments (GitHub Pages, local, etc.)
 */

import { CONFIG, updateGlobalState } from '../config.js';
import { debugLog } from './debug.js';

/**
 * Detect the current deployment environment
 * @returns {string} Environment type: 'github-pages', 'local-file', 'local-server', 'custom-domain'
 */
export function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Check if running on GitHub Pages
    if (CONFIG.ENVIRONMENT.GITHUB_PAGES_DOMAINS.some(domain => hostname.includes(domain))) {
        return 'github-pages';
    }
    
    // Check if running as local file
    if (protocol === 'file:') {
        return 'local-file';
    }
    
    // Check if running on local development server
    if (CONFIG.ENVIRONMENT.LOCAL_DOMAINS.includes(hostname)) {
        return 'local-server';
    }
    
    // Custom domain deployment
    return 'custom-domain';
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
        case 'github-pages':
            initializeGitHubPages();
            break;
        case 'local-file':
            initializeLocalFile();
            break;
        case 'local-server':
            initializeLocalServer();
            break;
        case 'custom-domain':
            initializeCustomDomain();
            break;
        default:
            console.warn('Unknown environment, defaulting to local-file mode');
            initializeLocalFile();
    }
}

/**
 * Initialize GitHub Pages environment (simplified)
 */
function initializeGitHubPages() {
    // Disable OAuth for GitHub Pages - use manual API key entry only
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    // Show environment indicator
    showEnvironmentBanner('🌐 Live Demo - Powered by GitHub Pages');
    
    debugLog('GitHub Pages mode initialized (manual API key only)');
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
 * Initialize local server environment  
 */
function initializeLocalServer() {
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    showEnvironmentBanner('🔧 Local Server - Development Mode');
    debugLog('Local server mode initialized');
}

/**
 * Initialize custom domain environment
 */
function initializeCustomDomain() {
    // Disable OAuth for static hosting - use manual API key entry
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
    
    showEnvironmentBanner('🌍 Custom Domain - Production Mode');
    debugLog('Custom domain mode initialized (manual API key only)');
}

/**
 * Show environment banner (temporary implementation - will be moved to UI component)
 * @param {string} message - Banner message to display
 */
function showEnvironmentBanner(message) {
    // This is a temporary implementation
    // In the future, this will be handled by a proper UI component
    console.log(`🏷️ Environment Banner: ${message}`);
    
    // For now, we'll just add it to the page title if possible
    if (typeof document !== 'undefined') {
        const title = document.title;
        if (!title.includes('|')) {
            document.title = `${title} | ${message}`;
        }
    }
} 