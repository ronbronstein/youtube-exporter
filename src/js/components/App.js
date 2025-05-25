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
            savedSearches: []
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
        
        // Load saved state
        await this.loadSavedState();
        
        debugLog(`✅ App initialized in ${this.appState.currentEnvironment} environment`);
    }
    
    template() {
        return `
            <div class="app-main">
                <!-- Global Messages Banner -->
                <div id="globalMessages" class="global-messages-banner"></div>
                
                <!-- Header Section -->
                <div class="app-header">
                    <div class="header-top">
                        <div class="title-section">
                            <h1>📺 YouTube Channel Research Hub</h1>
                            <p>Comprehensive analysis • Content insights • Strategic planning</p>
                        </div>
                    </div>
                </div>
                
                <!-- Mode Selector Section (Prominent) -->
                <div class="mode-selector-section">
                    ${this.renderModeToggle()}
                </div>
                
                <!-- Control Panel -->
                <div class="control-panel">
                    ${this.renderApiKeySection()}
                    ${this.renderSearchSection()}
                </div>
                
                <!-- Main Content Area -->
                <div class="main-content">
                    <!-- Results Section with integrated VideoList -->
                    <div class="results-section">
                        <div id="resultsContainer" class="results-container"></div>
                    </div>
                    
                    <!-- Analytics Section -->
                    <div class="analytics-section" id="analyticsSection">
                        <div class="analytics-placeholder">
                            Select a channel to view analytics
                        </div>
                    </div>
                </div>
                
                <!-- Global Loading Overlay -->
                <div id="globalLoading" class="global-loading"></div>
            </div>
        `;
    }
    
    onMount() {
        debugLog('🏗️ App onMount started');
        
        // Initialize global components
        this.components.messagePanel = GlobalMessages.init(
            this.findElement('#globalMessages'),
            { position: 'banner', maxMessages: 1, autoHideDelay: { success: 3000, error: 8000, warning: 5000, info: 4000 } }
        );
        
        this.components.loadingSpinner = GlobalLoading.init(
            this.findElement('#globalLoading'),
            { overlay: true, showProgress: true }
        );
        
        // Initialize Results component (which will contain VideoList)
        this.components.results = new Results(
            this.findElement('#resultsContainer'),
            { enableViewToggle: true, enableExport: true, enableFilter: true, defaultView: 'list' }
        ).init();
        
        // Wait for Results to be fully mounted before initializing VideoList
        setTimeout(() => {
            // Initialize VideoList inside Results component  
            this.components.videoList = new VideoList(
                this.components.results.findElement('#videoDisplayContainer'),
                { enableViewSwitch: false, enableSorting: true, defaultView: 'list' }
            ).init();
            
            // Connect Results and VideoList components
            this.components.results.on('viewChanged', (data) => {
                this.components.videoList.switchView(data.view);
            });
            
            this.components.results.on('videosChanged', (data) => {
                this.components.videoList.setVideos(data.videos);
            });
            
            this.components.results.on('videosFiltered', (data) => {
                this.components.videoList.setVideos(data.videos);
            });
            
            this.components.results.on('error', (data) => {
                this.showError(data.message);
            });
        }, 0);
        
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
            
            // Load last API key (encrypted)
            const savedApiKey = storageService.getApiKey();
            if (savedApiKey) {
                this.setApiKey(savedApiKey);
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
    
    // Environment-specific methods
    renderModeToggle() {
        const currentMode = this.appState.currentEnvironment;
        
        // Only show mode selector on GitHub Pages, not for local development
        if (currentMode === 'local') {
            return `
                <div class="local-mode-banner">
                    <div class="banner-content">
                        <div class="banner-icon">🏠</div>
                        <div class="banner-text">
                            <h3>Local Development Mode</h3>
                            <p>Using your API key from .env file • Full functionality • No limitations</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // GitHub Pages mode selector (demo/live switching)
        return `
            <div class="mode-selector">
                <div class="mode-selector-header">
                    <h3>🎛️ Choose Your Mode</h3>
                    <p>Select how you want to use the YouTube Research Hub</p>
                </div>
                
                <div class="mode-options">
                    <div class="mode-option ${currentMode === 'demo' ? 'active' : ''}" data-mode="demo">
                        <div class="mode-icon">🎭</div>
                        <div class="mode-content">
                            <h4>Demo Mode</h4>
                            <p><strong>Try it instantly!</strong></p>
                            <ul>
                                <li>✅ Built-in API key</li>
                                <li>✅ No setup required</li>
                                <li>⚠️ Limited to 100 videos</li>
                                <li>⚠️ Shared quota</li>
                            </ul>
                            <button class="mode-btn ${currentMode === 'demo' ? 'active' : ''}" data-mode="demo">
                                ${currentMode === 'demo' ? '✅ Active' : '🎭 Try Demo'}
                            </button>
                        </div>
                    </div>
                    
                    <div class="mode-option ${currentMode === 'live' ? 'active' : ''}" data-mode="live">
                        <div class="mode-icon">🚀</div>
                        <div class="mode-content">
                            <h4>Full Version</h4>
                            <p><strong>Unlimited power!</strong></p>
                            <ul>
                                <li>✅ Your own API key</li>
                                <li>✅ Unlimited videos</li>
                                <li>✅ Full functionality</li>
                                <li>✅ Private quota</li>
                            </ul>
                            <button class="mode-btn ${currentMode === 'live' ? 'active' : ''}" data-mode="live">
                                ${currentMode === 'live' ? '✅ Active' : '🚀 Use Full Version'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mode-status">
                    <div class="current-mode">
                        <span class="status-icon">${currentMode === 'demo' ? '🎭' : '🚀'}</span>
                        <span class="status-text">
                            Currently in <strong>${currentMode === 'demo' ? 'Demo' : 'Full'} Mode</strong>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEnvironmentInfo() {
        // This is now integrated into the mode selector above
        return '';
    }

    renderApiKeySection() {
        const currentMode = this.appState.currentEnvironment;
        
        if (currentMode === 'local') {
            // Local development - API key comes from .env, no input needed
            return `
                <div class="local-api-status">
                    <div class="status-content">
                        <span class="status-icon">🔐</span>
                        <span class="status-text">API key loaded from .env file</span>
                        <span class="status-indicator ${this.appState.apiKey ? 'ready' : 'missing'}">
                            ${this.appState.apiKey ? '✅ Ready' : '⚠️ Missing'}
                        </span>
                    </div>
                    ${!this.appState.apiKey ? `
                        <div class="env-help">
                            <p>Add <code>YOUTUBE_API_KEY=your_key_here</code> to your .env file</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        if (currentMode === 'demo') {
            return `
                <div class="demo-status-banner">
                    <div class="banner-content">
                        <div class="banner-icon">🎭</div>
                        <div class="banner-text">
                            <h3>Demo Mode Active</h3>
                            <p>Using built-in API key • Limited to 100 videos per analysis • Perfect for trying the app!</p>
                        </div>
                        <div class="banner-action">
                            <button class="upgrade-btn" data-mode="live">
                                🚀 Upgrade to Full Version
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Live mode - show API key input
        return `
            <div class="api-key-section">
                <div class="api-key-header">
                    <div class="header-content">
                        <span class="key-icon">🔐</span>
                        <div class="header-text">
                            <h3>YouTube API Key Required</h3>
                            <p>Enter your free YouTube Data API v3 key to unlock full functionality</p>
                        </div>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="get-key-btn">
                            🆓 Get Free API Key
                        </a>
                    </div>
                </div>
                
                <div class="api-key-input-section">
                    <div class="input-group">
                        <input 
                            type="password" 
                            id="apiKeyInput" 
                            placeholder="AIza... (paste your YouTube Data API v3 key here)"
                            class="api-key-input"
                        >
                        <button id="saveApiKeyBtn" class="save-key-btn">
                            💾 Save Key
                        </button>
                    </div>
                    
                    <div class="api-key-help">
                        <div class="help-item">
                            <span class="help-icon">🔒</span>
                            <span>Stored locally only • Never sent to our servers</span>
                        </div>
                        <div class="help-item">
                            <span class="help-icon">🆓</span>
                            <span>Free tier: 10,000 requests/day • More than enough for most users</span>
                        </div>
                        <div class="help-item">
                            <span class="help-icon">⚡</span>
                            <span>Takes 2 minutes to set up • Works immediately</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSearchSection() {
        return `
            <div class="search-section">
                <div class="search-header">
                    <h3>🔍 Channel Search & Analysis</h3>
                    <p>Enter a channel and optional filters to analyze videos</p>
                </div>
                
                <!-- Main Search Input -->
                <div class="search-input-group">
                    <div class="input-row">
                        <input 
                            type="text" 
                            id="channelInput" 
                            placeholder="@channel, channel URL, or channel ID (required)"
                            class="channel-input"
                        >
                    </div>
                    <div class="input-row">
                        <input 
                            type="text" 
                            id="keywordInput" 
                            placeholder="Filter keywords: tutorial, AI, security (optional)"
                            class="keyword-input"
                        >
                    </div>
                </div>
                
                <!-- Search Options -->
                <div class="search-options">
                    <div class="options-row">
                        <div class="option-group">
                            <label class="group-label">Search in:</label>
                            <label class="radio-option">
                                <input type="radio" name="searchScope" value="both" checked> 
                                Title & Description
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="searchScope" value="title"> 
                                Title Only
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="searchScope" value="description"> 
                                Description Only
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label class="group-label">Keyword logic:</label>
                            <label class="radio-option">
                                <input type="radio" name="searchLogic" value="OR" checked> 
                                Any keyword (OR)
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="searchLogic" value="AND"> 
                                All keywords (AND)
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label class="group-label">Content types:</label>
                            <label class="checkbox-option">
                                <input type="checkbox" id="includeShorts" checked> 
                                YouTube Shorts
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" id="includeLiveStreams" checked> 
                                Live Streams
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Single Search Button -->
                <div class="search-action">
                    <button id="searchBtn" class="search-btn" disabled>
                        🔍 Search & Analyze Channel
                    </button>
                    <div class="search-help">
                        ${this.appState.currentEnvironment === 'demo' ? 
                            'Demo mode: 100 video limit, built-in API key' : 
                            this.appState.currentEnvironment === 'live' ? 
                                'Live mode: Full access with your API key' : 
                                'Development mode'
                        }
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
        
        // Mode toggle events
        const demoModeBtn = this.findElement('#demoModeBtn');
        const liveModeBtn = this.findElement('#liveModeBtn');
        
        if (demoModeBtn) {
            this.addListener(demoModeBtn, 'click', (e) => {
                debugLog('🖱️ Demo mode button clicked');
                if (this.performanceMonitor) {
                    this.performanceMonitor.trackUserInteraction('modeToggle', { mode: 'demo' });
                }
                this.switchMode('demo');
            });
            debugLog('✅ Demo mode button listener attached');
        } else {
            debugLog('⚠️ Demo mode button not found');
        }
        
        if (liveModeBtn) {
            this.addListener(liveModeBtn, 'click', (e) => {
                debugLog('🖱️ Live mode button clicked');
                if (this.performanceMonitor) {
                    this.performanceMonitor.trackUserInteraction('modeToggle', { mode: 'live' });
                }
                this.switchMode('live');
            });
            debugLog('✅ Live mode button listener attached');
        } else {
            debugLog('⚠️ Live mode button not found');
        }
        
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
                hasValue: !!event.target.value,
                isValid: validateApiKey(event.target.value)
            });
        }
        
        const apiKey = event.target.value.trim();
        const saveBtn = this.findElement('#saveApiKeyBtn');
        
        if (validateApiKey(apiKey)) {
            this.appState.apiKey = apiKey;
            saveBtn?.removeAttribute('disabled');
            saveBtn?.classList.add('valid');
        } else {
            this.appState.apiKey = null;
            saveBtn?.setAttribute('disabled', 'true');
            saveBtn?.classList.remove('valid');
        }
        
        this.updateAnalyzeButtonState();
    }
    
    handleSaveApiKey() {
        if (this.appState.apiKey && validateApiKey(this.appState.apiKey)) {
            this.setApiKey(this.appState.apiKey);
            storageService.saveApiKey(this.appState.apiKey);
            this.showSuccess('API key saved successfully');
        }
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
                this.components.results.setVideos(this.appState.filteredVideos, channelName);
                
                // Update analytics based on filtered results
                this.services.analytics.setVideosData(this.appState.filteredVideos);
                this.renderAnalytics();
                
                const totalVideos = this.appState.videos.length;
                const filteredVideos = this.appState.filteredVideos.length;
                this.showSuccess(`Found ${totalVideos} videos, ${filteredVideos} match your keyword filter`);
            } else {
                // No keywords, show all videos
                this.showSuccess(`Analysis complete: ${this.appState.videos.length} videos found`);
            }
            
        } catch (error) {
            debugLog('❌ Unified search failed:', error);
            // Error handling is done in analyzeChannel
        } finally {
            this.setLoadingState(false);
        }
    }
    
    // Core Functionality
    setApiKey(apiKey) {
        this.appState.apiKey = apiKey;
        updateGlobalState('apiKey', apiKey);
        
        // Create or update YouTube API service instance
        this.services.youtube = new YouTubeApiService(apiKey);
        
        // Check for demo mode
        if (this.appState.currentEnvironment === 'demo') {
            this.services.youtube.setDemoMode(true);
        }
        
        this.servicesReady.youtube = true;
        debugLog('🔑 YouTube API service ready with new key');
        
        // Update UI state
        this.updateAnalyzeButtonState();
    }
    
    async analyzeChannel(channelQuery) {
        if (!this.services.youtube) {
            throw new Error('YouTube API service not initialized');
        }
        
        try {
            debugLog('🔍 Starting channel analysis', { query: channelQuery });
            
            // Get channel data
            this.showProgress(20, 'Getting channel information...');
            const channelData = await this.services.youtube.getChannelData(channelQuery);
            this.appState.channelData = channelData;
            
            // Get all videos
            this.showProgress(40, 'Fetching video library...');
            const videos = await this.services.youtube.getAllChannelVideos(
                channelData.uploadsPlaylistId,
                (message) => this.showProgress(60, message)
            );
            
            this.appState.videos = videos;
            this.appState.filteredVideos = videos;
            
            // Process videos with analytics
            this.showProgress(80, 'Processing video analytics...');
            this.services.analytics.setVideosData(videos);
            
            // Update Results component with channel name
            const channelName = channelData.channelTitle || channelData.snippet?.title || 'Unknown Channel';
            this.components.results.setVideos(videos, channelName);
            
            // Update analytics display
            this.showProgress(90, 'Generating insights...');
            this.renderAnalytics();
            
            // Save analysis to storage
            storageService.saveAnalysis(channelData.channelId, videos);
            storageService.setLastAnalyzedChannel(channelData.channelId);
            
            this.showProgress(100, 'Complete!');
            
            debugLog(`✅ Channel analysis complete: ${videos.length} videos`);
            
        } catch (error) {
            debugLog('❌ Channel analysis failed:', error);
            
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
        if (!analyticsSection || !this.appState.videos.length) return;
        
        // Generate analytics HTML
        const analysisHTML = this.services.analytics.generateContentAnalysisHTML();
        analyticsSection.innerHTML = analysisHTML;
        
        debugLog('📊 Analytics rendered');
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
        
        if (isLoading) {
            GlobalLoading.show(message);
        } else {
            GlobalLoading.hide();
        }
        
        this.updateAnalyzeButtonState();
    }
    
    showProgress(percent, message) {
        GlobalLoading.setProgress(percent, message);
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
        debugLog(`🔄 Switching from ${this.appState.currentEnvironment} to ${newMode} mode`);
        
        if (this.appState.currentEnvironment === newMode) {
            debugLog('Already in requested mode, no change needed');
            return;
        }
        
        // Use the new environment utility
        import('../utils/environment.js').then(({ switchToMode }) => {
            switchToMode(newMode);
        });
        
        // Clear existing state when switching modes
        this.appState.apiKey = null;
        this.services.youtube = null;
        this.servicesReady.youtube = false;
        
        // Clear any existing analysis data
        this.appState.videos = [];
        this.appState.filteredVideos = [];
        this.appState.channelData = null;
        
        // Update environment state
        this.appState.currentEnvironment = newMode;
        updateGlobalState('currentEnvironment', newMode);
        
        // Re-render the entire interface
        this.updateHeader();
        
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
        
        this.showSuccess(`Switched to ${newMode === 'demo' ? 'Demo' : 'Full'} mode`);
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
    
    setupModeSpecificListeners() {
        // Re-attach mode toggle listeners (new system)
        const modeButtons = this.findElements('.mode-btn, .upgrade-btn');
        modeButtons.forEach(btn => {
            const mode = btn.getAttribute('data-mode');
            if (mode) {
                this.addListener(btn, 'click', (e) => {
                    e.preventDefault();
                    this.switchMode(mode);
                });
            }
        });
        
        // Re-attach API key listeners if in live mode
        if (this.appState.currentEnvironment === 'live') {
            const apiKeyInput = this.findElement('#apiKeyInput');
            const saveKeyBtn = this.findElement('#saveApiKeyBtn');
            
            if (apiKeyInput) {
                this.addListener(apiKeyInput, 'input', this.handleApiKeyInput.bind(this));
                this.addListener(apiKeyInput, 'keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSaveApiKey();
                    }
                });
            }
            
            if (saveKeyBtn) {
                this.addListener(saveKeyBtn, 'click', this.handleSaveApiKey.bind(this));
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
        
        // Parse keywords
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
            
            // Build search text based on scope
            switch (searchScope) {
                case 'title':
                    searchText = video.title.toLowerCase();
                    break;
                case 'description':
                    searchText = (video.fullDescription || video.description || '').toLowerCase();
                    break;
                case 'both':
                default:
                    searchText = `${video.title} ${video.fullDescription || video.description || ''}`.toLowerCase();
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
} 