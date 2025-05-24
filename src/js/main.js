/**
 * YouTube Research Hub - Main Application Entry Point
 * Modular ES6 Version
 */

// Import our extracted utilities and modules
import { formatViewCount, formatDuration } from './utils/formatter.js';
import { sanitizeURL, validateApiKey } from './utils/security.js';
import { debugLog } from './utils/debug.js';
import { CONFIG, globalState, updateGlobalState, getGlobalState } from './config.js';
import { DemoRateLimiter } from './utils/rateLimiter.js';
import { detectEnvironment, initializeEnvironment } from './utils/environment.js';
import { YouTubeApiService } from './services/youtubeApi.js';

// Initialize the application
debugLog('YouTube Research Hub - Modular version loading...');

// Test the modules
debugLog('Testing formatViewCount', {
    '1234': formatViewCount(1234),
    '1234567': formatViewCount(1234567),
    '1234567890': formatViewCount(1234567890)
});

debugLog('Testing formatDuration', {
    'PT1H23M45S': formatDuration('PT1H23M45S'),
    'PT5M30S': formatDuration('PT5M30S'),
    'PT0S': formatDuration('PT0S')
});

// Test security functions
debugLog('Testing sanitizeURL', {
    'https://youtube.com': sanitizeURL('https://youtube.com'),
    'javascript:alert(1)': sanitizeURL('javascript:alert(1)'),
    'invalid-url': sanitizeURL('invalid-url')
});

debugLog('Testing validateApiKey', {
    'valid': validateApiKey('AIza1234567890123456789012345'),
    'invalid': validateApiKey('invalid-key'),
    'empty': validateApiKey('')
});

// Test configuration
debugLog('Testing CONFIG access', {
    apiBaseUrl: CONFIG.API.BASE_URL,
    batchSize: CONFIG.API.BATCH_SIZE,
    demoEnabled: CONFIG.DEMO.ENABLED
});

// Test environment detection
debugLog('Testing environment detection', {
    detected: detectEnvironment(),
    current: getGlobalState('currentEnvironment')
});

// Test rate limiter
const rateLimiter = new DemoRateLimiter(CONFIG);
debugLog('Testing DemoRateLimiter', {
    instance: !!rateLimiter,
    rateLimit: rateLimiter.checkRateLimit(),
    userFingerprint: rateLimiter.getUserIP()
});

// Test YouTube API service
const youtubeApi = new YouTubeApiService('test-key');
debugLog('Testing YouTubeApiService', {
    instance: !!youtubeApi,
    hasSetApiKey: typeof youtubeApi.setApiKey === 'function',
    hasGetChannelData: typeof youtubeApi.getChannelData === 'function',
    hasValidateApiKey: typeof youtubeApi.validateApiKey === 'function'
});

// Initialize environment
initializeEnvironment();

debugLog('Initializing modular application...');

// For now, just create a simple placeholder UI
function initializeApp() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 20px; font-family: Tahoma, sans-serif; background: #ece9d8;">
                <h1>🎉 Modular System Works!</h1>
                <p><strong>Environment:</strong> ${getGlobalState('currentEnvironment')}</p>
                <p><strong>Rate Limiter:</strong> ${rateLimiter.checkRateLimit().allowed ? '✅ Allowed' : '❌ Limited'}</p>
                <p><strong>API Base URL:</strong> ${CONFIG.API.BASE_URL}</p>
                <hr>
                <h3>Module Tests:</h3>
                <ul>
                    <li>Format 1.5M views: ${formatViewCount(1500000)}</li>
                    <li>Format duration PT1H30M: ${formatDuration('PT1H30M')}</li>
                    <li>Sanitize JS URL: ${sanitizeURL('javascript:alert(1)')}</li>
                    <li>User fingerprint: ${rateLimiter.getUserIP()}</li>
                </ul>
                <p style="color: green;"><strong>✅ All modules loaded successfully!</strong></p>
            </div>
        `;
    }
}

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

debugLog('✅ Module system test complete!');

// Export for debugging in console
window.debugModules = {
    formatViewCount,
    sanitizeURL,
    validateApiKey,
    CONFIG,
    rateLimiter,
    detectEnvironment,
    youtubeApi
}; 