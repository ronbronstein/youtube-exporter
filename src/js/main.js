/**
 * YouTube Research Hub - Main Application Entry Point
 * Modular ES6 Version
 */

import { App } from './components/App.js';
import { debugLog } from './utils/debug.js';
import { initializeEnvironment } from './utils/environment.js';

// Initialize environment
initializeEnvironment();

debugLog('🚀 YouTube Research Hub - Modular version starting...');

// Initialize the application
function initializeApp() {
    const appContainer = document.getElementById('app');
    
    if (!appContainer) {
        console.error('❌ App container not found');
        return;
    }
    
    try {
        // Check if we're in test mode
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test') === 'true';
        
        if (isTestMode) {
            debugLog('🧪 Test mode detected - running integration tests');
            runIntegrationTests();
            return;
        }
        
        // Create and initialize the main App component
        const app = new App(appContainer, {
            autoInit: true,
            enableDemoMode: true,
            enableAnalytics: true
        });
        
        // Initialize the app
        app.init();
        
        // Store app instance globally for debugging
        window.debugApp = app;
        
        debugLog('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        
        // Show fallback error UI
        appContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Tahoma, sans-serif;">
                <h2 style="color: #d32f2f; margin-bottom: 16px;">⚠️ Application Error</h2>
                <p style="margin-bottom: 16px;">Failed to load the YouTube Research Hub.</p>
                <p style="font-size: 12px; color: #666;">
                    Please refresh the page or check the console for details.
                </p>
                <button onclick="location.reload()" 
                        style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }
}

// Integration testing function
async function runIntegrationTests() {
    try {
        const { default: IntegrationTest } = await import('./integration-test.js');
        
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div style="padding: 20px; font-family: monospace; background: #f5f5f5; min-height: 100vh;">
                <h2>🧪 Integration Test Mode</h2>
                <p>Running comprehensive system tests...</p>
                <div id="testResults" style="margin-top: 20px; background: white; padding: 16px; border-radius: 4px; border: 1px solid #ddd;">
                    <div>Starting tests...</div>
                </div>
                <button onclick="location.href=location.pathname" 
                        style="margin-top: 16px; padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Exit Test Mode
                </button>
            </div>
        `;
        
        const tester = new IntegrationTest();
        const results = await tester.runAllTests();
        await tester.testBridgeCompatibility();
        
        // Update UI with results
        const resultsDiv = document.getElementById('testResults');
        const successRate = Math.round((results.passedTests / results.totalTests) * 100);
        const isSuccess = successRate === 100;
        
        resultsDiv.innerHTML = `
            <h3 style="color: ${isSuccess ? 'green' : 'red'};">
                ${isSuccess ? '✅' : '❌'} Test Results: ${successRate}% Success Rate
            </h3>
            <div style="margin: 12px 0;">
                <strong>Total Tests:</strong> ${results.totalTests}<br>
                <strong>Passed:</strong> <span style="color: green;">${results.passedTests}</span><br>
                <strong>Failed:</strong> <span style="color: red;">${results.failedTests}</span>
            </div>
            ${results.errors.length > 0 ? `
                <div style="margin-top: 16px;">
                    <h4 style="color: red;">Failed Tests:</h4>
                    <ul style="color: red;">
                        ${results.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div style="margin-top: 16px; padding: 12px; background: ${isSuccess ? '#e8f5e8' : '#ffeaea'}; border-radius: 4px;">
                ${isSuccess ? 
                    '🎉 <strong>ALL TESTS PASSED!</strong> The modular system is working perfectly.' :
                    '⚠️ <strong>Some tests failed.</strong> Please review the errors above.'
                }
            </div>
        `;
        
        // Store results globally for debugging
        window.integrationTestResults = results;
        
    } catch (error) {
        console.error('❌ Failed to run integration tests:', error);
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Tahoma, sans-serif;">
                <h2 style="color: #d32f2f;">❌ Test Mode Error</h2>
                <p>Failed to load integration tests: ${error.message}</p>
                <button onclick="location.href=location.pathname" 
                        style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Exit Test Mode
                </button>
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

debugLog('📦 Main module loaded, waiting for DOM...'); 