/**
 * StorageService - Handles all localStorage operations
 * 
 * Features:
 * - Analysis caching with timestamps and mode separation
 * - Saved searches management
 * - API key storage and encryption
 * - Safe error handling for localStorage operations
 */

import { debugLog } from '../utils/debug.js';
import { CONFIG } from '../config.js';

export class StorageService {
    constructor() {
        this.isAvailable = this.checkLocalStorageAvailability();
        this.currentMode = null; // Will be set by App component
    }

    // Initialize method (App.js expects this)
    initialize() {
        // Just a no-op since constructor already handles initialization
        debugLog('📦 Storage service initialized');
        return this.isAvailable;
    }

    /**
     * Set the current mode for cache namespacing
     * @param {string} mode - Current mode ('demo' or 'live')
     */
    setMode(mode) {
        this.currentMode = mode;
        debugLog('📦 Storage mode set:', { mode });
    }

    /**
     * Get the current mode, with fallback
     * @returns {string} Current mode ('demo' or 'live')
     */
    getMode() {
        return this.currentMode || 'demo'; // Default to demo for safety
    }

    /**
     * Generate cache key with mode prefix
     * @param {string} channelId - Channel identifier
     * @param {string} mode - Optional mode override
     * @returns {string} Namespaced cache key
     */
    getCacheKey(channelId, mode = null) {
        const currentMode = mode || this.getMode();
        return `${currentMode}_analysis_${channelId}`;
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    checkLocalStorageAvailability() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            debugLog('localStorage not available', error);
            return false;
        }
    }

    /* ===== ANALYSIS CACHING WITH MODE SEPARATION ===== */

    /**
     * Save channel analysis to localStorage with metadata and mode
     * @param {string} channelId - Channel identifier
     * @param {Array} data - Video data array
     * @param {string} mode - Optional mode override
     */
    saveAnalysis(channelId, data, mode = null) {
        if (!this.isAvailable) return false;

        try {
            const currentMode = mode || this.getMode();
            const analysis = {
                channelId,
                data,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString(),
                videoCount: data.length,
                mode: currentMode // Store mode metadata
            };
            
            const cacheKey = this.getCacheKey(channelId, currentMode);
            localStorage.setItem(cacheKey, JSON.stringify(analysis));
            
            debugLog('Analysis saved to localStorage', { 
                channelId, 
                mode: currentMode,
                cacheKey,
                videoCount: data.length,
                size: Math.round(JSON.stringify(analysis).length / 1024) + 'KB'
            });
            return true;
        } catch (error) {
            debugLog('Failed to save analysis', error);
            return false;
        }
    }

    /**
     * Load channel analysis from localStorage for current mode
     * @param {string} channelId - Channel identifier
     * @param {string} mode - Optional mode override
     * @returns {Array|null} Video data or null if not found
     */
    loadAnalysis(channelId, mode = null) {
        if (!this.isAvailable) return null;

        try {
            const currentMode = mode || this.getMode();
            const cacheKey = this.getCacheKey(channelId, currentMode);
            const saved = localStorage.getItem(cacheKey);
            
            if (saved) {
                const analysis = JSON.parse(saved);
                const ageHours = Math.round((Date.now() - analysis.timestamp) / (1000 * 60 * 60));
                
                debugLog('Loaded analysis from cache', { 
                    channelId,
                    mode: currentMode,
                    cacheKey,
                    ageHours,
                    videoCount: analysis.data?.length || 0
                });
                
                // Convert date strings back to Date objects
                if (analysis.data && Array.isArray(analysis.data)) {
                    analysis.data.forEach(video => {
                        if (video.publishedDate && typeof video.publishedDate === 'string') {
                            video.publishedDate = new Date(video.publishedDate);
                        }
                        if (video.publishedAt && typeof video.publishedAt === 'string') {
                            video.publishedAt = new Date(video.publishedAt);
                        }
                    });
                    debugLog('✅ Date objects restored for cached videos');
                }
                
                return analysis.data;
            }
        } catch (error) {
            debugLog('Failed to load analysis', error);
        }
        return null;
    }

    /**
     * Clear cached analysis for a specific channel in current mode
     * @param {string} channelId - Channel identifier
     * @param {string} mode - Optional mode override
     */
    clearAnalysis(channelId, mode = null) {
        if (!this.isAvailable) return false;

        try {
            const currentMode = mode || this.getMode();
            const cacheKey = this.getCacheKey(channelId, currentMode);
            localStorage.removeItem(cacheKey);
            debugLog('Analysis cache cleared', { channelId, mode: currentMode, cacheKey });
            return true;
        } catch (error) {
            debugLog('Failed to clear analysis cache', error);
            return false;
        }
    }

    /**
     * Check if cached analysis is still valid for current mode
     * @param {string} channelId - Channel identifier
     * @param {number} maxAgeHours - Maximum age in hours (default 24)
     * @param {string} mode - Optional mode override
     * @returns {boolean} True if cache is valid
     */
    isCacheValid(channelId, maxAgeHours = 24, mode = null) {
        if (!this.isAvailable) return false;

        try {
            const currentMode = mode || this.getMode();
            const cacheKey = this.getCacheKey(channelId, currentMode);
            const saved = localStorage.getItem(cacheKey);
            if (!saved) return false;

            const analysis = JSON.parse(saved);
            const ageHours = (Date.now() - analysis.timestamp) / (1000 * 60 * 60);
            
            debugLog('Cache validity check', { 
                channelId,
                mode: currentMode,
                cacheKey,
                ageHours: Math.round(ageHours * 10) / 10,
                maxAgeHours,
                isValid: ageHours < maxAgeHours
            });
            
            return ageHours < maxAgeHours;
        } catch (error) {
            debugLog('Failed to check cache validity', error);
            return false;
        }
    }

    /**
     * Get all cached channel analyses with metadata for current mode
     * @param {string} mode - Optional mode override
     * @returns {Array} Array of cached channel objects
     */
    getAllCachedChannels(mode = null) {
        if (!this.isAvailable) return [];

        try {
            const currentMode = mode || this.getMode();
            const cached = [];
            const modePrefix = `${currentMode}_analysis_`;
            
            // Iterate through all localStorage keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(modePrefix)) {
                    const channelId = key.replace(modePrefix, '');
                    const saved = localStorage.getItem(key);
                    
                    if (saved) {
                        const analysis = JSON.parse(saved);
                        const ageHours = (Date.now() - analysis.timestamp) / (1000 * 60 * 60);
                        
                        cached.push({
                            channelId,
                            channelTitle: analysis.data?.[0]?.channelTitle || 'Unknown Channel',
                            videoCount: analysis.videoCount || analysis.data?.length || 0,
                            timestamp: analysis.timestamp,
                            date: analysis.date,
                            ageHours: Math.round(ageHours * 10) / 10,
                            isValid: ageHours < 24,
                            size: Math.round(JSON.stringify(analysis).length / 1024),
                            mode: analysis.mode || currentMode // Include mode metadata
                        });
                    }
                }
            }
            
            // Sort by most recent first
            cached.sort((a, b) => b.timestamp - a.timestamp);
            
            debugLog('Found cached channels for mode', { 
                mode: currentMode, 
                count: cached.length 
            });
            return cached;
        } catch (error) {
            debugLog('Failed to get cached channels', error);
            return [];
        }
    }

    /**
     * Get cache metadata for a specific channel in current mode
     * @param {string} channelId - Channel identifier
     * @param {string} mode - Optional mode override
     * @returns {Object|null} Cache metadata or null
     */
    getCacheMetadata(channelId, mode = null) {
        if (!this.isAvailable) return null;

        try {
            const currentMode = mode || this.getMode();
            const cacheKey = this.getCacheKey(channelId, currentMode);
            const saved = localStorage.getItem(cacheKey);
            if (!saved) return null;

            const analysis = JSON.parse(saved);
            const ageHours = (Date.now() - analysis.timestamp) / (1000 * 60 * 60);
            
            return {
                channelId,
                channelTitle: analysis.data?.[0]?.channelTitle || 'Unknown Channel',
                videoCount: analysis.videoCount || analysis.data?.length || 0,
                timestamp: analysis.timestamp,
                date: analysis.date,
                ageHours: Math.round(ageHours * 10) / 10,
                isValid: ageHours < 24,
                size: Math.round(JSON.stringify(analysis).length / 1024),
                mode: analysis.mode || currentMode
            };
        } catch (error) {
            debugLog('Failed to get cache metadata', error);
            return null;
        }
    }

    /**
     * Migrate existing cache data to mode-based system
     * This runs once to move old cache entries to demo mode
     */
    migrateCacheToModeSystem() {
        if (!this.isAvailable) return false;

        try {
            const migrationKey = 'cache_migration_v1_completed';
            if (localStorage.getItem(migrationKey)) {
                debugLog('Cache migration already completed');
                return true;
            }

            let migratedCount = 0;
            const keysToMigrate = [];
            
            // Find old cache keys (without mode prefix)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('analysis_') && !key.startsWith('demo_analysis_') && !key.startsWith('live_analysis_')) {
                    keysToMigrate.push(key);
                }
            }

            // Migrate each old cache entry to demo mode (safer default)
            keysToMigrate.forEach(oldKey => {
                try {
                    const data = localStorage.getItem(oldKey);
                    if (data) {
                        const channelId = oldKey.replace('analysis_', '');
                        const newKey = `demo_${oldKey}`;
                        
                        // Parse and add mode metadata
                        const analysis = JSON.parse(data);
                        analysis.mode = 'demo';
                        
                        localStorage.setItem(newKey, JSON.stringify(analysis));
                        localStorage.removeItem(oldKey);
                        migratedCount++;
                        
                        debugLog('Migrated cache entry', { 
                            oldKey, 
                            newKey, 
                            channelId 
                        });
                    }
                } catch (error) {
                    debugLog('Failed to migrate cache entry', { oldKey, error });
                }
            });

            // Mark migration as completed
            localStorage.setItem(migrationKey, 'true');
            
            debugLog('Cache migration completed', { 
                migratedCount,
                totalFound: keysToMigrate.length 
            });
            
            return true;
        } catch (error) {
            debugLog('Cache migration failed', error);
            return false;
        }
    }

    /* ===== SAVED SEARCHES ===== */

    /**
     * Get all saved searches
     * @returns {Array} Array of saved search objects
     */
    getSavedSearches() {
        if (!this.isAvailable) return [];

        try {
            const saved = localStorage.getItem('youtubeSearches');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            debugLog('Failed to load saved searches', error);
            return [];
        }
    }

    /**
     * Save a new search to the saved searches list
     * @param {Object} searchData - Search configuration object
     */
    saveSearch(searchData) {
        if (!this.isAvailable) return false;

        try {
            const search = {
                id: Date.now(),
                name: searchData.name || `${searchData.channel}${searchData.keywords ? ` (${searchData.keywords})` : ''}`,
                channel: searchData.channel,
                keywords: searchData.keywords || '',
                logic: searchData.logic || 'OR',
                order: searchData.order || 'date',
                date: new Date().toLocaleDateString(),
                videoCount: searchData.videoCount || 0,
                timestamp: Date.now()
            };

            const savedSearches = this.getSavedSearches();
            savedSearches.unshift(search); // Add to beginning

            // Keep only the most recent searches per config
            const maxSearches = CONFIG.STORAGE?.MAX_SAVED_SEARCHES || 50;
            if (savedSearches.length > maxSearches) {
                savedSearches.splice(maxSearches);
            }

            localStorage.setItem('youtubeSearches', JSON.stringify(savedSearches));
            debugLog('Search saved', { searchId: search.id, name: search.name });
            return search;
        } catch (error) {
            debugLog('Failed to save search', error);
            return false;
        }
    }

    /**
     * Delete a saved search by ID
     * @param {number} searchId - Search ID to delete
     */
    deleteSavedSearch(searchId) {
        if (!this.isAvailable) return false;

        try {
            const savedSearches = this.getSavedSearches();
            const filtered = savedSearches.filter(s => s.id !== searchId);
            
            localStorage.setItem('youtubeSearches', JSON.stringify(filtered));
            debugLog('Search deleted', { searchId });
            return true;
        } catch (error) {
            debugLog('Failed to delete search', error);
            return false;
        }
    }

    /**
     * Find a saved search by ID
     * @param {number} searchId - Search ID to find
     * @returns {Object|null} Search object or null if not found
     */
    getSavedSearch(searchId) {
        const savedSearches = this.getSavedSearches();
        return savedSearches.find(s => s.id === searchId) || null;
    }

    /**
     * Clear all saved searches
     */
    clearAllSavedSearches() {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem('youtubeSearches');
            debugLog('All saved searches cleared');
            return true;
        } catch (error) {
            debugLog('Failed to clear saved searches', error);
            return false;
        }
    }

    /* ===== API KEY STORAGE ===== */

    /**
     * Save API key to localStorage
     * @param {string} apiKey - YouTube API key
     */
    saveApiKey(apiKey) {
        if (!this.isAvailable) return false;

        try {
            if (apiKey && apiKey.startsWith('AIza')) {
                localStorage.setItem('youtubeApiKey', apiKey);
                debugLog('✅ API key saved to localStorage');
                return true;
            }
            return false;
        } catch (error) {
            debugLog('Failed to save API key', error);
            return false;
        }
    }

    /**
     * Load saved API key from localStorage
     * @returns {string|null} API key or null if not found
     */
    loadSavedApiKey() {
        if (!this.isAvailable) return null;

        try {
            const savedKey = localStorage.getItem('youtubeApiKey');
            if (savedKey && savedKey.startsWith('AIza')) {
                debugLog('✅ Client API key loaded from localStorage');
                return savedKey;
            }
        } catch (error) {
            debugLog('Error loading saved API key', error);
        }
        return null;
    }

    /**
     * Alias for loadSavedApiKey (App.js expects this method name)
     * @returns {string|null} API key or null if not found
     */
    getApiKey() {
        return this.loadSavedApiKey();
    }

    /**
     * Clear saved API key
     */
    clearApiKey() {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem('youtubeApiKey');
            debugLog('API key cleared from localStorage');
            return true;
        } catch (error) {
            debugLog('Failed to clear API key', error);
            return false;
        }
    }

    /* ===== CACHE TOGGLE STATE ===== */

    /**
     * Save cache toggle state
     * @param {boolean} isCollapsed - Whether cache section is collapsed
     */
    saveCacheToggleState(isCollapsed) {
        if (!this.isAvailable) return false;

        try {
            localStorage.setItem('cache_toggle_collapsed', JSON.stringify(isCollapsed));
            debugLog('Cache toggle state saved', { isCollapsed });
            return true;
        } catch (error) {
            debugLog('Failed to save cache toggle state', error);
            return false;
        }
    }

    /**
     * Load cache toggle state
     * @returns {boolean} Whether cache section should be collapsed (default: false)
     */
    getCacheToggleState() {
        if (!this.isAvailable) return false;

        try {
            const saved = localStorage.getItem('cache_toggle_collapsed');
            if (saved !== null) {
                const isCollapsed = JSON.parse(saved);
                debugLog('Cache toggle state loaded', { isCollapsed });
                return isCollapsed;
            }
        } catch (error) {
            debugLog('Failed to load cache toggle state', error);
        }
        return false; // Default to expanded
    }

    /* ===== LAST ANALYZED CHANNEL ===== */

    /**
     * Get the last analyzed channel ID
     * @returns {string|null} Channel ID or null if not found
     */
    getLastAnalyzedChannel() {
        if (!this.isAvailable) return null;

        try {
            return localStorage.getItem('lastAnalyzedChannel');
        } catch (error) {
            debugLog('Failed to get last analyzed channel', error);
            return null;
        }
    }

    /**
     * Set the last analyzed channel ID
     * @param {string} channelId - Channel ID to store
     */
    setLastAnalyzedChannel(channelId) {
        if (!this.isAvailable) return false;

        try {
            localStorage.setItem('lastAnalyzedChannel', channelId);
            debugLog('Last analyzed channel set', { channelId });
            return true;
        } catch (error) {
            debugLog('Failed to set last analyzed channel', error);
            return false;
        }
    }

    /* ===== GENERAL UTILITIES ===== */

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }

        try {
            let totalSize = 0;
            let itemCount = 0;
            const items = {};

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    totalSize += size;
                    itemCount++;

                    if (key.startsWith('analysis_')) {
                        items.analyses = (items.analyses || 0) + 1;
                    } else if (key === 'youtubeSearches') {
                        items.savedSearches = JSON.parse(value).length;
                    } else if (key === 'youtubeApiKey') {
                        items.apiKey = true;
                    }
                }
            }

            return {
                available: true,
                totalSizeKB: Math.round(totalSize / 1024),
                itemCount,
                items,
                quotaUsedPercent: Math.round((totalSize / (5 * 1024 * 1024)) * 100) // Assume 5MB quota
            };
        } catch (error) {
            debugLog('Failed to get storage info', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Clear all YouTube Research Hub data from localStorage
     */
    clearAllData() {
        if (!this.isAvailable) return false;

        try {
            const keysToRemove = [];
            
            // Find all our keys (including new mode-based cache keys)
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    if (key.startsWith('analysis_') || 
                        key.startsWith('demo_analysis_') ||
                        key.startsWith('live_analysis_') ||
                        key === 'youtubeSearches' || 
                        key === 'youtubeApiKey' ||
                        key === 'cache_migration_v1_completed' ||
                        key.startsWith('demo_usage_')) {
                        keysToRemove.push(key);
                    }
                }
            }

            // Remove all found keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            debugLog('All YouTube Research Hub data cleared', { 
                keysRemoved: keysToRemove.length 
            });
            return true;
        } catch (error) {
            debugLog('Failed to clear all data', error);
            return false;
        }
    }

    /**
     * Delete a cached analysis for current mode
     * @param {string} channelId - Channel identifier
     * @param {string} mode - Optional mode override
     * @returns {boolean} True if deleted successfully
     */
    deleteAnalysis(channelId, mode = null) {
        if (!this.isAvailable) return false;

        try {
            const currentMode = mode || this.getMode();
            const cacheKey = this.getCacheKey(channelId, currentMode);
            localStorage.removeItem(cacheKey);
            debugLog('Deleted cached analysis', { 
                channelId, 
                mode: currentMode, 
                cacheKey 
            });
            return true;
        } catch (error) {
            debugLog('Failed to delete cached analysis', error);
            return false;
        }
    }
}

// Create singleton instance with environment detection
// Only create the instance if we're in a browser environment
function createStorageService() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return new StorageService();
    } else {
        // Return a mock for Node.js environment
        return {
            isAvailable: false,
            initialize: () => false,
            checkLocalStorageAvailability: () => false,
            saveAnalysis: () => false,
            loadAnalysis: () => null,
            clearAnalysis: () => false,
            getSavedSearches: () => [],
            saveSearch: () => false,
            deleteSavedSearch: () => false,
            getSavedSearch: () => null,
            clearAllSavedSearches: () => false,
            saveApiKey: () => false,
            loadSavedApiKey: () => null,
            getApiKey: () => null,
            clearApiKey: () => false,
            getLastAnalyzedChannel: () => null,
            setLastAnalyzedChannel: () => false,
            getStorageInfo: () => ({ available: false }),
            clearAllData: () => false
        };
    }
}

export const storageService = createStorageService(); 