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
import { LoadingSpinner, GlobalLoading } from './LoadingSpinner.js';
import { MessagePanel, GlobalMessages } from './MessagePanel.js';
import { youtubeApiService } from '../services/youtubeApi.js';
import { storageService } from '../services/storage.js';
import { analyticsService } from '../services/analytics.js';
import { CONFIG, getGlobalState, updateGlobalState } from '../config.js';
import { detectEnvironment } from '../utils/environment.js';
import { validateApiKey } from '../utils/security.js';
import { debugLog } from '../utils/debug.js';

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
            messagePanel: null
        };
        
        // Service ready flags
        this.servicesReady = {
            youtube: false,
            storage: false,
            analytics: false
        };
    }
    
    get defaultOptions() {
        return {
            autoInit: true,
            enableDemoMode: true,
            enableAnalytics: true
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
                <!-- Header Section -->
                <div class="app-header">
                    <h1>📺 YouTube Channel Research Hub</h1>
                    <p>Comprehensive analysis • Content insights • Strategic planning</p>
                    <div class="environment-badge">
                        ${this.renderEnvironmentBadge()}
                    </div>
                </div>
                
                <!-- Control Panel -->
                <div class="control-panel">
                    ${this.renderApiKeySection()}
                    ${this.renderSearchSection()}
                </div>
                
                <!-- Global Messages Container -->
                <div id="globalMessages" class="global-messages"></div>
                
                <!-- Main Content Area -->
                <div class="main-content">
                    <!-- Videos Section -->
                    <div class="videos-section">
                        <div id="videoListContainer" class="video-list-container"></div>
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
        // Initialize global components
        this.components.messagePanel = GlobalMessages.init(
            this.findElement('#globalMessages'),
            { position: 'top', maxMessages: 3 }
        );
        
        this.components.loadingSpinner = GlobalLoading.init(
            this.findElement('#globalLoading'),
            { overlay: true, showProgress: true }
        );
        
        this.components.videoList = new VideoList(
            this.findElement('#videoListContainer'),
            { enableViewSwitch: true, defaultView: 'list' }
        ).init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for environment-specific initialization
        this.handleEnvironmentSpecificInit();
    }
    
    // Service Management
    async initializeServices() {
        try {
            // Initialize storage service
            storageService.initialize();
            this.servicesReady.storage = true;
            debugLog('📦 Storage service ready');
            
            // Initialize analytics service
            analyticsService.initialize();
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
    renderEnvironmentBadge() {
        const env = this.appState.currentEnvironment;
        const badges = {
            demo: '<span class="env-badge demo">🎭 Demo Mode</span>',
            live: '<span class="env-badge live">🌐 Live Version</span>',
            local: '<span class="env-badge local">💻 Local Development</span>'
        };
        return badges[env] || '<span class="env-badge unknown">❓ Unknown</span>';
    }
    
    renderApiKeySection() {
        if (this.appState.currentEnvironment === 'demo') {
            return `
                <div class="demo-banner">
                    <div class="demo-icon">🎭</div>
                    <div class="demo-content">
                        <h3>Demo Mode Active</h3>
                        <p>Using encrypted demo API key • Limited to 100 videos per analysis</p>
                        <a href="#" class="upgrade-link">Upgrade to full version →</a>
                    </div>
                </div>
            `;
        }
        
        if (this.appState.currentEnvironment === 'local') {
            return `
                <div class="local-banner">
                    <div class="local-icon">💻</div>
                    <div class="local-content">
                        <h3>Local Development Mode</h3>
                        <p>API key loaded from environment • Full functionality enabled</p>
                    </div>
                </div>
            `;
        }
        
        // Live environment - show API key input
        return `
            <div class="api-key-section">
                <div class="api-key-header">
                    <span class="key-icon">🔐</span>
                    <strong>YouTube API Key Required</strong>
                    <a href="https://console.cloud.google.com/" target="_blank" class="get-key-link">
                        Get Free API Key →
                    </a>
                </div>
                <div class="api-key-input-group">
                    <input 
                        type="password" 
                        id="apiKeyInput" 
                        placeholder="AIza... (paste your YouTube Data API v3 key)"
                        class="api-key-input"
                    >
                    <button id="saveApiKeyBtn" class="save-key-btn">Save Key</button>
                </div>
                <div class="api-key-notice">
                    <strong>🔒 Secure:</strong> Stored locally only • Not sent to our servers
                </div>
            </div>
        `;
    }
    
    renderSearchSection() {
        return `
            <div class="search-section">
                <div class="search-header">
                    <h3>🔍 Channel Analysis</h3>
                </div>
                <div class="search-input-group">
                    <input 
                        type="text" 
                        id="channelInput" 
                        placeholder="@channel, channel URL, or channel ID"
                        class="channel-input"
                    >
                    <button id="analyzeBtn" class="analyze-btn" disabled>
                        Analyze Channel
                    </button>
                </div>
                <div class="search-options">
                    <label>
                        <input type="checkbox" id="includeShorts"> Include YouTube Shorts
                    </label>
                    <label>
                        <input type="checkbox" id="includeLiveStreams"> Include Live Streams
                    </label>
                </div>
            </div>
        `;
    }
    
    // Event Management
    setupEventListeners() {
        // API Key events (live environment only)
        if (this.appState.currentEnvironment === 'live') {
            const apiKeyInput = this.findElement('#apiKeyInput');
            const saveKeyBtn = this.findElement('#saveApiKeyBtn');
            
            if (apiKeyInput) {
                this.addListener(apiKeyInput, 'input', this.handleApiKeyInput.bind(this));
                this.addListener(apiKeyInput, 'keydown', (e) => {
                    if (e.key === 'Enter') this.handleSaveApiKey();
                });
            }
            
            if (saveKeyBtn) {
                this.addListener(saveKeyBtn, 'click', this.handleSaveApiKey.bind(this));
            }
        }
        
        // Channel analysis events
        const channelInput = this.findElement('#channelInput');
        const analyzeBtn = this.findElement('#analyzeBtn');
        
        if (channelInput) {
            this.addListener(channelInput, 'input', this.handleChannelInput.bind(this));
            this.addListener(channelInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !analyzeBtn.disabled) {
                    this.handleAnalyzeChannel();
                }
            });
        }
        
        if (analyzeBtn) {
            this.addListener(analyzeBtn, 'click', this.handleAnalyzeChannel.bind(this));
        }
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
        const apiKey = event.target.value.trim();
        const saveBtn = this.findElement('#saveApiKeyBtn');
        const analyzeBtn = this.findElement('#analyzeBtn');
        
        const isValid = validateApiKey(apiKey);
        if (saveBtn) {
            saveBtn.disabled = !isValid;
        }
        
        this.updateAnalyzeButtonState();
    }
    
    handleSaveApiKey() {
        const apiKeyInput = this.findElement('#apiKeyInput');
        if (!apiKeyInput) return;
        
        const apiKey = apiKeyInput.value.trim();
        if (!validateApiKey(apiKey)) {
            this.showError('Please enter a valid YouTube API key');
            return;
        }
        
        this.setApiKey(apiKey);
        this.showSuccess('API key saved successfully');
    }
    
    handleChannelInput(event) {
        this.updateAnalyzeButtonState();
    }
    
    async handleAnalyzeChannel() {
        const channelInput = this.findElement('#channelInput');
        if (!channelInput) return;
        
        const channelQuery = channelInput.value.trim();
        if (!channelQuery) {
            this.showError('Please enter a channel to analyze');
            return;
        }
        
        if (!this.appState.apiKey) {
            this.showError('Please provide a YouTube API key first');
            return;
        }
        
        await this.analyzeChannel(channelQuery);
    }
    
    // Core Functionality
    setApiKey(apiKey) {
        this.appState.apiKey = apiKey;
        
        // Initialize YouTube API service
        youtubeApiService.setApiKey(apiKey);
        this.servicesReady.youtube = true;
        
        // Store encrypted
        storageService.saveApiKey(apiKey);
        
        this.updateAnalyzeButtonState();
        debugLog('🔑 API key set and YouTube service initialized');
    }
    
    async analyzeChannel(channelQuery) {
        try {
            this.setLoadingState(true, 'Analyzing channel...');
            
            // Get channel data
            const channelData = await youtubeApiService.getChannelData(channelQuery);
            this.appState.channelData = channelData;
            
            this.showProgress(25, 'Fetching videos...');
            
            // Get all videos
            const videos = await youtubeApiService.getAllChannelVideos(channelData.uploadsPlaylistId);
            this.appState.videos = videos;
            this.appState.filteredVideos = videos;
            
            this.showProgress(75, 'Generating analytics...');
            
            // Generate analytics
            if (this.options.enableAnalytics) {
                analyticsService.setVideosData(videos);
                const analysis = analyticsService.generateContentAnalysis();
                this.appState.lastAnalysis = analysis;
            }
            
            // Update UI
            this.components.videoList.setVideos(videos);
            this.renderAnalytics();
            
            // Save analysis
            storageService.saveAnalysis(channelData.channelId, {
                channelData,
                videos,
                analysis: this.appState.lastAnalysis,
                timestamp: Date.now()
            });
            
            this.setLoadingState(false);
            this.showSuccess(`Analysis complete! Found ${videos.length} videos.`);
            
        } catch (error) {
            this.setLoadingState(false);
            this.showError(`Analysis failed: ${error.message}`);
            debugLog('❌ Channel analysis error:', error);
        }
    }
    
    renderAnalytics() {
        const analyticsSection = this.findElement('#analyticsSection');
        if (!analyticsSection || !this.appState.lastAnalysis) return;
        
        const analysisHTML = analyticsService.generateContentAnalysisHTML();
        analyticsSection.innerHTML = analysisHTML;
    }
    
    // UI State Management
    updateAnalyzeButtonState() {
        const analyzeBtn = this.findElement('#analyzeBtn');
        const channelInput = this.findElement('#channelInput');
        
        if (!analyzeBtn) return;
        
        const hasApiKey = !!this.appState.apiKey;
        const hasChannel = channelInput && channelInput.value.trim().length > 0;
        
        analyzeBtn.disabled = !hasApiKey || !hasChannel || this.appState.isLoading;
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
            // In a real implementation, this would fetch the encrypted demo key
            // For now, we'll simulate it
            this.showInfo('Demo mode initialized - 100 video limit active');
            debugLog('🎭 Demo mode initialized');
        } catch (error) {
            this.showError('Failed to initialize demo mode');
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
        
        debugLog('🗑️ App component destroyed');
    }
} 