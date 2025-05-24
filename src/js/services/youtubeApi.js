/**
 * YouTube API Service
 * Handles all interactions with the YouTube Data API v3
 */

import { CONFIG } from '../config.js';
import { debugLog } from '../utils/debug.js';
import { formatDuration } from '../utils/formatter.js';

export class YouTubeApiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.isDemoMode = false;
    }

    /**
     * Set the API key
     * @param {string} apiKey - YouTube API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Enable or disable demo mode
     * @param {boolean} enabled - Whether demo mode is active
     */
    setDemoMode(enabled) {
        this.isDemoMode = enabled;
    }

    /**
     * Get channel ID from various input formats
     * @param {string} channelInput - Channel URL, handle, or ID
     * @returns {Promise<string>} Channel ID
     */
    async getChannelId(channelInput) {
        let channelId = '';
        
        try {
            if (channelInput.includes('youtube.com/channel/')) {
                const parts = channelInput.split('youtube.com/channel/');
                if (parts.length > 1) {
                    channelId = parts[1].split('/')[0];
                }
            } else if (channelInput.includes('youtube.com/@')) {
                const parts = channelInput.split('youtube.com/@');
                if (parts.length > 1) {
                    const handle = parts[1].split('/')[0];
                    channelId = await this.getChannelIdFromHandle(handle);
                }
            } else if (channelInput.startsWith('@')) {
                const handle = channelInput.substring(1);
                channelId = await this.getChannelIdFromHandle(handle);
            } else {
                channelId = await this.getChannelIdFromHandle(channelInput);
            }
            
            if (!channelId) {
                throw new Error('Could not extract channel ID');
            }
            
            return channelId;
        } catch (error) {
            throw new Error(`Channel parsing failed: ${error.message}`);
        }
    }

    /**
     * Get channel ID from handle using YouTube API
     * @param {string} handle - Channel handle (without @)
     * @returns {Promise<string>} Channel ID
     */
    async getChannelIdFromHandle(handle) {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/channels?part=id&forHandle=${handle}&key=${this.apiKey}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            if (data.items && data.items.length > 0) {
                return data.items[0].id;
            }
            
            // Try search if forHandle doesn't work
            const searchResponse = await fetch(`${CONFIG.API.BASE_URL}/search?part=snippet&type=channel&q=${handle}&key=${this.apiKey}&maxResults=1`);
            const searchData = await searchResponse.json();
            
            if (searchData.error) {
                throw new Error(searchData.error.message);
            }
            
            if (searchData.items && searchData.items.length > 0) {
                return searchData.items[0].id?.channelId || searchData.items[0].snippet?.channelId;
            }
            
            throw new Error('Channel not found');
        } catch (error) {
            throw new Error(`Handle lookup failed: ${error.message}`);
        }
    }

    /**
     * Get channel data including uploads playlist ID
     * @param {string} channelInput - Channel URL, handle, or ID
     * @returns {Promise<object>} Channel data with channelId and uploadsPlaylistId
     */
    async getChannelData(channelInput) {
        const channelId = await this.getChannelId(channelInput);
        
        // Get channel details including uploads playlist
        const response = await fetch(`${CONFIG.API.BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (!data.items || data.items.length === 0) {
            throw new Error('Channel not found');
        }
        
        const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
        
        return {
            channelId,
            uploadsPlaylistId
        };
    }

    /**
     * Get ALL videos from uploads playlist (comprehensive channel analysis)
     * @param {string} uploadsPlaylistId - Channel's uploads playlist ID
     * @param {function} progressCallback - Callback for progress updates
     * @returns {Promise<Array>} Array of video objects
     */
    async getAllChannelVideos(uploadsPlaylistId, progressCallback = null) {
        let allVideos = [];
        let nextPageToken = null;
        let pageCount = 0;
        const maxResults = CONFIG.API.BATCH_SIZE;
        
        // Demo mode video limit
        const videoLimit = this.isDemoMode ? CONFIG.DEMO.MAX_VIDEOS_PER_ANALYSIS : Infinity;
        let videosCollected = 0;
        
        do {
            let playlistUrl = `${CONFIG.API.BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`;
            
            if (nextPageToken) {
                playlistUrl += `&pageToken=${nextPageToken}`;
            }
            
            debugLog(`Fetching uploads page ${pageCount + 1}`, { url: playlistUrl.replace(this.apiKey, 'HIDDEN') });
            
            const response = await fetch(playlistUrl);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            if (data.items && data.items.length > 0) {
                // Convert playlist items to search-like format
                const videos = data.items.map(item => ({
                    id: { videoId: item.snippet.resourceId.videoId },
                    snippet: item.snippet
                }));
                
                // Apply demo mode video limit
                const videosToAdd = videos.slice(0, Math.max(0, videoLimit - videosCollected));
                allVideos = allVideos.concat(videosToAdd);
                videosCollected += videosToAdd.length;
                
                debugLog(`Fetched ${data.items.length} videos, added ${videosToAdd.length}, total: ${allVideos.length}`);
                
                // Update progress with demo mode info
                if (progressCallback) {
                    if (this.isDemoMode) {
                        progressCallback(`Demo Mode: Fetching videos... Found ${allVideos.length}/${videoLimit} (limited for cost control)`);
                    } else {
                        progressCallback(`Fetching complete video library... Found ${allVideos.length} so far`);
                    }
                }
                
                // Stop if we've reached the demo limit
                if (this.isDemoMode && videosCollected >= videoLimit) {
                    debugLog(`Demo mode: Reached video limit of ${videoLimit}`);
                    break;
                }
            }
            
            nextPageToken = data.nextPageToken;
            pageCount++;
            
            // Safety limit to prevent infinite loops
            if (pageCount >= 100) {
                debugLog('Reached maximum page limit (100 pages = ~5000 videos)');
                break;
            }
            
        } while (nextPageToken && (!this.isDemoMode || videosCollected < videoLimit));
        
        debugLog(`Total videos from uploads playlist: ${allVideos.length}${this.isDemoMode ? ` (demo limited to ${videoLimit})` : ''}`);
        return allVideos;
    }

    /**
     * Process videos in batches to get detailed information
     * @param {Array} items - Array of video items from playlist
     * @param {function} progressCallback - Callback for progress updates
     * @returns {Promise<Array>} Array of processed video objects with details
     */
    async processVideoDataBatched(items, progressCallback = null) {
        if (!items || items.length === 0) {
            throw new Error('No videos found');
        }
        
        let videosData = [];
        const batchSize = CONFIG.API.BATCH_SIZE;
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const videoIds = batch.map(item => item.id?.videoId).filter(Boolean).join(',');
            
            if (!videoIds) continue;
            
            if (progressCallback) {
                progressCallback(`Processing video details... ${i + batch.length}/${items.length}`);
            }
            
            try {
                const detailsResponse = await fetch(`${CONFIG.API.BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`);
                const detailsData = await detailsResponse.json();
                
                if (detailsData.error) {
                    throw new Error(detailsData.error.message);
                }
                
                if (detailsData.items) {
                    const batchVideos = detailsData.items.map(video => ({
                        title: video.snippet?.title || 'No title',
                        description: (video.snippet?.description || '').substring(0, 150) + '...',
                        fullDescription: video.snippet?.description || '',
                        publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : 'Unknown',
                        publishedDate: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
                        channelTitle: video.snippet?.channelTitle || 'Unknown channel',
                        viewCount: parseInt(video.statistics?.viewCount || 0),
                        likeCount: parseInt(video.statistics?.likeCount || 0),
                        commentCount: parseInt(video.statistics?.commentCount || 0),
                        duration: formatDuration(video.contentDetails?.duration),
                        videoId: video.id,
                        url: `https://youtube.com/watch?v=${video.id}`,
                        thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || '',
                        tags: video.snippet?.tags || []
                    }));
                    
                    videosData = videosData.concat(batchVideos);
                }
            } catch (error) {
                debugLog(`Batch processing error for batch starting at ${i}`, error);
                // Continue with other batches
            }
            
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return videosData;
    }

    /**
     * Validate YouTube API key
     * @param {string} apiKey - API key to validate
     * @returns {Promise<object>} Validation result with valid boolean and error message
     */
    async validateApiKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
            return {
                valid: false,
                error: 'Invalid API key format. YouTube API keys start with "AIza" and are 39+ characters.'
            };
        }
        
        try {
            // Test API accessibility with minimal quota usage
            const testUrl = `${CONFIG.API.BASE_URL}/search?part=snippet&type=channel&q=test&maxResults=1&key=${apiKey}`;
            const response = await fetch(testUrl);
            const data = await response.json();
            
            if (data.error) {
                if (data.error.code === 403) {
                    return {
                        valid: false,
                        error: 'API key access denied. Check your key restrictions and quotas.'
                    };
                } else if (data.error.code === 400) {
                    return {
                        valid: false,
                        error: 'Invalid API key. Please check your key and try again.'
                    };
                }
                return {
                    valid: false,
                    error: `API Error: ${data.error.message}`
                };
            }
            
            return { valid: true };
            
        } catch (error) {
            return {
                valid: false,
                error: 'Network error. Please check your connection and try again.'
            };
        }
    }
} 