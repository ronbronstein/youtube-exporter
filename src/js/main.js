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

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

debugLog('📦 Main module loaded, waiting for DOM...'); 