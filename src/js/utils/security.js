/**
 * Security utility functions
 */

/**
 * Sanitize URLs to prevent XSS via javascript: URLs
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or empty string if unsafe
 */
export function sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
        return '';
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
    return '';
}

/**
 * Validate YouTube API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format appears valid, otherwise false
 */
export function validateApiKey(apiKey) {
    // YouTube API keys are exactly 39 characters long. The previous
    // implementation returned an object, but callers expect a simple
    // boolean result. Adjusted to return true/false while keeping the
    // stricter length check.
    if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 39) {
        return false;
    }
    return true;
}
