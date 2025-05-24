/**
 * Utility functions for formatting data display
 */

/**
 * Format large numbers into human-readable format (1.2M, 1.5K, etc.)
 * @param {number} count - The number to format
 * @returns {string} Formatted number string
 */
export function formatViewCount(count) {
    if (count >= 1000000000) {
        return (count / 1000000000).toFixed(1) + 'B';
    } else if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    } else {
        return count.toLocaleString();
    }
}

/**
 * Format YouTube duration format (PT1H2M3S) to readable format (1:23:45)
 * @param {string} duration - YouTube API duration string
 * @returns {string} Human-readable duration
 */
export function formatDuration(duration) {
    // Handle null/undefined duration
    if (!duration) {
        return '0:00';
    }
    
    // Handle edge cases like "P0D" (0 days) and "PT0S" (0 seconds)
    if (duration === 'P0D' || duration === 'PT0S') {
        return '0:00';
    }
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    // Handle null regex match
    if (!match) {
        console.warn('Unusual duration format (non-critical):', duration);
        return '0:00';
    }
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
} 