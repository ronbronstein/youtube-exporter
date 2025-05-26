/**
 * App Component - Main Application Controller
 * 
 * Features:
 * - Centralized application state management
 * - Component lifecycle coordination
 * - Service initialization and management
 * - Environment-aware configuration
 * - Global event handling
 */

import { BaseComponent } from './BaseComponent.js';
import { VideoList } from './VideoList.js';
import { Results } from './Results.js';
import { LoadingSpinner, GlobalLoading } from './LoadingSpinner.js';
import { MessagePanel, GlobalMessages } from './MessagePanel.js';
import { YouTubeApiService } from '../services/youtubeApi.js';
import { storageService } from '../services/storage.js';
import { analyticsService } from '../services/analytics.js';
import { detectEnvironment } from '../utils/environment.js';
import { validateApiKey } from '../utils/security.js';
import { debugLog } from '../utils/debug.js';
import { updateGlobalState } from '../config.js';
import { formatViewCount, formatDuration } from '../utils/formatter.js';
import { globalPerformanceMonitor } from '../utils/performance.js';

export class App extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        
        // Application state
        this.appState = {
            currentEnvironment: null,
            apiKey: null,
            channelData: null,
            videos: [],
            filteredVideos: [],
            currentView: 'list',
            isLoading: false,
            lastAnalysis: null,
            savedSearches: [],
            apiMode: null
        };
        
        // Component instances
        this.components = {
            videoList: null,
            loadingSpinner: null,
            messagePanel: null,
            results: null
        };
        
        // Service instances
        this.services = {
            youtube: null, // Will be created when API key is set
            storage: storageService,
            analytics: analyticsService
        };
        
        // Service ready flags
        this.servicesReady = {
            youtube: false,
            storage: false,
            analytics: false
        };
        
        // Performance monitoring
        this.performanceMonitor = this.options.enablePerformanceMonitoring ? globalPerformanceMonitor : null;
    }
    
    get defaultOptions() {
        return {
            autoInit: true,
            enableDemoMode: true,
            enableAnalytics: true,
            enablePerformanceMonitoring: true
        };
    }
    
    async onCreate() {
        debugLog('🚀 Initializing YouTube Research Hub App');
        
        // Detect and initialize environment
        this.appState.currentEnvironment = detectEnvironment();
        updateGlobalState('currentEnvironment', this.appState.currentEnvironment);
        
        // Initialize services
        await this.initializeServices();
        
        // Initialize components
        this.initializeComponents();
        
        // Initialize API key based on environment (like legacy version)
        await this.initializeApiKey();
        
        // Load saved state
        await this.loadSavedState();
        
        debugLog(`✅ App initialized in ${this.appState.currentEnvironment} environment`);
    }
    
    template() {
        return `
            <div class="app-main">
                <!-- Global Messages Banner -->
                <div id="globalMessages" class="global-messages-banner"></div>
                
                <!-- Header Section with Logo -->
                <div class="app-header">
                    <div class="header-top">
                        <div class="header-with-logo">
                            <img src="./assets/logo.png" alt="YouTube Research Hub" class="app-logo">
                            <div class="title-section">
                                <h1 class="app-title">YouTube Research Hub</h1>
                                <p class="app-subtitle">Comprehensive analysis • Content insights • Strategic planning</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Mode Selector Section -->
                <div class="mode-selector-section">
                    ${this.renderModeToggle()}
                </div>
                
                <!-- Control Panel -->
                <div class="control-panel">
                    ${this.renderApiKeySection()}
                    ${this.renderSearchSection()}
                </div>
                
                <!-- Cached Channels Section -->
                <div class="cached-channels-section">
                    ${this.renderCachedChannelsList()}
                </div>
                
                <!-- Results Section (Single Panel) -->
                <div class="results-section">
                    <div id="resultsContainer" class="results-container"></div>
                </div>
                
                <!-- Analytics Section (Below Results) -->
                <div class="analytics-section" id="analyticsSection">
                    <div class="analytics-placeholder">
                        Select a channel to view analytics
                    </div>
                </div>
                
                <!-- Global Loading Overlay -->
                <div id="globalLoading" class="global-loading"></div>
            </div>
        `;
    }
    
    onMount() {
        debugLog('🏗️ App onMount started');
        
        // Initialize global components with better error handling
        try {
            this.components.messagePanel = GlobalMessages.init(
                this.findElement('#globalMessages'),
                { position: 'banner', maxMessages: 1, autoHideDelay: { success: 3000, error: 8000, warning: 5000, info: 4000 } }
            );
            debugLog('✅ GlobalMessages initialized');
        } catch (error) {
            debugLog('❌ GlobalMessages initialization failed:', error);
        }
        
        try {
            this.components.loadingSpinner = GlobalLoading.init(
                this.findElement('#globalLoading'),
                { overlay: true, showProgress: true }
            );
            debugLog('✅ GlobalLoading initialized');
        } catch (error) {
            debugLog('❌ GlobalLoading initialization failed:', error);
        }
        
        // Initialize Results component (which will contain VideoList)
        try {
            this.components.results = new Results(
                this.findElement('#resultsContainer'),
                { enableViewToggle: true, enableExport: true, enableFilter: true, defaultView: 'list' }
            ).init();
            debugLog('✅ Results component initialized');
        } catch (error) {
            debugLog('❌ Results component initialization failed:', error);
        }
        
        // Wait for Results to be fully mounted before initializing VideoList
        setTimeout(() => {
            try {
                // Initialize VideoList inside Results component  
                this.components.videoList = new VideoList(
                    this.components.results.findElement('#videoDisplayContainer'),
                    { enableViewSwitch: false, enableSorting: true, defaultView: 'list' }
                ).init();
                debugLog('✅ VideoList component initialized');
                
                // Connect Results and VideoList components
                this.components.results.on('viewChanged', (data) => {
                    if (this.components.videoList) {
                        this.components.videoList.switchView(data.view);
                    }
                });
                
                this.components.results.on('videosChanged', (data) => {
                    if (this.components.videoList) {
                        this.components.videoList.setVideos(data.videos);
                        debugLog(`📺 VideoList updated with ${data.videos.length} videos`);
                    }
                });
                
                this.components.results.on('videosFiltered', (data) => {
                    if (this.components.videoList) {
                        this.components.videoList.setVideos(data.videos);
                        debugLog(`📺 VideoList filtered to ${data.videos.length} videos`);
                    }
                });
                
                this.components.results.on('error', (data) => {
                    this.showError(data.message);
                });
                
            } catch (error) {
                debugLog('❌ VideoList component initialization failed:', error);
            }
        }, 100); // Increased timeout to ensure DOM is ready
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for environment-specific initialization
        this.handleEnvironmentSpecificInit();
        
        // Debug: Check if critical elements exist
        debugLog('🔍 Checking critical elements after mount:');
        debugLog('  - Channel input:', !!this.findElement('#channelInput'));
        debugLog('  - Search button:', !!this.findElement('#searchBtn'));
        debugLog('  - API key input:', !!this.findElement('#apiKeyInput'));
        debugLog('  - Environment:', this.appState.currentEnvironment);
        debugLog('  - Has API key:', !!this.appState.apiKey);
        
        // Debug: Check button state
        const searchBtn = this.findElement('#searchBtn');
        if (searchBtn) {
            debugLog('  - Button disabled:', searchBtn.disabled);
            debugLog('  - Button classes:', searchBtn.className);
        }
        
        debugLog('🏗️ App onMount completed');
    }
    
    // Service Management
    async initializeServices() {
        try {
            // Initialize storage service
            storageService.initialize();
            this.servicesReady.storage = true;
            debugLog('📦 Storage service ready');
            
            // Initialize analytics service
            this.services.analytics.initialize();
            this.servicesReady.analytics = true;
            debugLog('📊 Analytics service ready');
            
            // YouTube API service will be initialized when API key is provided
            debugLog('🔌 Services initialization complete');
            
        } catch (error) {
            debugLog('❌ Service initialization error:', error);
            this.showError('Failed to initialize application services');
        }
    }
    
    initializeComponents() {
        // Component initialization happens in onMount
        debugLog('🏗️ Components ready for initialization');
    }
    
    async loadSavedState() {
        try {
            // Load saved searches
            this.appState.savedSearches = storageService.getSavedSearches();
            
            // Load last API key (encrypted) - but NOT in demo mode
            if (this.appState.apiMode !== 'demo') {
            const savedApiKey = storageService.getApiKey();
            if (savedApiKey) {
                this.setApiKey(savedApiKey);
                    debugLog('✅ Loaded saved API key from localStorage');
                } else {
                    debugLog('ℹ️ No saved API key found in localStorage');
                }
            } else {
                debugLog('🎭 Demo mode: Skipping saved API key to preserve demo settings');
            }
            
            // Load last analysis if available
            const lastChannel = storageService.getLastAnalyzedChannel();
            if (lastChannel) {
                const analysis = storageService.loadAnalysis(lastChannel);
                if (analysis) {
                    this.appState.lastAnalysis = analysis;
                    debugLog(`📂 Loaded previous analysis for ${lastChannel}`);
                }
            }
            
        } catch (error) {
            debugLog('⚠️ Error loading saved state:', error);
        }
    }
    
    /**
     * Render the mode selector UI
     * 
     * REDESIGNED (Dec 2024): Switched from large card-based selector to compact toggle buttons
     * - Minimalistic design takes less space
     * - Clear, functional buttons with proper event handling
     * - Consolidated status messaging
     * - No misleading "upgrade" language
     * 
     * @returns {string} HTML for mode selector or local development banner
     */
    renderModeToggle() {
        const currentEnvironment = this.appState.currentEnvironment;
        
        // Local development - no mode toggle, clean interface
        if (currentEnvironment === 'local') {
            return ''; // No mode selector for local development
        }
        
        // GitHub Pages - show demo/live mode selector
        const currentMode = this.appState.apiMode || 'demo';
        return `
            <div class="mode-selector-minimal">
                <div class="mode-toggle-compact">
                    <button class="mode-btn-compact ${currentMode === 'demo' ? 'active' : ''}" data-mode="demo">
                        🎭 Try Demo
                    </button>
                    <button class="mode-btn-compact ${currentMode === 'live' ? 'active' : ''}" data-mode="live">
                        🚀 Full Version
                    </button>
                </div>
                <div class="mode-description">
                    ${currentMode === 'demo' ? 
                        'Demo: Test the tool with sample data, limited to 100 videos' : 
                        'Full: Use your own API key for unlimited analysis'
                    }
                </div>
            </div>
        `;
    }

    renderEnvironmentInfo() {
        // Remove this - no longer needed
        return '';
    }

    renderApiKeySection() {
        const currentEnvironment = this.appState.currentEnvironment;
        const currentMode = this.appState.apiMode || 'demo'; // Default to demo for GitHub Pages
        
        // Local development - show clean API key status
        if (currentEnvironment === 'local') {
            const hasApiKey = !!this.appState.apiKey;
            const apiKeySource = hasApiKey ? 'Found in .env file' : 'Not found in .env file';
            
            return `
                <div class="api-key-status-local">
                    <div class="status-content">
                        <span class="status-icon">🔐</span>
                        <span class="status-text">API Key: ${apiKeySource}</span>
                        <span class="status-indicator ${hasApiKey ? 'ready' : 'missing'}">
                            ${hasApiKey ? '✅ Ready' : '⚠️ Missing'}
                        </span>
                    </div>
                    ${!hasApiKey ? `
                        <div class="env-help">
                            <p>Add <code>VITE_DEMO_API_KEY=your_key_here</code> to your .env file</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // GitHub Pages - demo mode (no API key input needed)
        if (currentMode === 'demo') {
            return `
                <div class="demo-status-panel">
                    <div class="demo-info">
                        <span class="demo-icon">🎭</span>
                        <span class="demo-text">Demo Mode: Ready to test</span>
                        <span class="demo-indicator ready">✅ No setup required</span>
                    </div>
                    <div class="demo-description">
                        Test the tool with real YouTube data. Limited to 100 most recent videos per channel.
                    </div>
                </div>
            `;
        }
        
        // GitHub Pages - live mode (show API key input)
        const hasValidApiKey = !!this.appState.apiKey;
        return `
            <div class="api-key-section-minimal">
                <div class="api-key-header-minimal">
                    <h3>🔐 Enter Your YouTube API Key</h3>
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="get-key-link">
                        Get free API key →
                    </a>
                </div>
                
                <div class="api-input-group">
                    <input 
                        type="password" 
                        id="apiKeyInput" 
                        placeholder="AIza... (paste your YouTube Data API v3 key here)"
                        class="api-key-input-large"
                    >
                    <button id="saveApiKeyBtn" class="save-key-btn-minimal" disabled>
                        Validate & Use
                    </button>
                </div>
                
                <div class="api-help-minimal">
                    <span>🔒 Stored locally only</span>
                    <span>🆓 Free tier: 10,000 requests/day</span>
                    <span>⚡ Takes 2 minutes to set up</span>
                </div>
                
                ${hasValidApiKey ? `
                    <div class="api-validated">
                        <span class="validated-icon">✅</span>
                        <span class="validated-text">API key validated and ready</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Render the search section with large, usable input fields
     * 
     * REDESIGNED (Dec 2024): Enhanced for better usability
     * - Much larger input fields (20px padding) for comfortable typing
     * - Simplified options layout
     * - Larger, more prominent search button
     * - Clear status messaging
     * - Disabled state for live mode without API key
     * 
     * @returns {string} HTML for search section
     */
    renderSearchSection() {
        const currentEnvironment = this.appState.currentEnvironment;
        const currentMode = this.appState.apiMode || 'demo';
        const hasApiKey = !!this.appState.apiKey;
        
        // Determine if inputs should be disabled
        const shouldDisableInputs = currentMode === 'live' && !hasApiKey;
        const disabledAttr = shouldDisableInputs ? 'disabled' : '';
        const disabledClass = shouldDisableInputs ? 'disabled' : '';
        
        // Determine status message based on environment and mode
        let statusMessage = '';
        if (currentEnvironment === 'local') {
            statusMessage = hasApiKey ? 'Local development: Full functionality' : 'API key required';
        } else if (currentMode === 'demo') {
            statusMessage = 'Demo: 100 video limit';
        } else if (currentMode === 'live') {
            statusMessage = hasApiKey ? 'Full: Unlimited videos' : 'Enter API key to unlock';
        } else {
            statusMessage = 'Ready to analyze';
        }
        
        return `
            <div class="search-section-minimal">
                <h3>🔍 Analyze YouTube Channel</h3>
                
                <!-- Large Input Fields -->
                <div class="search-inputs-large ${disabledClass}">
                    <input 
                        type="text" 
                        id="channelInput" 
                        placeholder="${shouldDisableInputs ? 'Enter API key above to unlock' : 'Enter channel URL, @handle, or channel ID'}"
                        class="channel-input-large ${disabledClass}"
                        ${disabledAttr}
                    >
                    <input 
                        type="text" 
                        id="keywordInput" 
                        placeholder="${shouldDisableInputs ? 'Enter API key above to unlock' : 'Filter by keywords (optional): AI, tutorial, etc.'}"
                        class="keyword-input-large ${disabledClass}"
                        ${disabledAttr}
                    >
                </div>
                
                <!-- Compact Options -->
                <div class="search-options-compact ${disabledClass}">
                    <div class="option-group-inline">
                        <label>Search in:</label>
                        <label class="radio-inline">
                            <input type="radio" name="searchScope" value="both" checked ${disabledAttr}> 
                            Title & Description
                        </label>
                        <label class="radio-inline">
                            <input type="radio" name="searchScope" value="title" ${disabledAttr}> 
                            Title Only
                        </label>
                    </div>
                    
                    <div class="option-group-inline">
                        <label>Keywords:</label>
                        <label class="radio-inline">
                            <input type="radio" name="searchLogic" value="OR" checked ${disabledAttr}> 
                            Any (OR)
                        </label>
                        <label class="radio-inline">
                            <input type="radio" name="searchLogic" value="AND" ${disabledAttr}> 
                            All (AND)
                        </label>
                    </div>
                </div>
                
                <!-- Large Search Button -->
                <div class="search-action-large">
                    <button id="searchBtn" class="search-btn-large" disabled>
                        🔍 Analyze Channel
                    </button>
                    <div class="search-status ${shouldDisableInputs ? 'locked' : ''}">
                        ${statusMessage}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event Management
    setupEventListeners() {
        debugLog('🔌 Setting up event listeners...');
        
        // API Key events (live environment only)
        if (this.appState.currentEnvironment === 'live') {
            const apiKeyInput = this.findElement('#apiKeyInput');
            const saveKeyBtn = this.findElement('#saveApiKeyBtn');
            
            if (apiKeyInput) {
                this.addListener(apiKeyInput, 'input', this.handleApiKeyInput.bind(this));
                this.addListener(apiKeyInput, 'keydown', (e) => {
                    if (e.key === 'Enter') this.handleSaveApiKey();
                });
                debugLog('✅ API key input listeners attached');
            } else {
                debugLog('⚠️ API key input not found');
            }
            
            if (saveKeyBtn) {
                this.addListener(saveKeyBtn, 'click', this.handleSaveApiKey.bind(this));
                debugLog('✅ Save API key button listener attached');
            } else {
                debugLog('⚠️ Save API key button not found');
            }
        }
        
        // Channel analysis events
        const channelInput = this.findElement('#channelInput');
        const searchBtn = this.findElement('#searchBtn');
        
        if (channelInput) {
            this.addListener(channelInput, 'input', this.handleChannelInput.bind(this));
            this.addListener(channelInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !searchBtn.disabled) {
                    this.handleAnalyzeChannel();
                }
            });
            debugLog('✅ Channel input listeners attached');
        } else {
            debugLog('❌ Channel input not found - this is critical!');
        }
        
        if (searchBtn) {
            this.addListener(searchBtn, 'click', (e) => {
                debugLog('🖱️ Search button clicked');
                if (this.performanceMonitor) {
                    this.performanceMonitor.trackUserInteraction('searchButtonClick', {
                        disabled: searchBtn.disabled,
                        hasApiKey: !!this.appState.apiKey
                    });
                }
                this.handleAnalyzeChannel();
            });
            debugLog('✅ Search button listener attached');
        } else {
            debugLog('❌ Search button not found - this is critical!');
        }
        
        // Mode toggle events - FIXED to match actual HTML structure
        const modeButtons = this.findElements('.mode-btn-compact');
        modeButtons.forEach(btn => {
            const mode = btn.getAttribute('data-mode');
            if (mode) {
                this.addListener(btn, 'click', (e) => {
                    e.preventDefault();
                    debugLog(`🖱️ Mode button clicked: ${mode}`);
                    if (this.performanceMonitor) {
                        this.performanceMonitor.trackUserInteraction('modeToggle', { mode });
                    }
                    this.switchMode(mode);
                });
                debugLog(`✅ Mode button listener attached for ${mode}`);
            }
        });
        
        if (modeButtons.length === 0) {
            debugLog('⚠️ No mode toggle buttons found');
        }
        
        // Set up cached channels listeners
        this.setupCachedChannelsListeners();
        
        debugLog('🔌 Event listeners setup complete');
    }
    
    handleEnvironmentSpecificInit() {
        if (this.appState.currentEnvironment === 'demo') {
            // Demo mode - use encrypted demo key
            this.initializeDemoMode();
        } else if (this.appState.currentEnvironment === 'local') {
            // Local mode - load from environment
            this.initializeLocalMode();
        }
        // Live mode requires user to enter API key
    }
    
    // Event Handlers
    handleApiKeyInput(event) {
        // Track user interaction
        if (this.performanceMonitor) {
            this.performanceMonitor.trackUserInteraction('apiKeyInput', {
                hasValue: !!event.target.value
            });
        }
        
        const apiKey = event.target.value.trim();
        const saveBtn = this.findElement('#saveApiKeyBtn');
        
        // Simple validation - API key should start with AIza and be at least 35 characters
        const isValid = apiKey.startsWith('AIza') && apiKey.length >= 35;
        
        if (isValid) {
            saveBtn?.removeAttribute('disabled');
            saveBtn?.classList.add('valid');
        } else {
            saveBtn?.setAttribute('disabled', 'true');
            saveBtn?.classList.remove('valid');
        }
        
        this.updateAnalyzeButtonState();
    }
    
    handleSaveApiKey() {
        const apiKeyInput = this.findElement('#apiKeyInput');
        if (!apiKeyInput) {
            debugLog('❌ API key input not found');
            return;
        }
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showError('Please enter an API key');
            return;
        }
        
        if (!apiKey.startsWith('AIza')) {
            this.showError('Invalid API key format. YouTube API keys start with "AIza"');
            return;
        }
        
        if (apiKey.length < 35) {
            this.showError('API key appears to be too short. Please check your key.');
            return;
        }
        
        // Use our storage service instead of direct localStorage
        const saved = this.services.storage.saveApiKey(apiKey);
        if (!saved) {
            this.showError('Failed to save API key. Please try again.');
            return;
        }
        
        // Set the API key in the app
        this.setApiKey(apiKey);
        this.appState.apiMode = 'live';
        
        // Clear the input for security
        apiKeyInput.value = '';
        
        // Update the entire UI to reflect the validated state
        this.updateUIAfterApiKeyChange();
        
        this.showSuccess('✅ API key validated! You can now analyze channels.');
        
        debugLog('🔑 API key saved via storage service and UI updated');
    }
    
    handleChannelInput(event) {
        this.updateAnalyzeButtonState();
    }
    
    async handleAnalyzeChannel() {
        // Track user interaction
        if (this.performanceMonitor) {
            this.performanceMonitor.trackUserInteraction('unifiedChannelSearch', {
                environment: this.appState.currentEnvironment,
                hasApiKey: !!this.appState.apiKey
            });
        }
        
        const channelInput = this.findElement('#channelInput');
        const keywordInput = this.findElement('#keywordInput');
        
        if (!channelInput) {
            debugLog('❌ Channel input element not found');
            return;
        }
        
        const channelQuery = channelInput.value.trim();
        if (!channelQuery) {
            this.showError('Please enter a channel URL or handle');
            return;
        }
        
        if (!this.services.youtube) {
            this.showError('Please save your API key first');
            return;
        }
        
        // Get keyword filter if provided
        const keywords = keywordInput ? keywordInput.value.trim() : '';
        
        debugLog('🚀 Starting unified channel search', { 
            channelQuery, 
            keywords: keywords || 'none',
            hasApiKey: !!this.appState.apiKey 
        });
        
        this.setLoadingState(true, 'Searching channel...');
        
        try {
            // Step 1: Analyze channel and get all videos
            await this.analyzeChannel(channelQuery);
            
            // Step 2: Apply keyword filter if provided
            if (keywords) {
                this.setLoadingState(true, 'Applying keyword filters...');
                this.applyKeywordFilter(keywords);
                
                // Update the Results component with filtered videos
                const channelName = this.appState.channelData?.channelTitle || 
                                   this.appState.channelData?.snippet?.title || 
                                   'Unknown Channel';
                
                if (this.components.results) {
                    this.components.results.setVideos(this.appState.filteredVideos, channelName);
                    this.components.results.show();
                    debugLog(`📊 Results component updated with ${this.appState.filteredVideos.length} filtered videos`);
                }
                
                // Update analytics based on filtered results
                this.services.analytics.setVideosData(this.appState.filteredVideos);
                this.renderAnalytics();
                
                const totalVideos = this.appState.videos.length;
                const filteredVideos = this.appState.filteredVideos.length;
                this.showSuccess(`Found ${totalVideos} videos, ${filteredVideos} match your keyword filter`);
            } else {
                // No keywords, show all videos
                const channelName = this.appState.channelData?.channelTitle || 
                                   this.appState.channelData?.snippet?.title || 
                                   'Unknown Channel';
                
                if (this.components.results) {
                    this.components.results.setVideos(this.appState.videos, channelName);
                    this.components.results.show();
                    debugLog(`📊 Results component updated with ${this.appState.videos.length} total videos`);
                }
                
                this.showSuccess(`Analysis complete: ${this.appState.videos.length} videos found`);
            }
            
        } catch (error) {
            debugLog('❌ Unified search failed:', error);
            // Error handling is done in analyzeChannel
        } finally {
            this.setLoadingState(false);
            debugLog('🏁 Unified search completed');
        }
    }
    
    // Core Functionality
    setApiKey(apiKey) {
        this.appState.apiKey = apiKey;
        updateGlobalState('apiKey', apiKey);
        
        // Create or update YouTube API service instance
        this.services.youtube = new YouTubeApiService(apiKey);
        
        // Check for demo mode - use apiMode instead of currentEnvironment
        const isDemoMode = this.appState.apiMode === 'demo' || 
                          this.appState.currentEnvironment === 'demo';
        
        debugLog(`🔑 Setting API key with mode detection:`, {
            apiMode: this.appState.apiMode,
            currentEnvironment: this.appState.currentEnvironment,
            isDemoMode: isDemoMode,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'null'
        });
        
        if (isDemoMode) {
            this.services.youtube.setDemoMode(true);
            debugLog('🎭 Demo mode enabled on YouTube service - 100 video limit active');
            
            // Verify demo mode was set
            setTimeout(() => {
                debugLog('🔍 Verifying demo mode state:', {
                    youtubeServiceDemoMode: this.services.youtube.isDemoMode,
                    appStateDemoMode: this.appState.apiMode === 'demo'
                });
            }, 100);
        } else {
            this.services.youtube.setDemoMode(false);
            debugLog('🌐 Live mode enabled on YouTube service - no video limit');
        }
        
        this.servicesReady.youtube = true;
        debugLog('🔑 YouTube API service ready with new key');
        
        // Update UI state
        this.updateAnalyzeButtonState();
    }
    
    async analyzeChannel(channelQuery, forceRefresh = false) {
        if (!this.services.youtube) {
            throw new Error('YouTube API service not initialized');
        }

        try {
            debugLog('🔍 Starting channel analysis', { query: channelQuery, forceRefresh });
            
            // Get channel data first to get the channel ID
            this.setLoadingState(true, 'Analyzing channel information...');
            const channelData = await this.services.youtube.getChannelData(channelQuery);
            this.appState.channelData = channelData;
            
            // Check cache first (unless force refresh)
            if (!forceRefresh && this.services.storage.isCacheValid(channelData.channelId)) {
                debugLog('📦 Loading from cache...');
                this.setLoadingState(true, 'Loading cached analysis...');
                
                const cachedAnalysis = this.services.storage.loadAnalysis(channelData.channelId);
                if (cachedAnalysis && cachedAnalysis.data) {
                    const cacheMetadata = this.services.storage.getCacheMetadata(channelData.channelId);
                    
                    this.appState.videos = cachedAnalysis.data;
                    this.appState.filteredVideos = cachedAnalysis.data;
                    this.appState.cacheMetadata = cacheMetadata;
                    
                    // Process videos with analytics
                    this.setLoadingState(true, 'Processing cached data...');
                    this.services.analytics.setVideosData(cachedAnalysis.data);
                    
                    // Update Results component with channel name
                    const channelName = channelData.channelTitle || channelData.snippet?.title || 'Unknown Channel';
                    
                    if (this.components.results) {
                        this.components.results.setVideos(cachedAnalysis.data, channelName);
                        this.components.results.show();
                        debugLog(`📊 Results component updated with ${cachedAnalysis.data.length} cached videos`);
                    }
                    
                    // Update analytics display
                    this.setLoadingState(true, 'Finalizing insights...');
                    this.renderAnalytics();
                    
                    // Show cache status
                    this.showCacheStatus(cacheMetadata);
                    
                    debugLog(`✅ Cached analysis loaded: ${cachedAnalysis.data.length} videos (${cacheMetadata.ageHours}h old)`);
                    return;
                }
            }
            
            // Fresh fetch from API
            debugLog('🌐 Fetching fresh data from YouTube API...');
            
            // Get all videos with detailed progress like legacy version
            this.setLoadingState(true, 'Fetching video library...');
            const videos = await this.services.youtube.getAllChannelVideos(
                channelData.uploadsPlaylistId,
                (progressMessage) => {
                    // Use the detailed progress messages from the API service
                    this.setLoadingState(true, progressMessage);
                }
            );
            
            // Process video details with progress
            this.setLoadingState(true, 'Processing video details...');
            const processedVideos = await this.services.youtube.processVideoDataBatched(
                videos,
                (progressMessage) => {
                    // Show detailed processing progress
                    this.setLoadingState(true, progressMessage);
                }
            );
            
            this.appState.videos = processedVideos;
            this.appState.filteredVideos = processedVideos;
            this.appState.cacheMetadata = null; // Clear cache metadata for fresh data
            
            // Process videos with analytics
            this.setLoadingState(true, 'Generating content analysis...');
            this.services.analytics.setVideosData(processedVideos);
            
            // Update Results component with channel name
            const channelName = channelData.channelTitle || channelData.snippet?.title || 'Unknown Channel';
            
            if (this.components.results) {
                this.components.results.setVideos(processedVideos, channelName);
                this.components.results.show();
                debugLog(`📊 Results component updated with ${processedVideos.length} videos from fresh API`);
            }
            
            // Update analytics display
            this.setLoadingState(true, 'Finalizing insights...');
            this.renderAnalytics();
            
            // Save analysis to storage
            this.services.storage.saveAnalysis(channelData.channelId, processedVideos);
            this.services.storage.setLastAnalyzedChannel(channelData.channelId);
            
            // Show fresh data status
            this.showFreshDataStatus();
            
            debugLog(`✅ Fresh channel analysis complete: ${processedVideos.length} videos`);
            
        } catch (error) {
            debugLog('❌ Channel analysis failed:', error);
            
            // Ensure loading state is cleared
            this.setLoadingState(false);
            
            if (error.message.includes('quota')) {
                this.showError('YouTube API quota exceeded. Please try again later or check your API key limits.');
            } else if (error.message.includes('API key')) {
                this.showError('Invalid API key. Please check your YouTube Data API v3 key.');
            } else if (error.message.includes('not found')) {
                this.showError('Channel not found. Please check the channel URL or handle.');
            } else {
                this.showError(`Analysis failed: ${error.message}`);
            }
            
            throw error; // Re-throw for handleAnalyzeChannel to catch
        }
    }
    
    renderAnalytics() {
        const analyticsSection = this.findElement('#analyticsSection');
        debugLog('📊 renderAnalytics called:', {
            hasAnalyticsSection: !!analyticsSection,
            videosLength: this.appState.videos?.length || 0,
            hasAnalyticsService: !!this.services.analytics
        });
        
        if (!analyticsSection || !this.appState.videos.length) {
            debugLog('❌ Analytics rendering skipped:', {
                reason: !analyticsSection ? 'No analytics section' : 'No videos',
                analyticsSection: !!analyticsSection,
                videosLength: this.appState.videos?.length || 0
            });
            return;
        }
        
        debugLog('📊 Rendering complete analytics sections');
        
        // Set videos data in analytics service
        this.services.analytics.setVideosData(this.appState.videos);
        
        // Generate all analysis sections like the legacy app
        const contentAnalysisHTML = this.services.analytics.generateContentAnalysisHTML();
        const advancedAnalysisHTML = this.services.analytics.generateAdvancedAnalysisHTML();
        const chartPanelHTML = this.services.analytics.generateChartPanelHTML('uploadChart');
        
        debugLog('📊 Analytics HTML generated:', {
            contentAnalysisLength: contentAnalysisHTML?.length || 0,
            advancedAnalysisLength: advancedAnalysisHTML?.length || 0,
            chartPanelLength: chartPanelHTML?.length || 0
        });
        
        // Combine all sections with proper styling
        analyticsSection.innerHTML = `
            <div class="analytics-container">
                ${contentAnalysisHTML}
                ${advancedAnalysisHTML}
                ${chartPanelHTML}
            </div>
        `;
        
        debugLog('📊 Analytics HTML set in DOM');
        
        // Create the upload timeline chart after DOM is updated
        setTimeout(() => {
            debugLog('📊 Creating upload timeline chart...');
            this.services.analytics.createUploadTimelineChart('uploadChart');
            debugLog('📊 Upload timeline chart creation attempted');
        }, 100);
        
        debugLog('📊 Complete analytics rendered with chart');
    }
    
    // UI State Management
    updateAnalyzeButtonState() {
        const searchBtn = this.findElement('#searchBtn');
        const channelInput = this.findElement('#channelInput');
        
        if (!searchBtn) {
            debugLog('❌ Search button not found in updateAnalyzeButtonState');
            return;
        }
        
        const hasApiKey = !!this.appState.apiKey;
        const hasChannel = channelInput && channelInput.value.trim().length > 0;
        const isLoading = this.appState.isLoading;
        
        const shouldDisable = !hasApiKey || !hasChannel || isLoading;
        searchBtn.disabled = shouldDisable;
        
        debugLog(`🔘 Button state update:`, {
            hasApiKey,
            hasChannel,
            isLoading,
            disabled: shouldDisable,
            environment: this.appState.currentEnvironment
        });
    }
    
    setLoadingState(isLoading, message = 'Loading...') {
        this.appState.isLoading = isLoading;
        
        debugLog(`🔄 Setting loading state: ${isLoading ? 'ON' : 'OFF'} - ${message}`);
        
        if (isLoading) {
            // Try GlobalLoading first, fallback to direct DOM manipulation
            if (this.components.loadingSpinner && GlobalLoading) {
                try {
                    GlobalLoading.show(message);
                    debugLog('✅ GlobalLoading.show() called');
                } catch (error) {
                    debugLog('❌ GlobalLoading.show() failed:', error);
                    this.fallbackShowLoading(message);
                }
            } else {
                debugLog('⚠️ GlobalLoading not available, using fallback');
                this.fallbackShowLoading(message);
            }
        } else {
            // Try GlobalLoading first, fallback to direct DOM manipulation
            if (this.components.loadingSpinner && GlobalLoading) {
                try {
                    GlobalLoading.hide();
                    debugLog('✅ GlobalLoading.hide() called');
                } catch (error) {
                    debugLog('❌ GlobalLoading.hide() failed:', error);
                    this.fallbackHideLoading();
                }
            } else {
                debugLog('⚠️ GlobalLoading not available, using fallback');
                this.fallbackHideLoading();
            }
        }
        
        this.updateAnalyzeButtonState();
    }
    
    // Fallback loading methods (like legacy version)
    fallbackShowLoading(message) {
        debugLog('🔄 Fallback loading show:', message);
        
        // Create or update loading element
        let loadingEl = this.findElement('#globalLoading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'globalLoading';
            loadingEl.className = 'global-loading';
            document.body.appendChild(loadingEl);
        }
        
        loadingEl.innerHTML = `
            <div class="loading-component loading-overlay" style="display: block;">
                <div class="loading-content">
                    <div class="loading-animation spinner">
                        <div class="circle-spinner"></div>
                    </div>
                    <div class="loading-text">${message}</div>
                </div>
            </div>
        `;
        loadingEl.style.display = 'block';
        
        // Hide results while loading
        const resultsEl = this.findElement('#resultsContainer');
        if (resultsEl) {
            resultsEl.style.display = 'none';
        }
    }
    
    fallbackHideLoading() {
        debugLog('✅ Fallback loading hide');
        
        const loadingEl = this.findElement('#globalLoading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        // Show results if we have videos
        if (this.appState.videos && this.appState.videos.length > 0) {
            const resultsEl = this.findElement('#resultsContainer');
            if (resultsEl) {
                resultsEl.style.display = 'block';
                debugLog('📊 Results container shown');
            }
            
            // Ensure Results component is visible
            if (this.components.results) {
                this.components.results.show();
                debugLog('📊 Results component shown');
            }
        }
    }
    
    // Message Methods
    showError(message, persistent = false) {
        GlobalMessages.error(message, persistent);
    }
    
    showSuccess(message, persistent = false) {
        GlobalMessages.success(message, persistent);
    }
    
    showWarning(message, persistent = false) {
        GlobalMessages.warning(message, persistent);
    }
    
    showInfo(message, persistent = false) {
        GlobalMessages.info(message, persistent);
    }
    
    showProgress(percent, message) {
        if (this.components.loadingSpinner && GlobalLoading) {
            try {
                GlobalLoading.setProgress(percent, message);
            } catch (error) {
                debugLog('❌ GlobalLoading.setProgress() failed:', error);
                // Fallback to just updating the message
                this.fallbackShowLoading(message);
            }
        } else {
            this.fallbackShowLoading(message);
        }
    }
    
    // Environment-specific initialization
    async initializeDemoMode() {
        try {
            // Load demo API key from environment variables
            const demoApiKey = import.meta.env.VITE_DEMO_API_KEY;
            
            if (!demoApiKey || demoApiKey === 'your_youtube_api_key_here') {
                this.showError('Demo mode requires a valid API key. Please set VITE_DEMO_API_KEY in your .env file.');
                debugLog('❌ Demo mode: No valid API key found in environment');
                return;
            }
            
            this.setApiKey(demoApiKey);
            
            // Ensure button state is updated
            setTimeout(() => {
                this.updateAnalyzeButtonState();
                debugLog('🎭 Demo mode button state updated');
            }, 100);
            
            this.showInfo('Demo mode active - Using built-in API key, limited to 100 recent videos');
            debugLog('🎭 Demo mode initialized with environment API key');
        } catch (error) {
            this.showError('Failed to initialize demo mode');
            debugLog('❌ Demo mode initialization error:', error);
        }
    }
    
    async initializeLocalMode() {
        try {
            // In a real implementation, this would load from process.env
            this.showInfo('Local development mode - full functionality enabled');
            debugLog('💻 Local mode initialized');
        } catch (error) {
            this.showError('Failed to initialize local mode');
        }
    }
    
    // Mode switching functionality
    switchMode(newMode) {
        debugLog(`🔄 Switching from ${this.appState.apiMode || this.appState.currentEnvironment} to ${newMode} mode`);
        
        if (this.appState.apiMode === newMode) {
            debugLog('Already in requested mode, no change needed');
            return;
        }
        
        // Clear existing state when switching modes
        this.appState.apiKey = null;
        this.services.youtube = null;
        this.servicesReady.youtube = false;
        
        // Clear any existing analysis data
        this.appState.videos = [];
        this.appState.filteredVideos = [];
        this.appState.channelData = null;
        
        // Update mode state - use apiMode for GitHub Pages
        this.appState.apiMode = newMode;
        updateGlobalState('apiMode', newMode);
        
        // Save mode preference
        localStorage.setItem('yt_hub_mode', newMode);
        
        // Re-render the entire interface
        this.updateHeader();
        
        // Update cached channels list for new mode
        this.updateCachedChannelsList();
        
        // Initialize the new mode
        if (newMode === 'demo') {
            this.initializeDemoMode();
        } else if (newMode === 'live') {
            this.initializeLiveMode();
        }
        
        // Clear any existing results
        if (this.components.results) {
            this.components.results.clearResults();
        }
        
        // Clear analytics
        const analyticsSection = this.findElement('#analyticsSection');
        if (analyticsSection) {
            analyticsSection.innerHTML = `
                <div class="analytics-placeholder">
                    Select a channel to view analytics
                </div>
            `;
        }
        
        // Update button states
        this.updateAnalyzeButtonState();
        
        // Re-setup event listeners for mode-specific elements
        setTimeout(() => {
            this.setupModeSpecificListeners();
        }, 100);
        
        this.showSuccess(`Switched to ${newMode === 'demo' ? 'Demo' : 'Live'} mode`);
    }
    
    updateHeader() {
        // Update mode selector section
        const modeSelectorSection = this.findElement('.mode-selector-section');
        if (modeSelectorSection) {
            modeSelectorSection.innerHTML = this.renderModeToggle();
        }
        
        // Update control panel (API key section)
        const controlPanel = this.findElement('.control-panel');
        if (controlPanel) {
            controlPanel.innerHTML = this.renderApiKeySection() + this.renderSearchSection();
        }
        
        debugLog('✅ Header updated with new mode selector');
    }
    
    /**
     * Setup event listeners for mode-specific elements
     * 
     * CRITICAL FIX (Dec 2024): Ensures mode switching buttons work properly
     * - Re-attaches event listeners after DOM re-rendering
     * - Handles both compact mode buttons and legacy upgrade buttons
     * - Properly manages search button functionality
     * - Includes comprehensive debug logging
     * 
     * This method is called after mode switching to ensure all interactive elements work
     */
    setupModeSpecificListeners() {
        // Re-attach mode toggle listeners (new compact system)
        const modeButtons = this.findElements('.mode-btn-compact');
        modeButtons.forEach(btn => {
            const mode = btn.getAttribute('data-mode');
            if (mode) {
                this.addListener(btn, 'click', (e) => {
                    e.preventDefault();
                    debugLog(`🖱️ Mode button clicked: ${mode}`);
                    if (this.performanceMonitor) {
                        this.performanceMonitor.trackUserInteraction('modeToggle', { mode });
                    }
                    this.switchMode(mode);
                });
                debugLog(`✅ Mode button listener attached for ${mode}`);
            }
        });
        
        // Re-attach API key listeners if in live mode
        const currentMode = this.appState.apiMode || 'demo';
        if (currentMode === 'live') {
            const apiKeyInput = this.findElement('#apiKeyInput');
            const saveKeyBtn = this.findElement('#saveApiKeyBtn');
            
            if (apiKeyInput) {
                this.addListener(apiKeyInput, 'input', this.handleApiKeyInput.bind(this));
                this.addListener(apiKeyInput, 'keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSaveApiKey();
                    }
                });
                debugLog('✅ API key input listeners re-attached for live mode');
            }
            
            if (saveKeyBtn) {
                this.addListener(saveKeyBtn, 'click', this.handleSaveApiKey.bind(this));
                debugLog('✅ Save API key button listener re-attached for live mode');
            }
        }
        
        // Re-attach search button listener (critical!)
        const channelInput = this.findElement('#channelInput');
        const searchBtn = this.findElement('#searchBtn');
        
        if (channelInput) {
            this.addListener(channelInput, 'input', this.handleChannelInput.bind(this));
            this.addListener(channelInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !searchBtn?.disabled) {
                    this.handleAnalyzeChannel();
                }
            });
            debugLog('✅ Channel input listeners re-attached');
        }
        
        if (searchBtn) {
            this.addListener(searchBtn, 'click', (e) => {
                e.preventDefault();
                debugLog('🖱️ Search button clicked (re-attached)');
                if (this.performanceMonitor) {
                    this.performanceMonitor.trackUserInteraction('searchButtonClick', {
                        disabled: searchBtn.disabled,
                        hasApiKey: !!this.appState.apiKey,
                        mode: this.appState.currentEnvironment
                    });
                }
                this.handleAnalyzeChannel();
            });
            debugLog('✅ Search button listener re-attached');
        } else {
            debugLog('❌ Search button not found during re-attachment - this is critical!');
        }
        
        // Update button state
        this.updateAnalyzeButtonState();
        
        debugLog(`✅ Mode-specific listeners setup complete for ${this.appState.currentEnvironment} mode`);
    }
    
    initializeLiveMode() {
        // Clear any existing state
        this.appState.apiKey = null;
        this.services.youtube = null;
        this.servicesReady.youtube = false;
        
        // Clear any API key input if it exists
        const apiKeyInput = this.findElement('#apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
        
        // Try to load saved API key
        const savedApiKey = storageService.getApiKey();
        if (savedApiKey) {
            this.setApiKey(savedApiKey);
            // Pre-fill the input field
            if (apiKeyInput) {
                apiKeyInput.value = savedApiKey;
            }
        }
        
        this.showInfo('Live mode active - Enter your YouTube API key');
        debugLog('🌐 Live mode initialized');
    }
    
    applyKeywordFilter(query) {
        if (!query || !this.appState.videos) return;
        
        // Get filter settings
        const searchScope = this.findElement('input[name="searchScope"]:checked')?.value || 'both';
        const searchLogic = this.findElement('input[name="searchLogic"]:checked')?.value || 'OR';
        
        // Parse keywords - make case insensitive
        let keywords = [];
        if (query.includes(',')) {
            keywords = query.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        } else if (query.toLowerCase().includes(' and ')) {
            keywords = query.toLowerCase().split(' and ').map(k => k.trim()).filter(k => k.length > 0);
        } else {
            keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
        }
        
        debugLog(`Filtering with keywords: [${keywords.join(', ')}] using ${searchLogic} logic in ${searchScope}`);
        
        const originalCount = this.appState.videos.length;
        
        this.appState.filteredVideos = this.appState.videos.filter(video => {
            let searchText = '';
            
            // Build search text based on scope - make case insensitive
            switch (searchScope) {
                case 'title':
                    searchText = (video.title || '').toLowerCase();
                    break;
                case 'description':
                    searchText = (video.fullDescription || video.description || '').toLowerCase();
                    break;
                case 'both':
                default:
                    searchText = `${video.title || ''} ${video.fullDescription || video.description || ''}`.toLowerCase();
                    break;
            }
            
            if (searchLogic === 'AND') {
                const matches = keywords.every(keyword => searchText.includes(keyword));
                if (matches) {
                    debugLog(`✅ AND match: "${video.title}" - all keywords found in ${searchScope}`);
                }
                return matches;
            } else {
                const matchedKeywords = keywords.filter(keyword => searchText.includes(keyword));
                if (matchedKeywords.length > 0) {
                    debugLog(`✅ OR match: "${video.title}" - matched: [${matchedKeywords.join(', ')}] in ${searchScope}`);
                }
                return matchedKeywords.length > 0;
            }
        });
        
        debugLog(`Keyword filter applied: ${originalCount} → ${this.appState.filteredVideos.length} videos`);
    }
    
    // Cleanup
    onDestroy() {
        // Cleanup components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Clear state
        this.appState = null;
        
        // Final performance report before cleanup
        if (this.performanceMonitor) {
            this.performanceMonitor.logPerformanceReport();
        }
        
        debugLog('🗑️ App component destroyed');
    }

    /**
     * Initialize API key based on environment (unified approach)
     */
    async initializeApiKey() {
        debugLog('🔑 Initializing API key...');
        
        const currentEnvironment = this.appState.currentEnvironment;
        
        if (currentEnvironment === 'local') {
            // Local development - try to auto-load from .env
            const apiKey = import.meta.env.VITE_DEMO_API_KEY || 
                           import.meta.env.VITE_YOUTUBE_API_KEY || 
                           import.meta.env.YOUTUBE_API_KEY || 
                           null;
        
            if (apiKey) {
                this.setApiKey(apiKey);
                this.appState.apiMode = 'local-auto';
                debugLog('✅ Local development: API key auto-loaded from .env file');
                this.updateApiKeyStatus();
                return 'local-auto';
            } else {
                this.appState.apiMode = 'manual';
                debugLog('⚠️ Local development: No API key found in .env file');
                this.showWarning('Add VITE_DEMO_API_KEY to your .env file');
                return 'manual';
        }
        } else {
            // GitHub Pages - check for demo mode or load saved key
            const urlParams = new URLSearchParams(window.location.search);
            const modeParam = urlParams.get('mode');
            const savedMode = localStorage.getItem('yt_hub_mode');
            
            if (modeParam === 'live' || savedMode === 'live') {
                // Live mode - try to load saved API key
        const savedApiKey = this.services.storage.getApiKey();
        if (savedApiKey) {
            this.setApiKey(savedApiKey);
            this.appState.apiMode = 'live';
                    debugLog('✅ GitHub Pages: Live mode with saved API key');
            this.showInfo('Using saved API key');
            return 'live';
                } else {
                    this.appState.apiMode = 'live';
                    debugLog('🌐 GitHub Pages: Live mode - user input required');
                    this.showInfo('Please enter your YouTube Data API key');
            return 'live';
        }
            } else {
                // Demo mode - use built-in API key
                const demoApiKey = import.meta.env.VITE_DEMO_API_KEY || null;
                debugLog('🔍 GitHub Pages Demo Mode Debug:', {
                    demoApiKey: demoApiKey ? `${demoApiKey.substring(0, 10)}...` : 'null',
                    demoApiKeyLength: demoApiKey ? demoApiKey.length : 0,
                    allEnvVars: {
                        VITE_DEMO_API_KEY: import.meta.env.VITE_DEMO_API_KEY ? 'present' : 'missing',
                        NODE_ENV: import.meta.env.NODE_ENV,
                        MODE: import.meta.env.MODE,
                        PROD: import.meta.env.PROD,
                        DEV: import.meta.env.DEV
                    }
                });
                
                if (demoApiKey) {
                    this.appState.apiMode = 'demo';  // Set demo mode BEFORE setApiKey
                    this.setApiKey(demoApiKey);
                    debugLog('✅ GitHub Pages: Demo mode with built-in API key');
                    this.showInfo('Demo mode active - Limited to 100 recent videos');
                    return 'demo';
        } else {
                    console.warn('⚠️ GitHub Pages: No demo API key found');
                    debugLog('❌ GitHub Pages: VITE_DEMO_API_KEY is null or undefined');
                    this.appState.apiMode = 'live';
                    this.showWarning('Demo API key not available. Please enter your own.');
                    return 'live';
                }
            }
        }
    }

    /**
     * Update the API key status display in the UI
     */
    updateApiKeyStatus() {
        const currentEnvironment = this.appState.currentEnvironment;
        
        if (currentEnvironment === 'local') {
            const statusSection = this.findElement('.api-key-status-local');
            if (statusSection) {
                const hasApiKey = !!this.appState.apiKey;
                const apiKeySource = hasApiKey ? 'Found in .env file' : 'Not found in .env file';
                
                statusSection.innerHTML = `
                    <div class="status-content">
                        <span class="status-icon">🔐</span>
                        <span class="status-text">API Key: ${apiKeySource}</span>
                        <span class="status-indicator ${hasApiKey ? 'ready' : 'missing'}">
                            ${hasApiKey ? '✅ Ready' : '⚠️ Missing'}
                        </span>
                    </div>
                    ${!hasApiKey ? `
                        <div class="env-help">
                            <p>Add <code>VITE_DEMO_API_KEY=your_key_here</code> to your .env file</p>
                        </div>
                    ` : ''}
                `;
            }
        }
        
        // Update button state as well
        this.updateAnalyzeButtonState();
    }

    /**
     * Update the entire UI after API key changes
     */
    updateUIAfterApiKeyChange() {
        // Re-render the control panel to update disabled states
        const controlPanel = this.findElement('.control-panel');
        if (controlPanel) {
            controlPanel.innerHTML = this.renderApiKeySection() + this.renderSearchSection();
        }
        
        // Re-attach event listeners
        this.setupEventListeners();
        
        // Update button state
        this.updateAnalyzeButtonState();
        
        debugLog('✅ UI updated after API key change');
    }

    showCacheStatus(cacheMetadata) {
        if (!cacheMetadata) return;
        
        const ageText = cacheMetadata.ageHours < 1 ? 
            `${Math.round(cacheMetadata.ageHours * 60)} minutes ago` :
            `${Math.round(cacheMetadata.ageHours)} hours ago`;
            
        this.showInfo(`✅ Using cached data from ${ageText} • ${cacheMetadata.videoCount} videos`);
        
        // Add refresh button to header
        this.addRefreshButton();
    }
    
    showFreshDataStatus() {
        this.showSuccess('✅ Fresh data loaded from YouTube API');
        this.removeRefreshButton();
    }
    
    addRefreshButton() {
        // Remove existing refresh button if any
        this.removeRefreshButton();
        
        const header = this.findElement('.app-header');
        if (header) {
            const refreshBtn = document.createElement('button');
            refreshBtn.id = 'refreshDataBtn';
            refreshBtn.className = 'btn btn-secondary refresh-btn';
            refreshBtn.innerHTML = '🔄 Refresh Data';
            refreshBtn.title = 'Fetch fresh data from YouTube API';
            
            refreshBtn.addEventListener('click', () => {
                this.handleRefreshData();
            });
            
            header.appendChild(refreshBtn);
        }
    }
    
    removeRefreshButton() {
        const refreshBtn = this.findElement('#refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.remove();
        }
    }
    
    async handleRefreshData() {
        if (!this.appState.channelData) {
            this.showWarning('No channel data to refresh');
            return;
        }
        
        try {
            const channelQuery = this.appState.channelData.channelId || 
                               this.appState.channelData.customUrl || 
                               this.appState.channelData.channelTitle;
            
            await this.analyzeChannel(channelQuery, true); // Force refresh
        } catch (error) {
            debugLog('❌ Refresh failed:', error);
            this.showError('Failed to refresh data');
        }
    }
    
    renderCachedChannelsList() {
        const cachedChannels = this.services.storage.getAllCachedChannels();
        const currentMode = this.appState.apiMode || 'demo';
        
        // Filter cached channels based on current mode
        // Demo mode: show channels cached in demo mode (limited to 100 videos)
        // Live mode: show channels cached in live mode (unlimited videos)
        const filteredChannels = cachedChannels.filter(channel => {
            if (currentMode === 'demo') {
                // Demo mode: show only channels with exactly 100 videos (demo limit)
                return channel.videoCount === 100;
        } else {
                // Live mode: show channels with more than 100 videos (or exactly 100 if from live mode)
                // This is a bit tricky since we can't easily distinguish, so we'll show all for now
                // TODO: Add mode metadata to cached data in future
                return true;
            }
        });
        
        debugLog('📋 Cached channels filtered:', {
            total: cachedChannels.length,
            filtered: filteredChannels.length,
            currentMode: currentMode
        });
        
        if (filteredChannels.length === 0) {
            return `
                <div class="cached-channels-empty">
                    <p>No cached channels for ${currentMode} mode yet. Analyze a channel to see it here!</p>
                </div>
            `;
        }
        
        return `
            <div class="cached-channels-list">
                <h3>📋 Recently Analyzed Channels (${currentMode} mode)</h3>
                <div class="cached-channels-grid">
                    ${filteredChannels.map(channel => `
                        <div class="cached-channel-item ${channel.isValid ? 'valid' : 'expired'}" 
                             data-channel-id="${channel.channelId}">
                            <div class="channel-info">
                                <div class="channel-title">🎬 ${channel.channelTitle}</div>
                                <div class="channel-stats">
                                    ${channel.videoCount} videos • ${channel.size}KB
                                </div>
                                <div class="channel-age ${channel.isValid ? 'fresh' : 'stale'}">
                                    📅 ${channel.ageHours < 1 ? 
                                        `${Math.round(channel.ageHours * 60)}m ago` :
                                        `${Math.round(channel.ageHours)}h ago`}
                                    ${channel.isValid ? '' : ' (expired)'}
                                </div>
                            </div>
                            <div class="channel-actions">
                                <button class="btn btn-primary load-cached-btn" 
                                        data-channel-id="${channel.channelId}">
                                    🔄 Load
                                </button>
                                <button class="btn btn-secondary delete-cached-btn" 
                                        data-channel-id="${channel.channelId}">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cache-actions">
                    <button class="btn btn-warning" id="clearAllCacheBtn">
                        🗑️ Clear All Cache
                    </button>
                </div>
            </div>
        `;
    }
    
    setupCachedChannelsListeners() {
        // Load cached channel - use document for better event delegation
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('load-cached-btn')) {
                e.preventDefault();
                const channelId = e.target.dataset.channelId;
                debugLog('🖱️ Load cached button clicked:', channelId);
                await this.loadCachedChannel(channelId);
            }
            
            if (e.target.classList.contains('delete-cached-btn')) {
                e.preventDefault();
                const channelId = e.target.dataset.channelId;
                debugLog('🖱️ Delete cached button clicked:', channelId);
                this.deleteCachedChannel(channelId);
            }
        });
        
        // Clear all cache
        const clearAllBtn = this.findElement('#clearAllCacheBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                debugLog('🖱️ Clear all cache button clicked');
                this.clearAllCache();
            });
        }
        
        debugLog('✅ Cached channels listeners setup complete');
    }
    
    async loadCachedChannel(channelId) {
        try {
            debugLog('📦 Loading cached channel:', channelId);
            
            const cachedAnalysis = this.services.storage.loadAnalysis(channelId);
            if (!cachedAnalysis) {
                debugLog('📢 ERROR: Cached data not found', cachedAnalysis);
                this.showError('Cached data not found');
                return;
            }
            
            const cacheMetadata = this.services.storage.getCacheMetadata(channelId);
            debugLog('📊 Cache metadata:', cacheMetadata);
            
            // Set up app state - cachedAnalysis IS the data array
            this.appState.videos = cachedAnalysis;
            this.appState.filteredVideos = cachedAnalysis;
            this.appState.cacheMetadata = cacheMetadata;
            
            debugLog('📊 App state updated:', {
                videosCount: this.appState.videos.length,
                filteredVideosCount: this.appState.filteredVideos.length,
                hasAnalyticsService: !!this.services.analytics
            });
            
            // Create minimal channel data
            this.appState.channelData = {
                channelId: channelId,
                channelTitle: cacheMetadata?.channelTitle || 'Unknown Channel'
            };
            
            // Process analytics
            debugLog('📊 Setting analytics data...');
            this.services.analytics.setVideosData(cachedAnalysis);
            debugLog('📊 Analytics data set, calling renderAnalytics...');
            
            // Update Results component
            if (this.components.results) {
                this.components.results.setVideos(cachedAnalysis, cacheMetadata?.channelTitle || 'Unknown Channel');
                this.components.results.show();
                debugLog('📊 Results component updated');
        }
        
            // Update analytics display
            this.renderAnalytics();
            debugLog('📊 renderAnalytics() called');
            
            // Show cache status
            if (cacheMetadata) {
                this.showCacheStatus(cacheMetadata);
            }
            
            // Update channel input
            const channelInput = this.findElement('#channelInput');
            if (channelInput && cacheMetadata) {
                channelInput.value = cacheMetadata.channelTitle;
            }
            
            debugLog(`✅ Cached channel loaded: ${cachedAnalysis.length} videos`);
            
        } catch (error) {
            debugLog('❌ Failed to load cached channel:', error);
            this.showError('Failed to load cached channel');
        }
    }
    
    deleteCachedChannel(channelId) {
        if (confirm('Delete this cached analysis?')) {
            this.services.storage.deleteAnalysis(channelId);
            this.updateCachedChannelsList();
            this.showSuccess('Cached analysis deleted');
        }
    }
    
    clearAllCache() {
        if (confirm('Clear all cached analyses? This cannot be undone.')) {
            const cachedChannels = this.services.storage.getAllCachedChannels();
            cachedChannels.forEach(channel => {
                this.services.storage.deleteAnalysis(channel.channelId);
            });
            this.updateCachedChannelsList();
            this.showSuccess('All cache cleared');
        }
    }
    
    updateCachedChannelsList() {
        const cachedSection = this.findElement('.cached-channels-section');
        if (cachedSection) {
            cachedSection.innerHTML = this.renderCachedChannelsList();
            this.setupCachedChannelsListeners();
        }
    }
} 