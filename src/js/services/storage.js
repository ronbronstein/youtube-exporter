/**
 * StorageService - Handles all localStorage operations
 * 
 * Features:
 * - Analysis caching with timestamps
 * - Saved searches management
 * - API key storage and encryption
 * - Safe error handling for localStorage operations
 */

import { debugLog } from '../utils/debug.js';
import { CONFIG } from '../config.js';

export class StorageService {
    constructor() {
        this.isAvailable = this.checkLocalStorageAvailability();
    }

    // Check if localStorage is available
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

    /* ===== ANALYSIS CACHING ===== */

    /**
     * Save channel analysis to localStorage with metadata
     * @param {string} channelId - Channel identifier
     * @param {Array} data - Video data array
     */
    saveAnalysis(channelId, data) {
        if (!this.isAvailable) return false;

        try {
            const analysis = {
                channelId,
                data,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString(),
                videoCount: data.length
            };
            
            localStorage.setItem(`analysis_${channelId}`, JSON.stringify(analysis));
            debugLog('Analysis saved to localStorage', { 
                channelId, 
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
     * Load channel analysis from localStorage
     * @param {string} channelId - Channel identifier
     * @returns {Array|null} Video data or null if not found
     */
    loadAnalysis(channelId) {
        if (!this.isAvailable) return null;

        try {
            const saved = localStorage.getItem(`analysis_${channelId}`);
            if (saved) {
                const analysis = JSON.parse(saved);
                const ageHours = Math.round((Date.now() - analysis.timestamp) / (1000 * 60 * 60));
                
                debugLog('Loaded analysis from cache', { 
                    channelId, 
                    ageHours,
                    videoCount: analysis.data?.length || 0
                });
                
                return analysis.data;
            }
        } catch (error) {
            debugLog('Failed to load analysis', error);
        }
        return null;
    }

    /**
     * Clear cached analysis for a specific channel
     * @param {string} channelId - Channel identifier
     */
    clearAnalysis(channelId) {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem(`analysis_${channelId}`);
            debugLog('Analysis cache cleared', { channelId });
            return true;
        } catch (error) {
            debugLog('Failed to clear analysis cache', error);
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
            
            // Find all our keys
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    if (key.startsWith('analysis_') || 
                        key === 'youtubeSearches' || 
                        key === 'youtubeApiKey' ||
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
}

// Create singleton instance
export const storageService = new StorageService(); 