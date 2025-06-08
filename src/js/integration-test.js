/**
 * Integration Test - Final System Validation
 * 
 * This file tests the complete modular system to ensure:
 * - All services integrate properly
 * - Components work together seamlessly
 * - Bridge functions work with monolithic version
 * - No integration issues or conflicts
 */

import { App } from './components/App.js';
import { YouTubeApiService } from './services/youtubeApi.js';
import { storageService } from './services/storage.js';
import { analyticsService } from './services/analytics.js';
import { BaseComponent } from './components/BaseComponent.js';
import { VideoList } from './components/VideoList.js';
import { LoadingSpinner, GlobalLoading } from './components/LoadingSpinner.js';
import { MessagePanel, GlobalMessages } from './components/MessagePanel.js';
import { formatViewCount, formatDuration } from './utils/formatter.js';
import { sanitizeURL, validateApiKey } from './utils/security.js';
import { debugLog } from './utils/debug.js';
import { CONFIG, getGlobalState, updateGlobalState } from './config.js';
import { detectEnvironment } from './utils/environment.js';

export class IntegrationTest {
    constructor() {
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            errors: []
        };
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : '🧪';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }
    
    test(description, testFn) {
        this.testResults.totalTests++;
        try {
            const result = testFn();
            if (result === false) {
                this.testResults.failedTests++;
                this.testResults.errors.push(`FAILED: ${description}`);
                this.log(`FAILED: ${description}`, 'error');
                return false;
            } else {
                this.testResults.passedTests++;
                this.log(`PASSED: ${description}`, 'success');
                return true;
            }
        } catch (error) {
            this.testResults.failedTests++;
            this.testResults.errors.push(`ERROR: ${description} - ${error.message}`);
            this.log(`ERROR: ${description} - ${error.message}`, 'error');
            return false;
        }
    }
    
    async runAllTests() {
        this.log('🚀 Starting Integration Tests for Modular System');
        
        // Test 1: Module Imports
        this.test('All modules import successfully', () => {
            return !!(App && YouTubeApiService && storageService && analyticsService);
        });
        
        // Test 2: Configuration
        this.test('Configuration system works', () => {
            return CONFIG && CONFIG.API && CONFIG.API.BASE_URL === 'https://www.googleapis.com/youtube/v3';
        });
        
        // Test 3: Environment Detection
        this.test('Environment detection works', () => {
            const env = detectEnvironment();
            return ['demo', 'live', 'local'].includes(env);
        });
        
        // Test 4: Utility Functions
        this.test('Formatter utilities work', () => {
            return formatViewCount(1500000) === '1.5M' && 
                   formatDuration('PT1H30M') === '1:30:00';
        });
        
        this.test('Security utilities work', () => {
            return sanitizeURL('javascript:alert(1)') === '' &&
                   validateApiKey('AIza1234567890123456789012345').valid === true;
        });
        
        // Test 5: Service Initialization
        this.test('Storage service initializes', () => {
            storageService.initialize();
            return storageService.isInitialized();
        });
        
        this.test('Analytics service initializes', () => {
            analyticsService.initialize();
            return true; // If no error thrown, it's working
        });
        
        // Test 6: Component Creation
        this.test('BaseComponent can be created', () => {
            const testDiv = document.createElement('div');
            const component = new BaseComponent(testDiv);
            return component && typeof component.init === 'function';
        });
        
        this.test('VideoList component can be created', () => {
            const testDiv = document.createElement('div');
            const videoList = new VideoList(testDiv);
            return videoList && typeof videoList.setVideos === 'function';
        });
        
        this.test('LoadingSpinner component can be created', () => {
            const testDiv = document.createElement('div');
            const loader = new LoadingSpinner(testDiv);
            return loader && typeof loader.show === 'function';
        });
        
        this.test('MessagePanel component can be created', () => {
            const testDiv = document.createElement('div');
            const messages = new MessagePanel(testDiv);
            return messages && typeof messages.showError === 'function';
        });
        
        // Test 7: App Component
        this.test('App component can be created', () => {
            const testDiv = document.createElement('div');
            const app = new App(testDiv);
            return app && typeof app.init === 'function';
        });
        
        // Test 8: Service Integration
        this.test('Storage service can save and load data', () => {
            const testData = { test: 'data', timestamp: Date.now() };
            storageService.saveAnalysis('integration_test', testData);
            const loaded = storageService.loadAnalysis('integration_test');
            storageService.clearAnalysis('integration_test'); // Cleanup
            return loaded && loaded.test === 'data';
        });
        
        this.test('Analytics service can process video data', () => {
            const mockVideos = [
                {
                    title: 'Test Video',
                    publishedDate: new Date(),
                    viewCount: 1000,
                    likeCount: 100,
                    commentCount: 10
                }
            ];
            analyticsService.setVideosData(mockVideos);
            const analysis = analyticsService.generateContentAnalysis();
            analyticsService.clearAnalytics(); // Cleanup
            return analysis && analysis.totalVideos === 1;
        });
        
        // Test 9: Global State Management
        this.test('Global state can be updated and retrieved', () => {
            updateGlobalState('testKey', 'testValue');
            const value = getGlobalState('testKey');
            return value === 'testValue';
        });
        
        // Test 10: YouTube API Service Structure
        this.test('YouTube API service has required methods', () => {
            const testApiService = new YouTubeApiService('test-key');
            return typeof testApiService.setApiKey === 'function' &&
                   typeof testApiService.getChannelData === 'function' &&
                   typeof testApiService.getAllChannelVideos === 'function';
        });
        
        // Test 11: Global Singletons
        this.test('Global component singletons work', () => {
            const testDiv = document.createElement('div');
            document.body.appendChild(testDiv);
            
            const loader = GlobalLoading.init(testDiv);
            const hasShow = typeof loader.show === 'function';
            
            document.body.removeChild(testDiv);
            return hasShow;
        });
        
        // Test 12: Component Lifecycle
        this.test('Component lifecycle methods work', () => {
            const testDiv = document.createElement('div');
            const component = new BaseComponent(testDiv).init();
            
            const hasContainer = component.container === testDiv;
            component.destroy();
            
            return hasContainer;
        });
        
        // Test 13: Error Handling
        this.test('Debug logging works', () => {
            let logCalled = false;
            const originalLog = console.log;
            console.log = () => { logCalled = true; };
            
            debugLog('Test message');
            
            console.log = originalLog;
            return logCalled;
        });
        
        // Test 14: Memory Cleanup
        this.test('Components clean up properly', () => {
            const testDiv = document.createElement('div');
            document.body.appendChild(testDiv);
            
            const component = new BaseComponent(testDiv).init();
            component.addListener(testDiv, 'click', () => {});
            
            const hasListeners = component.eventListeners.size > 0;
            component.destroy();
            const cleanedUp = component.eventListeners.size === 0;
            
            document.body.removeChild(testDiv);
            return hasListeners && cleanedUp;
        });
        
        // Final Results
        this.logResults();
        return this.testResults;
    }
    
    logResults() {
        const { totalTests, passedTests, failedTests, errors } = this.testResults;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        this.log('🏁 Integration Test Results:', 'info');
        this.log(`   Total Tests: ${totalTests}`, 'info');
        this.log(`   Passed: ${passedTests}`, 'success');
        this.log(`   Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
        this.log(`   Success Rate: ${successRate}%`, successRate === 100 ? 'success' : 'error');
        
        if (errors.length > 0) {
            this.log('🔍 Failed Tests:', 'error');
            errors.forEach(error => this.log(`   - ${error}`, 'error'));
        }
        
        if (successRate === 100) {
            this.log('🎉 ALL INTEGRATION TESTS PASSED! System is ready for production.', 'success');
        } else {
            this.log('⚠️  Some tests failed. Please review and fix before proceeding.', 'error');
        }
    }
    
    // Bridge Compatibility Test
    async testBridgeCompatibility() {
        this.log('🌉 Testing Bridge Compatibility with Monolithic System');
        
        try {
            // Test if we can access the monolithic functions
            const monolithExists = typeof window !== 'undefined' && 
                                 typeof document !== 'undefined';
            
            if (!monolithExists) {
                this.log('⚠️ Not in browser environment - skipping bridge tests', 'info');
                return true;
            }
            
            // Test bridge function availability
            const bridgeTests = [
                { name: 'formatViewCount', fn: window.formatViewCount },
                { name: 'sanitizeURL', fn: window.sanitizeURL },
                { name: 'validateApiKey', fn: window.validateApiKey },
                { name: 'debugLog', fn: window.debugLog }
            ];
            
            let bridgeSuccess = true;
            bridgeTests.forEach(test => {
                if (typeof test.fn === 'function') {
                    this.log(`✅ Bridge function ${test.name} available`, 'success');
                } else {
                    this.log(`❌ Bridge function ${test.name} missing`, 'error');
                    bridgeSuccess = false;
                }
            });
            
            return bridgeSuccess;
            
        } catch (error) {
            this.log(`❌ Bridge compatibility test failed: ${error.message}`, 'error');
            return false;
        }
    }
}

// Auto-run integration tests if in test mode
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const tester = new IntegrationTest();
        const results = await tester.runAllTests();
        await tester.testBridgeCompatibility();
        
        // Store results globally for debugging
        window.integrationTestResults = results;
    });
}

// Auto-run in Node.js environment
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    // We're in Node.js, run the tests
    const tester = new IntegrationTest();
    tester.runAllTests().then(results => {
        const { totalTests, passedTests, failedTests } = results;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        if (successRate === 100) {
            console.log('✅ All integration tests passed!');
            process.exit(0);
        } else {
            console.log(`❌ Tests failed: ${failedTests}/${totalTests}`);
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

export default IntegrationTest; 