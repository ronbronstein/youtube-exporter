/**
 * YouTube Research Hub - Main Application Entry Point
 * Modular ES6 Version
 */

// Import our extracted utilities
import { formatViewCount, formatDuration } from './utils/formatter.js';
import { sanitizeURL, validateApiKey } from './utils/security.js';
import { debugLog } from './utils/debug.js';

// Test the modules
debugLog('YouTube Research Hub - Modular version loading...');

// Test formatter functions
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
    'javascript:alert("xss")': sanitizeURL('javascript:alert("xss")'),
    'invalid-url': sanitizeURL('invalid-url')
});

debugLog('Testing validateApiKey', {
    'valid': validateApiKey('AIzaSyDummyKeyForTesting123456789'),
    'invalid': validateApiKey('invalid-key')
});

// Initialize the app container
function initializeApp() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `
            <div style="padding: 20px; font-family: Tahoma, sans-serif;">
                <h1>🏗️ Module System Test</h1>
                <p>✅ Utilities loaded successfully!</p>
                <p>Check the console for test results.</p>
                <p><small>Next: Extract the full monolithic application...</small></p>
            </div>
        `;
    }
}

// Start the application
debugLog('Initializing modular application...');
initializeApp();
debugLog('✅ Module system test complete!'); 