/**
 * Security utility functions
 */

/**
 * Sanitize URLs to prevent XSS via javascript: URLs
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or # if unsafe
 */
export function sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
        return '#';
    }
    
    // Allow only safe URL schemes
    const allowedSchemes = ['http:', 'https:', 'mailto:'];
    try {
        const parsedUrl = new URL(url);
        if (allowedSchemes.includes(parsedUrl.protocol)) {
            return url;
        }
    } catch (e) {
        // Invalid URL format
    }
    
    // If URL doesn't start with safe scheme, treat as relative or invalid
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Block dangerous schemes like javascript:, data:, etc.
    return '#';
}

/**
 * Validate YouTube API key format
 * @param {string} apiKey - API key to validate
 * @returns {object} Validation result with valid boolean and error message
 */
export function validateApiKey(apiKey) {
    if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
        return {
            valid: false,
            error: 'Invalid API key format. YouTube API keys start with "AIza" and are 39+ characters.'
        };
    }
    return { valid: true };
} 