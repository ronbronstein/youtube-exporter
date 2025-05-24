/**
 * Debug and logging utilities
 */

/**
 * Centralized debug logging function
 * @param {string} message - Debug message
 * @param {*} data - Optional data to log
 */
export function debugLog(message, data = null) {
    console.log(`🔍 DEBUG: ${message}`, data);
} 