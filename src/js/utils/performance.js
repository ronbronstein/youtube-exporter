/**
 * Performance Monitoring Utilities
 * Tracks render times, API calls, memory usage, and user interactions
 */

export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            renderTimes: [],
            apiCalls: [],
            memoryUsage: [],
            userInteractions: []
        };
        
        // Environment detection - works in both browser and Node.js
        const isBrowser = typeof window !== 'undefined';
        this.startTime = isBrowser ? performance.now() : Date.now();
        this.isProduction = isBrowser ? !window.__DEV__ : process.env.NODE_ENV === 'production';
        this.isBrowser = isBrowser;
    }
    
    // Track component render performance
    trackRender(componentName, renderFn) {
        if (!this.shouldTrack()) return renderFn();
        
        const start = this.isBrowser ? performance.now() : Date.now();
        const result = renderFn();
        const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
        
        this.metrics.renderTimes.push({
            component: componentName,
            duration,
            timestamp: Date.now()
        });
        
        // Warn if render is slow
        if (duration > 16.67) { // 60fps threshold
            console.warn(`🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
    }
    
    // Track API call performance
    trackApiCall(endpoint, promise) {
        if (!this.shouldTrack()) return promise;
        
        const start = this.isBrowser ? performance.now() : Date.now();
        const callId = Math.random().toString(36).substr(2, 9);
        
        return promise
            .then(result => {
                const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
                this.metrics.apiCalls.push({
                    id: callId,
                    endpoint,
                    duration,
                    success: true,
                    timestamp: Date.now()
                });
                
                // Warn if API call is slow
                if (duration > 5000) {
                    console.warn(`🐌 Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
                }
                
                return result;
            })
            .catch(error => {
                const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
                this.metrics.apiCalls.push({
                    id: callId,
                    endpoint,
                    duration,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
                throw error;
            });
    }
    
    // Track memory usage (browser only)
    trackMemoryUsage() {
        if (!this.shouldTrack() || !this.isBrowser || !performance.memory) return;
        
        const memory = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now()
        };
        
        this.metrics.memoryUsage.push(memory);
        
        // Warn if memory usage is high
        const usagePercent = (memory.used / memory.limit) * 100;
        if (usagePercent > 80) {
            console.warn(`🚨 High memory usage: ${usagePercent.toFixed(1)}%`);
        }
        
        return memory;
    }
    
    // Track user interactions
    trackUserInteraction(action, metadata = {}) {
        if (!this.shouldTrack()) return;
        
        this.metrics.userInteractions.push({
            action,
            metadata,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.startTime
        });
    }
    
    // Get performance summary
    getPerformanceSummary() {
        const summary = {
            sessionDuration: Date.now() - this.startTime,
            totalRenders: this.metrics.renderTimes.length,
            averageRenderTime: this.getAverageRenderTime(),
            slowRenders: this.getSlowRenders(),
            totalApiCalls: this.metrics.apiCalls.length,
            failedApiCalls: this.getFailedApiCalls(),
            averageApiTime: this.getAverageApiTime(),
            memoryPeakUsage: this.getPeakMemoryUsage(),
            userInteractions: this.metrics.userInteractions.length
        };
        
        return summary;
    }
    
    // Helper methods
    shouldTrack() {
        // Track in development, sample in production
        return !this.isProduction || Math.random() < 0.1;
    }
    
    getAverageRenderTime() {
        if (this.metrics.renderTimes.length === 0) return 0;
        const total = this.metrics.renderTimes.reduce((sum, r) => sum + r.duration, 0);
        return total / this.metrics.renderTimes.length;
    }
    
    getSlowRenders() {
        return this.metrics.renderTimes.filter(r => r.duration > 16.67);
    }
    
    getFailedApiCalls() {
        return this.metrics.apiCalls.filter(call => !call.success);
    }
    
    getAverageApiTime() {
        if (this.metrics.apiCalls.length === 0) return 0;
        const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
        return total / this.metrics.apiCalls.length;
    }
    
    getPeakMemoryUsage() {
        if (this.metrics.memoryUsage.length === 0) return null;
        return Math.max(...this.metrics.memoryUsage.map(m => m.used));
    }
    
    // Log performance report
    logPerformanceReport() {
        const summary = this.getPerformanceSummary();
        
        console.group('📊 Performance Report');
        console.log('Session Duration:', (summary.sessionDuration / 1000).toFixed(2) + 's');
        console.log('Total Renders:', summary.totalRenders);
        console.log('Average Render Time:', summary.averageRenderTime.toFixed(2) + 'ms');
        console.log('Slow Renders:', summary.slowRenders.length);
        console.log('Total API Calls:', summary.totalApiCalls);
        console.log('Failed API Calls:', summary.failedApiCalls.length);
        console.log('Average API Time:', summary.averageApiTime.toFixed(2) + 'ms');
        console.log('Peak Memory Usage:', summary.memoryPeakUsage ? (summary.memoryPeakUsage / 1024 / 1024).toFixed(2) + 'MB' : 'N/A');
        console.log('User Interactions:', summary.userInteractions);
        console.groupEnd();
        
        return summary;
    }
    
    // Start periodic monitoring (browser only)
    startMonitoring() {
        if (!this.shouldTrack() || !this.isBrowser) return;
        
        // Track memory usage every 30 seconds
        this.memoryInterval = setInterval(() => {
            this.trackMemoryUsage();
        }, 30000);
        
        // Log performance report every 5 minutes
        this.reportInterval = setInterval(() => {
            this.logPerformanceReport();
        }, 300000);
        
        // Track page visibility changes
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                this.trackUserInteraction('visibilityChange', {
                    hidden: document.hidden
                });
            });
        }
        
        // Track beforeunload for session summary
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.logPerformanceReport();
            });
        }
    }
    
    // Stop monitoring
    stopMonitoring() {
        if (this.memoryInterval) clearInterval(this.memoryInterval);
        if (this.reportInterval) clearInterval(this.reportInterval);
    }
}

// Performance decorators
export function trackPerformance(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
        const monitor = window.performanceMonitor;
        if (!monitor) return originalMethod.apply(this, args);
        
        return monitor.trackRender(
            `${target.constructor.name}.${propertyName}`,
            () => originalMethod.apply(this, args)
        );
    };
    
    return descriptor;
}

// Memory cleanup utilities
export class MemoryManager {
    static cleanup() {
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc) {
            window.gc();
        }
        
        // Clear large cached data
        if (window.youtubeVideosCache && window.youtubeVideosCache.size > 1000) {
            window.youtubeVideosCache.clear();
            console.log('🧹 Cleared video cache for memory optimization');
        }
    }
    
    static getMemoryStatus() {
        if (!performance.memory) return null;
        
        const memory = performance.memory;
        return {
            used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
            total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
            limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
            usagePercent: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
        };
    }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
    window.performanceMonitor = globalPerformanceMonitor;
    globalPerformanceMonitor.startMonitoring();
    
    // Expose utilities for debugging
    window.getMemoryStatus = MemoryManager.getMemoryStatus;
    window.cleanupMemory = MemoryManager.cleanup;
} 