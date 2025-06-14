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
// import { TagInput } from './TagInput.js';  // YRH-14: Moved to Results component for client-side filtering
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
            // tagInput: null  // YRH-14: Moved to Results component
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
                            <div class="app-logo-icon">📺</div>
                            <div class="title-section">
                                <h1 class="app-title">YouTube Research Hub</h1>
                                <p class="app-subtitle">Comprehensive analysis • Content insights • Strategic planning</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- API Key Section - Primary Focus -->
                ${this.renderApiSection()}
                
                <!-- Form Section - Always Visible -->
                ${this.renderFormSection()}
                
                <!-- Cached Channels Section -->
                <div class="cached-channels-section" id="cachedChannelsSection">
                    <div class="cached-channels-content" id="cachedChannelsContent">
                    ${this.renderCachedChannelsList()}
                    </div>
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
        
        // Wait for Results to be fully mounted before initializing VideoList and TagInput
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
        }, 100);
        
        // Initialize TagInput component with longer delay and better error handling
        setTimeout(() => {
            try {
                let tagInputContainer = document.querySelector('#keywordTagInput');
                if (!tagInputContainer) {
                    debugLog('❌ TagInput container not found, trying fallback selectors...');
                    // Try fallback selectors
                    const fallbackContainer = document.querySelector('.tag-input-container') || 
                                            document.querySelector('#keywords') ||
                                            document.querySelector('.keywords-container');
                    if (fallbackContainer) {
                        debugLog('✅ Found TagInput fallback container');
                        tagInputContainer = fallbackContainer;
                    } else {
                        debugLog('❌ No TagInput container found anywhere');
                        return;
                    }
                }
                
                const currentMode = this.appState.apiMode || 'demo';
                const hasApiKey = !!this.appState.apiKey;
                const shouldDisable = currentMode === 'live' && !hasApiKey;
                
                this.components.tagInput = new TagInput(tagInputContainer, {
                    placeholder: shouldDisable ? 'Enter API key above to unlock' : 'Type keyword and press Enter to add...',
                    maxTags: 10,
                    disabled: shouldDisable
                }).init();
                
                // Listen for tag changes
                this.components.tagInput.on('tagsChanged', (data) => {
                    debugLog(`🏷️ Tags changed: ${data.tags.join(', ')}`);
                    // Update analyze button state when tags change
                    this.updateAnalyzeButtonState();
                    
                    // Real-time filtering when tags change (if we have videos loaded)
                    if (this.appState.videos && this.appState.videos.length > 0) {
                        const keywords = data.tags.join(' ');
                        if (keywords) {
                            this.applyKeywordFilter(keywords);
                            
                            // Update Results component
                            if (this.components.results) {
                                const channelName = this.appState.channelData?.channelTitle || 'Unknown Channel';
                                this.components.results.setVideos(this.appState.filteredVideos, channelName);
                                debugLog(`📊 Results updated: ${this.appState.filteredVideos.length} videos after tag change`);
                            }
                            
                            // Update analytics
                            this.services.analytics.setVideosData(this.appState.filteredVideos);
                            this.renderAnalytics();
                        } else {
                            // No keywords - show all videos
                            this.appState.filteredVideos = [...this.appState.videos];
                            if (this.components.results) {
                                const channelName = this.appState.channelData?.channelTitle || 'Unknown Channel';
                                this.components.results.setVideos(this.appState.filteredVideos, channelName);
                            }
                            this.services.analytics.setVideosData(this.appState.filteredVideos);
                            this.renderAnalytics();
                        }
                    }
                });
                
                debugLog('✅ TagInput component initialized');
            } catch (error) {
                debugLog('❌ TagInput component initialization failed:', error);
            }
        }, 200); // Increased timeout to ensure DOM is ready
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for environment-specific initialization
        this.handleEnvironmentSpecificInit();
        
        // Wait for services to be ready before initializing cache toggle state
        setTimeout(() => {
            this.initializeCacheToggleState();
        }, 250);
        
        // Set initial form state based on current mode and API key
        setTimeout(() => {
            const currentMode = this.appState.apiMode || 'live';
            const hasApiKey = !!this.appState.apiKey;
            const shouldDisableInputs = currentMode === 'live' && !hasApiKey;
            
            if (shouldDisableInputs) {
                this.updateFormInputsState(true);
                debugLog('📝 Initial form state: disabled (no API key in live mode)');
            } else {
                this.updateFormInputsState(false);
                debugLog('📝 Initial form state: enabled');
            }
        }, 300);
        
        // Debug: Check if critical elements exist
        setTimeout(() => {
            debugLog('🔍 Checking critical elements after mount:');
            debugLog('  - Channel input:', !!document.querySelector('#channelInput'));
            debugLog('  - Search button:', !!document.querySelector('#searchBtn'));
            debugLog('  - API key input:', !!document.querySelector('#apiKeyInput'));
            debugLog('  - TagInput container:', !!document.querySelector('#keywordTagInput'));
            debugLog('  - Environment:', this.appState.currentEnvironment);
            debugLog('  - Has API key:', !!this.appState.apiKey);
            
            // Debug: Check button state
            const searchBtn = document.querySelector('#searchBtn');
            if (searchBtn) {
                debugLog('  - Button disabled:', searchBtn.disabled);
                debugLog('  - Button classes:', searchBtn.className);
            }
        }, 350);
        
        debugLog('🏗️ App onMount completed');
    }
    
    // Service Management
    async initializeServices() {
        try {
            // Initialize storage service
            storageService.initialize();
            
            // Set storage mode based on current API mode
            const currentMode = this.appState.apiMode || 'demo';
            storageService.setMode(currentMode);
            debugLog('📦 Storage mode set:', { mode: currentMode });
            
            // Run cache migration to separate Demo/Live cache data
            storageService.migrateCacheToModeSystem();
            
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

    initializeCacheToggleState() {
        const cacheToggleBtn = document.querySelector('.cache-toggle-btn');
        const cachedChannelsSection = document.querySelector('.cached-channels-section');
        
        if (!cacheToggleBtn || !cachedChannelsSection) {
            console.log('🔍 DEBUG: ❌ Cache toggle elements not found');
            return;
        }

        // Check if storage service is available
        if (!this.services?.storage) {
            console.log('🔍 DEBUG: ⚠️ Storage service not ready, skipping cache toggle initialization');
            return;
        }

        // Get current mode and cached channels using the correct service reference
        const currentMode = this.services.storage.getMode();
        const cachedChannels = this.services.storage.getAllCachedChannels();
        
        console.log('Found cached channels for mode', {
            mode: currentMode,
            count: cachedChannels.length
        });

        // Auto-collapse if no cached channels in demo mode
        if (currentMode === 'demo' && cachedChannels.length === 0) {
            cacheToggleBtn.classList.add('collapsed');
            cachedChannelsSection.classList.add('collapsed');
            console.log('🔍 DEBUG: 📋 Cache section auto-collapsed for demo mode (no cached channels)');
        } else {
            // Default to expanded if there are cached channels
            cacheToggleBtn.classList.remove('collapsed');
            cachedChannelsSection.classList.remove('collapsed');
            console.log('🔍 DEBUG: 📋 Cache section initialized as expanded');
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
    renderApiSection() {
        const currentEnvironment = this.appState.currentEnvironment;
        const currentMode = this.appState.apiMode || 'live';
        const hasValidApiKey = !!this.appState.apiKey;
        
        // Use the same API-first interface for ALL environments (local and GitHub Pages)
        // This matches the UX demo design exactly
        return `
            <div class="api-section ${currentMode === 'demo' ? 'disabled' : ''}" id="apiSection">
                <div class="api-label">YouTube Data API Key</div>
                
                <div class="api-input-row">
                    <input type="password" class="xp-input large" id="apiKeyInput" 
                           placeholder="${currentMode === 'demo' ? 'Not needed in demo mode' : 'Enter your YouTube Data API v3 key for unlimited analysis...'}"
                           ${hasValidApiKey ? `value="${this.appState.apiKey}"` : ''}
                           ${currentMode === 'demo' ? 'disabled' : ''}
                           autocomplete="new-password" spellcheck="false">
                    <button class="xp-button toggle-visibility-btn" id="toggleApiKeyVisibility" title="Show/Hide API Key" ${currentMode === 'demo' ? 'style="display: none;"' : ''}>
                        👁️
                    </button>
                    <button class="xp-button success" id="validateBtn" ${hasValidApiKey || currentMode === 'demo' ? 'disabled' : ''}>
                        ${hasValidApiKey ? '✅ Validated' : currentMode === 'demo' ? '🎬 Demo Mode' : '🔑 Validate Key'}
                    </button>
                </div>
                
                <div class="api-help">
                    🚀 Get your <strong>free API key</strong> in just 5 minutes at 
                    <a href="https://console.developers.google.com" target="_blank">Google Cloud Console</a><br>
                    ✅ 100% free forever • 🔒 Private & secure • ⚡ Unlimited analysis power
                    ${currentEnvironment === 'local' ? '<br>🔧 <strong>Local Dev</strong>: API key auto-loaded from .env file' : ''}
                </div>
                
                <div class="demo-button-container">
                    <button class="xp-button demo" id="demoBtn">
                        🎬 Try with sample channel first
                    </button>
                </div>
                
                ${hasValidApiKey ? `
                    <div class="status-message success">
                        ✅ API key validated! Full access unlocked.
                        ${currentEnvironment === 'local' ? ' (Auto-loaded from .env)' : ''}
                    </div>
                ` : ''}
                
                <div id="statusMessage" class="status-message hidden"></div>
            </div>
        `;
    }

    renderEnvironmentInfo() {
        // Remove this - no longer needed
        return '';
    }

    renderApiKeySection() {
        const isDemo = this.appState.currentEnvironment === 'github-pages' && this.appState.apiMode === 'demo';
        const hasValidApiKey = !!this.appState.apiKey;
        
        if (isDemo) {
            return `
                <div class="api-section demo-mode" id="apiSection">
                    <div class="demo-notice">
                        <h3>🎬 Demo Mode Active</h3>
                        <p>Using built-in API key. Limited to @OutdoorBoys channel demonstration.</p>
                        <button class="xp-button warning" id="demoBtn">🔄 Exit Demo Mode</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="api-section ${hasValidApiKey ? 'validated' : ''}" id="apiSection">
            <div class="api-key-section-minimal">
                    <h3>🔑 YouTube Data API Configuration</h3>
                    <div class="api-key-group">
                        <div class="input-with-toggle">
                    <input 
                        type="password" 
                        id="apiKeyInput" 
                                class="xp-input api-key-input" 
                                placeholder="Enter your YouTube Data API v3 key for unlimited analysis..."
                                autocomplete="new-password"
                                spellcheck="false"
                            />
                            <button type="button" class="xp-button toggle-visibility-btn" id="toggleApiKeyVisibility" title="Show/Hide API Key">
                                👁️
                    </button>
                </div>
                        <button class="xp-button success" id="validateBtn" disabled>🔑 Validate Key</button>
                </div>
                    <div class="api-help">
                        <details>
                            <summary>Need an API key? Click here for instructions</summary>
                            <ol>
                                <li>Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                                <li>Create a new project or select existing one</li>
                                <li>Enable the YouTube Data API v3</li>
                                <li>Create credentials (API Key)</li>
                                <li>Copy your API key and paste it above</li>
                            </ol>
                            <p><small>Your API key is stored locally and never shared.</small></p>
                        </details>
                    </div>
                    ${this.appState.currentEnvironment === 'github-pages' ? `
                        <div class="demo-option">
                            <button class="xp-button demo" id="demoBtn">🎬 Try with sample channel first</button>
                            <p class="demo-description">Skip API setup and try with @OutdoorBoys sample data</p>
                    </div>
                ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Render the search section with large, usable input fields
     * 
     * Redesigned (Dec 2024): Enhanced for better usability
     * - Much larger input fields (20px padding) for comfortable typing
     * - Simplified options layout
     * - Larger, more prominent search button
     * - Clear status messaging
     * - Disabled state for live mode without API key
     * 
     * @returns {string} HTML for search section
     */
    renderFormSection() {
        const currentEnvironment = this.appState.currentEnvironment;
        const currentMode = this.appState.apiMode || 'live';
        const hasApiKey = !!this.appState.apiKey;
        
        // Determine if inputs should be disabled (only for live mode without API key)
        const shouldDisableInputs = currentMode === 'live' && !hasApiKey;
        const disabledAttr = shouldDisableInputs ? 'disabled' : '';
        
        return `
            <div class="form-section ${shouldDisableInputs ? 'disabled' : ''}" id="formSection">
                <h2 class="section-title">🎛️ Control Panel</h2>
                <!-- Channel URL Row - Full Width -->
                <div class="form-row channel-row">
                    <div class="form-group">
                        <label class="form-label" for="channelUrl">
                            <span class="form-icon">📺</span>
                            Channel URL
                        </label>
                        <input type="text" class="xp-input large full-width" id="channelInput" 
                               placeholder="${shouldDisableInputs ? 'Enter API key above to unlock' : '@channelname or https://youtube.com/@channel'}"
                               ${disabledAttr}>
                    </div>
                </div>

                <!-- YRH-14: Simplified options row - removed keywords, keeping only video limit and date range -->
                <div class="form-row options-row">
                    <!-- Video Limit Column -->
                    <div class="radio-group compact">
                        <div class="radio-group-title">Video Limit:</div>
                        <div class="radio-option">
                            <input type="radio" id="limit100" name="videoLimit" value="100" ${currentMode === 'demo' ? 'checked' : ''} ${disabledAttr}>
                            <label for="limit100">100 videos (Demo)</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="limitAll" name="videoLimit" value="all" ${currentMode !== 'demo' ? 'checked' : ''} ${disabledAttr}>
                            <label for="limitAll">All videos (Live)</label>
                        </div>
                    </div>
                    
                    <!-- Future: Date Range Picker can be added here -->
                    <div class="date-range-placeholder">
                        <span class="form-label">📅 Date Range: All videos (configurable in future update)</span>
                    </div>
                </div>

                <!-- Analyze Button Row - With Cache Toggle -->
                <div class="form-row analyze-row">
                    <div class="analyze-button-group">
                        <button class="xp-button success analyze-button" id="searchBtn" ${disabledAttr}>
                        📊 Analyze Now
                    </button>
                        <button class="xp-button cache-toggle-btn" id="cacheToggleBtn" type="button">
                            📋 Open Cache
                        </button>
                    </div>
                    <span class="demo-indicator hidden" id="demoIndicator">
                        ${currentMode === 'demo' ? 'Demo mode: fetches up to 100 recent videos' : 'Live mode: fetches complete channel data'}
                    </span>
                </div>
            </div>
        `;
    }
    
    // Event Management
    setupEventListeners() {
        debugLog('🔌 Setting up event listeners...');
        
        // API Key events (all environments now have the same UI)
        const apiKeyInput = this.findElement('#apiKeyInput');
        const validateBtn = this.findElement('#validateBtn');
        const demoBtn = this.findElement('#demoBtn');
        
        if (apiKeyInput && !apiKeyInput.disabled) {
            this.addListener(apiKeyInput, 'input', this.handleApiKeyInput.bind(this));
            this.addListener(apiKeyInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !validateBtn.disabled) this.handleValidateApiKey();
            });
            debugLog('✅ API key input listeners attached');
        } else {
            debugLog('⚠️ API key input not found or disabled (auto-loaded)');
        }
        
        if (validateBtn && !validateBtn.disabled) {
            this.addListener(validateBtn, 'click', this.handleValidateApiKey.bind(this));
            debugLog('✅ Validate API key button listener attached');
        } else {
            debugLog('⚠️ Validate API key button not found or disabled (auto-loaded)');
        }
        
        // API key visibility toggle listener
        const toggleVisibilityBtn = this.findElement('#toggleApiKeyVisibility');
        if (toggleVisibilityBtn) {
            this.addListener(toggleVisibilityBtn, 'click', this.handleToggleApiKeyVisibility.bind(this));
            debugLog('✅ API key visibility toggle listener attached');
        } else {
            debugLog('⚠️ API key visibility toggle button not found');
        }
        
        if (demoBtn) {
            this.addListener(demoBtn, 'click', this.handleDemoMode.bind(this));
            debugLog('✅ Demo button listener attached');
        } else {
            debugLog('⚠️ Demo button not found');
        }
        
        // Channel analysis events
        const channelInput = this.findElement('#channelInput'); // This should match the form
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
        
        // Cache toggle button
        const cacheToggleBtn = this.findElement('#cacheToggleBtn');
        if (cacheToggleBtn) {
            this.addListener(cacheToggleBtn, 'click', this.handleCacheToggle.bind(this));
            debugLog('✅ Cache toggle button listener attached');
        } else {
            debugLog('⚠️ Cache toggle button not found');
        }
        
        // YRH-14: Radio button listeners removed - searchScope and keywordLogic no longer exist
        // All filtering now happens client-side in Results component
        
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
        const saveBtn = this.findElement('#validateBtn');
        
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
    
    handleValidateApiKey() {
        const apiKeyInput = this.findElement('#apiKeyInput');
        const validateBtn = this.findElement('#validateBtn');
        
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
        
        // Show validation in progress
        validateBtn.textContent = '⏳ Validating...';
        validateBtn.disabled = true;
        
        // Use our storage service to save the API key
        const saved = this.services.storage.saveApiKey(apiKey);
        if (!saved) {
            this.showError('Failed to save API key. Please try again.');
            // Reset button state on error
            validateBtn.textContent = '🔑 Validate Key';
            validateBtn.disabled = false;
            return;
        }
        
        // Set the API key in the app
        this.setApiKey(apiKey);
        this.appState.apiMode = 'live';
        
        // Reset validation button to success state
        validateBtn.textContent = '✅ Validated';
        validateBtn.disabled = true; // Keep disabled since it's validated
        validateBtn.classList.add('validated');
        
        // Update UI to show validated state
        this.updateUIAfterApiKeyValidation();
        
        debugLog('🔑 API key validated and saved');
    }
    
    handleToggleApiKeyVisibility() {
        const apiKeyInput = this.findElement('#apiKeyInput');
        const toggleBtn = this.findElement('#toggleApiKeyVisibility');
        
        if (!apiKeyInput || !toggleBtn) {
            debugLog('❌ API key input or toggle button not found');
            return;
        }
        
        const isPassword = apiKeyInput.type === 'password';
        
        if (isPassword) {
            // Show the API key
            apiKeyInput.type = 'text';
            toggleBtn.textContent = '🙈';
            toggleBtn.title = 'Hide API Key';
        } else {
            // Hide the API key
            apiKeyInput.type = 'password';
            toggleBtn.textContent = '👁️';
            toggleBtn.title = 'Show API Key';
        }
        
        debugLog(`👁️ API key visibility toggled: ${isPassword ? 'showing' : 'hiding'}`);
    }
    
    handleDemoMode() {
        const demoBtn = this.findElement('#demoBtn');
        const demoIndicator = this.findElement('#demoIndicator');
        const formSection = this.findElement('#formSection');
        const apiSection = this.findElement('#apiSection');
        
        // Check current demo state more reliably
        const isCurrentlyDemo = this.appState.apiMode === 'demo';
        
        if (isCurrentlyDemo) {
            // Return to normal mode (live mode)
            this.appState.apiMode = 'live';
            this.appState.apiKey = null;
            this.services.youtube = null;
            
            // Update button UI
            demoBtn.textContent = '🎬 Try with sample channel first';
            demoBtn.classList.remove('warning');
            demoBtn.classList.add('demo');
            
            // Hide demo indicator
            if (demoIndicator) demoIndicator.classList.add('hidden');
            
            // Remove demo styling from form
            if (formSection) {
                formSection.classList.remove('demo-active');
                formSection.classList.add('disabled'); // Disable until API key is entered
            }
            
            // Show API section again
            if (apiSection) {
                apiSection.classList.remove('disabled');
                apiSection.style.display = 'block';
            }
            
            // Remove return to normal button
            const existingReturnBtn = this.container.querySelector('.return-to-normal-btn');
            if (existingReturnBtn) {
                existingReturnBtn.remove();
            }
            
            // Reset API key input
            const apiKeyInput = this.findElement('#apiKeyInput');
            const validateBtn = this.findElement('#validateBtn');
            if (apiKeyInput) {
                apiKeyInput.type = 'text';
                apiKeyInput.value = '';
                apiKeyInput.disabled = false;
                apiKeyInput.placeholder = 'Enter your YouTube Data API v3 key for unlimited analysis...';
            }
            if (validateBtn) {
                validateBtn.textContent = '🔑 Validate Key';
                validateBtn.disabled = true;
                validateBtn.classList.remove('validated');
            }
            
            // Clear form and disable inputs
            const channelInput = this.findElement('#channelInput');
            if (channelInput) channelInput.value = '';
            
            if (this.components.tagInput) {
                this.components.tagInput.clearTags();
            }
            
            // Disable form inputs since no API key
            this.updateFormInputsState(true);
            
            this.showInfo('🔄 Returned to live mode - Enter your API key to continue');
            debugLog('🔄 Demo mode disabled, returned to live mode');
        } else {
            // Enter demo mode
            this.appState.apiMode = 'demo';
            
            // Initialize demo with built-in API key
            const demoApiKey = import.meta.env.VITE_DEMO_API_KEY;
            if (demoApiKey) {
                this.setApiKey(demoApiKey);
            }
            
            // Update button UI immediately
            demoBtn.textContent = '🔄 Return to normal';
            demoBtn.classList.remove('demo');
            demoBtn.classList.add('warning');
            
            // Show demo indicator
            if (demoIndicator) demoIndicator.classList.remove('hidden');
            
            // Enable and style form for demo
            if (formSection) {
                formSection.classList.add('demo-active');
                formSection.classList.remove('disabled');
            }
            
            // Hide API section in demo mode, but add return button
            if (apiSection) {
                apiSection.style.display = 'none';
            }
            
            // Add return to normal button in demo mode
            const formSectionForButton = this.findElement('#formSection');
            if (formSectionForButton) {
                // Remove any existing return button
                const existingReturnBtn = formSectionForButton.querySelector('.return-to-normal-btn');
                if (existingReturnBtn) existingReturnBtn.remove();
                
                // Add return button at the top of form section
                const returnBtn = document.createElement('div');
                returnBtn.className = 'return-to-normal-btn';
                returnBtn.innerHTML = `
                    <button class="xp-button warning" id="returnToNormalBtn">
                        🔄 Return to Normal Mode
                    </button>
                `;
                formSectionForButton.insertBefore(returnBtn, formSectionForButton.firstChild);
                
                // Add event listener
                const returnButton = returnBtn.querySelector('#returnToNormalBtn');
                returnButton.addEventListener('click', () => {
                    this.handleDemoMode(); // This will toggle back to normal
                });
            }
            
            // Enable form inputs for demo
            this.updateFormInputsState(false);
            
            // Pre-fill with sample data - use setTimeout to ensure components are ready
            setTimeout(() => {
                const channelInput = this.findElement('#channelInput');
                if (channelInput) {
                    channelInput.value = '@OutdoorBoys';
                    debugLog('✅ Channel input pre-filled with @OutdoorBoys');
                } else {
                    debugLog('❌ Channel input not found (#channelInput)');
                }
                
                if (this.components.tagInput) {
                    this.components.tagInput.setTags(['Alaska']);
                    debugLog('✅ Tags pre-filled with Alaska');
                } else {
                    debugLog('❌ TagInput component not ready');
                }
                
                // Update button states after pre-filling
                this.updateAnalyzeButtonState();
            }, 100);
            
            this.showInfo('🎬 Demo mode active - Using sample data, limited to 100 videos');
            debugLog('🎬 Demo mode enabled with sample data');
        }
        
        // Update button states
        this.updateAnalyzeButtonState();
    }

    handleCacheToggle() {
        const cacheSection = this.findElement('#cachedChannelsSection');
        const cacheContent = this.findElement('#cachedChannelsContent');
        const toggleBtn = this.findElement('#cacheToggleBtn');
        
        if (!cacheSection || !cacheContent || !toggleBtn) {
            debugLog('❌ Cache toggle elements not found');
            return;
        }

        // Toggle the collapsed state
        const isCollapsed = cacheSection.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand
            cacheSection.classList.remove('collapsed');
            toggleBtn.textContent = '📋 Close Cache';
            toggleBtn.classList.remove('collapsed');
            debugLog('📋 Cache section expanded');
        } else {
            // Collapse
            cacheSection.classList.add('collapsed');
            toggleBtn.textContent = '📋 Open Cache';
            toggleBtn.classList.add('collapsed');
            debugLog('📋 Cache section collapsed');
        }

        // Save state to localStorage
        this.services.storage.saveCacheToggleState(!isCollapsed);
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
        
        // YRH-14: Removed keyword filtering from initial search
        // All filtering now happens client-side in Results component
        
        debugLog('🚀 Starting channel analysis', { 
            channelQuery,
            mode: this.appState.apiMode,
            hasApiKey: !!this.appState.apiKey 
        });
        
        this.setLoadingState(true, 'Analyzing channel...');
        
        try {
            // Fetch complete video dataset (no keyword pre-filtering)
            await this.analyzeChannel(channelQuery);
            
            // Show all videos in Results component for client-side filtering
            const channelName = this.appState.channelData?.channelTitle || 
                               this.appState.channelData?.snippet?.title || 
                               'Unknown Channel';
            
            if (this.components.results) {
                this.components.results.setVideos(this.appState.videos, channelName);
                this.components.results.show();
                debugLog(`📊 Results component updated with ${this.appState.videos.length} total videos`);
            }
            
            // Ensure results section is visible
            const resultsSection = this.findElement('.results-section');
            if (resultsSection) {
                resultsSection.classList.add('has-data');
                resultsSection.style.display = 'block';
                debugLog('📊 Results section made visible');
            }
            
            // Update analytics with complete dataset
            this.services.analytics.setVideosData(this.appState.videos);
            this.renderAnalytics();
            
            // Ensure results are visible
            const resultsEl = this.findElement('#resultsContainer');
            const analyticsEl = this.findElement('#analyticsSection');
            if (resultsEl) {
                resultsEl.style.display = 'block';
                resultsEl.style.visibility = 'visible';
            }
            if (analyticsEl) {
                analyticsEl.style.display = 'block';
                analyticsEl.style.visibility = 'visible';
            }
            
            const videoCount = this.appState.videos.length;
            const modeText = this.appState.apiMode === 'demo' ? ' (Demo: 100 recent)' : '';
            this.showSuccess(`Analysis complete: ${videoCount} videos loaded${modeText}. Use filters below to refine results.`);
            
            // Show post-analysis overlay
            this.showPostAnalysisOverlay();
            
        } catch (error) {
            debugLog('❌ Channel analysis failed:', error);
            // Error handling is done in analyzeChannel
        } finally {
            this.setLoadingState(false);
            debugLog('🏁 Channel analysis completed');
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
            
            // TEMPORARY TEST: Add test options for date/count filtering
            const testOptions = {
                // Test different scenarios by uncommenting one of these:
                
                // TEST 1: Count limit only
                // maxVideos: 200,
                
                // TEST 2: Date range only (last 6 months)
                // publishedAfter: '2024-07-01T00:00:00Z',
                
                // TEST 3: Hybrid approach (500 videos from last year)
                maxVideos: 500,
                publishedAfter: '2024-01-01T00:00:00Z',
                
                // TEST 4: Everything from 2023
                // publishedAfter: '2023-01-01T00:00:00Z',
                // publishedBefore: '2024-01-01T00:00:00Z'
            };
            
            debugLog('🧪 TEST MODE: Using test options:', testOptions);
            
            // Get all videos with detailed progress like legacy version
            this.setLoadingState(true, 'Fetching video library...');
            const videos = await this.services.youtube.getAllChannelVideos(
                channelData.uploadsPlaylistId,
                (progressMessage) => {
                    // Use the detailed progress messages from the API service
                    this.setLoadingState(true, progressMessage);
                },
                testOptions // TEMPORARY: Pass test options
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
                
                // Ensure results section is visible
                const resultsSection = this.findElement('.results-section');
                if (resultsSection) {
                    resultsSection.classList.add('has-data');
                    resultsSection.style.display = 'block';
                    debugLog('📊 Results section made visible');
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
        const analyticsSection = this.findElement('.analytics-section');
        if (!analyticsSection) {
            console.log('🔍 DEBUG: ❌ Analytics section not found');
            return;
        }

        // Get the current videos - prioritize Results component's filtered videos
        let currentVideos = [];
        
        // First try to get filtered videos from Results component (this is what user sees)
        if (this.components.results && this.components.results.filteredVideos && this.components.results.filteredVideos.length > 0) {
            currentVideos = this.components.results.filteredVideos;
        } 
        // Fallback to all videos from Results component
        else if (this.components.results && this.components.results.videos && this.components.results.videos.length > 0) {
            currentVideos = this.components.results.videos;
        } 
        // Last resort: use app state videos
        else if (this.appState.videos && this.appState.videos.length > 0) {
            currentVideos = this.appState.videos;
        }
        
        const hasAnalyticsService = this.services?.analytics !== null;
        
        console.log('🔍 DEBUG: 📊 renderAnalytics called:', {
            hasAnalyticsSection: !!analyticsSection,
            videosLength: currentVideos.length,
            hasAnalyticsService,
            hasResultsComponent: !!this.components.results,
            appStateVideosLength: this.appState.videos?.length || 0,
            resultsFilteredLength: this.components.results?.filteredVideos?.length || 0,
            resultsVideosLength: this.components.results?.videos?.length || 0
        });

        if (currentVideos.length === 0 || !hasAnalyticsService) {
            console.log('🔍 DEBUG: ❌ No videos or analytics service for analysis');
            analyticsSection.style.display = 'none';
            return;
        }

        // Ensure analytics service has the current video data
        this.services.analytics.setVideosData(currentVideos);
        
        // Generate analytics for the current video set
        const analytics = this.services.analytics.generateAnalytics();
        const channelTitle = this.appState.channelData?.channelTitle || 'Unknown Channel';

        // Create the analytics HTML
        analyticsSection.innerHTML = `
            <div class="analysis-panel" data-title="Analytics">
            <h3>📊 Analytics for ${channelTitle}</h3>
            
                <div class="analysis-grid">
                    <div class="analysis-stat">
                        <h4>${analytics.overview.totalVideos.toLocaleString()}</h4>
                        <p>Total Videos</p>
                        </div>
                    <div class="analysis-stat">
                        <h4>${analytics.overview.totalViews.toLocaleString()}</h4>
                        <p>Total Views</p>
                        </div>
                    <div class="analysis-stat">
                        <h4>${analytics.overview.averageViews.toLocaleString()}</h4>
                        <p>Average Views</p>
                        </div>
                    </div>
                </div>

            <div class="analysis-panel" data-title="Top Performing">
                <h3>⭐ Top Performing Videos</h3>
                <div class="analysis-grid">
                        ${analytics.topVideos.byViews.slice(0, 3).map(video => `
                        <div class="analysis-stat">
                            <h4>${(video.viewCount || 0).toLocaleString()}</h4>
                            <p>${video.title || 'Untitled'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

            <div class="chart-panel">
                <h3>📅 Upload Timeline</h3>
                <div class="chart-container">
                    <canvas id="uploadChart" width="600" height="300"></canvas>
                </div>
                </div>

            <div class="analysis-panel" data-title="Advanced">
                <h3>🏷️ Content Insights</h3>
                <div style="display: flex; flex-direction: column; gap: var(--xp-spacing-sm);">
                        ${analytics.insights.map(insight => `
                        <div style="background: white; padding: var(--xp-spacing-md); border-radius: var(--xp-border-radius); border: 1px solid var(--xp-border-light);">
                            <span style="margin-right: var(--xp-spacing-sm);">${insight.type === 'warning' ? '⚠️' : 
                                                              insight.type === 'success' ? '✅' : 'ℹ️'}</span>
                            <span>${insight.message}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;

        // Show the analytics section
        analyticsSection.style.display = 'block';

        // Create the upload timeline chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.createUploadTimelineChart(currentVideos);
        }, 100);

        console.log('🔍 DEBUG: ✅ Analytics rendered with', currentVideos.length, 'videos');
    }
    
    // UI State Management
    updateAnalyzeButtonState() {
        // Try multiple possible selectors for the search/analyze button
        const searchBtn = document.querySelector('#searchBtn') || 
                         document.querySelector('.search-btn-large') || 
                         document.querySelector('.analyze-button') ||
                         document.querySelector('button[type="submit"]');
        
        const channelInput = document.querySelector('#channelInput') || 
                            document.querySelector('.channel-input-large');
        
        if (!searchBtn) {
            console.log('🔍 DEBUG: ❌ Search button not found in updateAnalyzeButtonState');
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
                resultsEl.style.visibility = 'visible';
                debugLog('📊 Results container shown');
            }
            
            // Ensure Results component is visible
            if (this.components.results) {
                this.components.results.show();
                debugLog('📊 Results component shown');
            }
            
            // Show analytics section
            const analyticsEl = this.findElement('#analyticsSection');
            if (analyticsEl) {
                analyticsEl.style.display = 'block';
                analyticsEl.style.visibility = 'visible';
                debugLog('📊 Analytics section shown');
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
        
        // Update storage service mode for cache separation
        this.services.storage.setMode(newMode);
        debugLog('📦 Storage mode updated:', { newMode });
        
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
    
    initializeDemoUI() {
        debugLog('🎭 Initializing demo UI state...');
        
        // Update demo button state
        const demoBtn = this.findElement('#demoBtn');
        const demoIndicator = this.findElement('#demoIndicator');
        const formSection = this.findElement('#formSection');
        
        if (demoBtn) {
            demoBtn.textContent = '🔄 Return to normal';
            demoBtn.classList.remove('demo');
            demoBtn.classList.add('warning');
            debugLog('✅ Demo button updated');
        }
        
        if (demoIndicator) {
            demoIndicator.classList.remove('hidden');
            debugLog('✅ Demo indicator shown');
        }
        
        if (formSection) {
            formSection.classList.add('demo-active');
            debugLog('✅ Form section marked as demo-active');
        }
        
        // Pre-fill form with sample data
        const channelInput = this.findElement('#channelInput');
        if (channelInput) {
            channelInput.value = '@OutdoorBoys';
            channelInput.dispatchEvent(new Event('input', { bubbles: true }));
            debugLog('✅ Channel input pre-filled with @OutdoorBoys');
        } else {
            debugLog('❌ Channel input not found (#channelInput)');
        }
        
        // Wait for TagInput to be ready and set tags
        setTimeout(() => {
            if (this.components.tagInput) {
                this.components.tagInput.setTags(['Alaska']);
                debugLog('✅ Tags pre-filled with Alaska');
            } else {
                debugLog('❌ TagInput component not ready');
            }
        }, 100);
        
        // Update button states
        this.updateAnalyzeButtonState();
        debugLog('✅ Demo UI initialization complete');
    }
    
    /**
     * YRH-14: applyKeywordFilter method removed
     * Keyword filtering moved to Results component for client-side processing
     */
    
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
            // GitHub Pages - prioritize live mode, demo is optional
            const urlParams = new URLSearchParams(window.location.search);
            const modeParam = urlParams.get('mode');
            const savedMode = localStorage.getItem('yt_hub_mode');
            
            // Always start in live mode unless explicitly requesting demo via URL parameter
            if (modeParam === 'demo') {
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
                    
                    // Initialize demo UI state properly
                    setTimeout(() => {
                        this.initializeDemoUI();
                    }, 200);
                    
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
            } else {
                // Live mode (default) - try to load saved API key
                const savedApiKey = this.services.storage.getApiKey();
                if (savedApiKey) {
                    this.setApiKey(savedApiKey);
                    this.appState.apiMode = 'live';
                    debugLog('✅ GitHub Pages: Live mode with saved API key');
                    // Don't show notification on initial load - user already has working setup
                    return 'live';
                } else {
                    this.appState.apiMode = 'live';
                    debugLog('🌐 GitHub Pages: Live mode - user input required');
                    // Don't show notification on initial load - only when user needs guidance
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
     * Update the UI after API key validation
     */
    updateUIAfterApiKeyValidation() {
        console.log('🔍 DEBUG: 🚀 Updating UI after API key validation...');
        
        // Enable form sections
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.classList.remove('disabled');
            console.log('🔍 DEBUG: ✅ Form section enabled after API key validation');
        }

        const apiSection = document.querySelector('.api-section');
        if (apiSection) {
            apiSection.classList.remove('disabled');
            console.log('🔍 DEBUG: ✅ API section enabled after validation');
        }

        // Update button states
        this.updateAnalyzeButtonState();
        this.updateFormInputsState(false);
        this.updateAnalyzeButtonState();

        // Collapse API key section after successful validation
        const apiKeySection = document.querySelector('.api-key-section-minimal');
        if (apiKeySection) {
            // Add collapsed state
            apiKeySection.style.maxHeight = '60px';
            apiKeySection.style.overflow = 'hidden';
            
            // Add a small validation indicator
            const existingIndicator = apiKeySection.querySelector('.api-validation-indicator');
            if (!existingIndicator) {
                const indicator = document.createElement('div');
                indicator.className = 'api-validation-indicator';
                indicator.innerHTML = '✅ API Key Validated';
                indicator.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #e8f5e8;
                    color: #2d5a2d;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: bold;
                `;
                apiKeySection.style.position = 'relative';
                apiKeySection.appendChild(indicator);
            }
            
            console.log('🔍 DEBUG: ✅ UI updated after API key validation - section collapsed');
        }

        // Show success message
        this.showSuccess('✅ API key validated! You can now analyze channels.');
        
        console.log('🔍 DEBUG: 🔑 API key validated and saved');
    }

    /**
     * Update the state of form inputs (enable/disable)
     */
    updateFormInputsState(disabled = false) {
        const channelInput = this.findElement('#channelInput');
        const searchBtn = this.findElement('#searchBtn');
        const radioInputs = this.container.querySelectorAll('input[type="radio"]');
        
        if (channelInput) {
            channelInput.disabled = disabled;
            channelInput.placeholder = disabled ? 
                'Enter API key above to unlock' : 
                '@channelname or https://youtube.com/@channel';
        }
        
        if (searchBtn) {
            // Don't force enable if other conditions aren't met
            if (!disabled) {
                this.updateAnalyzeButtonState();
            } else {
                searchBtn.disabled = true;
            }
        }
        
        // Update radio buttons
        if (radioInputs && radioInputs.length > 0) {
            radioInputs.forEach(radio => {
                radio.disabled = disabled;
            });
        }
        
        // Update TagInput component
        if (this.components.tagInput) {
            this.components.tagInput.setDisabled(disabled);
        }
        
        debugLog(`📝 Form inputs ${disabled ? 'disabled' : 'enabled'}`);
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
        
        debugLog('📋 Cached channels loaded:', {
            total: cachedChannels.length,
            currentMode: currentMode
        });
        
        if (cachedChannels.length === 0) {
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
                    ${cachedChannels.map(channel => `
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
            
            // Ensure results section is visible
            const resultsSection = this.findElement('.results-section');
            if (resultsSection) {
                resultsSection.classList.add('has-data');
                resultsSection.style.display = 'block';
                debugLog('📊 Results section made visible');
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
        console.log('🔍 DEBUG: 🖱️ Clear all cache button clicked');
        
        // Get current mode for targeted clearing
        const currentMode = this.services.storage.getMode();
        const cachedChannels = this.services.storage.getAllCachedChannels();
        
        console.log('Found cached channels for mode', {
            mode: currentMode,
            count: cachedChannels.length
        });

        // Clear each cached analysis
        cachedChannels.forEach(channelData => {
            const cacheKey = `${currentMode}_analysis_${channelData.channelId}`;
            console.log('Deleted cached analysis', {
                channelId: channelData.channelId,
                mode: currentMode,
                cacheKey
            });
            localStorage.removeItem(cacheKey);
        });

        // Clear currently displayed results and analytics
        this.clearAnalysisResults();
        
        // Hide results section
        if (this.resultsComponent) {
            this.resultsComponent.hide();
        }
        
        // Hide analytics section
        const analyticsSection = document.querySelector('.analytics-section');
        if (analyticsSection) {
            analyticsSection.style.display = 'none';
            analyticsSection.innerHTML = '';
        }

        // Update the cached channels list display
        this.updateCachedChannelsList();
        
        // Show success message
        this.showSuccess('All cache cleared');
        
        // Update button state
        this.updateAnalyzeButtonState();
    }
    
    updateCachedChannelsList() {
        const cachedSection = this.findElement('.cached-channels-section');
        if (cachedSection) {
            cachedSection.innerHTML = this.renderCachedChannelsList();
            this.setupCachedChannelsListeners();
        }
    }
    
    showPostAnalysisOverlay() {
        const formSection = this.findElement('#formSection');
        if (!formSection) return;
        
        // Remove any existing overlay
        this.hidePostAnalysisOverlay();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'post-analysis-overlay';
        overlay.id = 'postAnalysisOverlay';
        
        const currentMode = this.appState.apiMode || 'demo';
        const returnToNormalBtn = currentMode === 'demo' ? `
            <button class="xp-button warning" id="returnToNormalFromOverlay">
                🔄 Return to Normal Mode
            </button>
        ` : '';
        
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-message">
                    <h3>✅ Analysis Complete!</h3>
                    <p>Use the search filter in the results table to refine your data.</p>
                </div>
                <div class="overlay-actions">
                    <button class="xp-button success" id="startNewAnalysis">
                        🆕 Start New Analysis
                    </button>
                    ${returnToNormalBtn}
                </div>
            </div>
        `;
        
        formSection.appendChild(overlay);
        
        // Add event listeners
        const startNewBtn = overlay.querySelector('#startNewAnalysis');
        const returnBtn = overlay.querySelector('#returnToNormalFromOverlay');
        
        if (startNewBtn) {
            startNewBtn.addEventListener('click', () => {
                this.hidePostAnalysisOverlay();
                this.clearAnalysisResults();
            });
        }
        
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                this.handleDemoMode(); // This will toggle back to normal mode
            });
        }
        
        debugLog('📋 Post-analysis overlay shown');
    }
    
    hidePostAnalysisOverlay() {
        const overlay = this.findElement('#postAnalysisOverlay');
        if (overlay) {
            overlay.remove();
            debugLog('📋 Post-analysis overlay hidden');
        }
    }
    
    clearAnalysisResults() {
        // Clear app state
        this.appState.videos = [];
        this.appState.filteredVideos = [];
        this.appState.channelData = null;
        this.appState.cacheMetadata = null;
        
        // Clear form inputs
        const channelInput = this.findElement('#channelInput');
        if (channelInput) channelInput.value = '';
        
        if (this.components.tagInput) {
            this.components.tagInput.clearTags();
        }
        
        // Clear results
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
        
        debugLog('🗑️ Analysis results cleared for new analysis');
    }

    createUploadTimelineChart(videos) {
        console.log('🔍 DEBUG: 📊 Creating upload timeline chart...');
        
        const canvas = document.getElementById('uploadChart');
        if (!canvas) {
            console.log('🔍 DEBUG: ❌ Upload chart canvas not found');
            return;
        }

        // Simple chart creation without external libraries
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 300;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Group videos by month
        const monthCounts = {};
        videos.forEach(video => {
            if (video.publishedAt) {
                const date = new Date(video.publishedAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
            }
        });
        
        // Get last 12 months
        const months = Object.keys(monthCounts).sort().slice(-12);
        const counts = months.map(month => monthCounts[month] || 0);
        
        if (months.length === 0) {
            // Draw "No data" message
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No upload data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const maxCount = Math.max(...counts, 1);
        
        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight * i / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Draw bars
        const barWidth = chartWidth / months.length * 0.8;
        const barSpacing = chartWidth / months.length;
        
        ctx.fillStyle = '#4a90e2';
        counts.forEach((count, index) => {
            const barHeight = (count / maxCount) * chartHeight;
            const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = padding + chartHeight - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
        
        // Draw labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        months.forEach((month, index) => {
            const x = padding + index * barSpacing + barSpacing / 2;
            const y = padding + chartHeight + 20;
            const shortMonth = month.substring(5); // Just MM part
            ctx.fillText(shortMonth, x, y);
        });
        
        // Y-axis labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxCount * i / 5));
            const y = padding + chartHeight - (chartHeight * i / 5) + 4;
            ctx.fillText(value.toString(), padding - 10, y);
        }
        
        console.log('Upload timeline chart created successfully');
    }
} 