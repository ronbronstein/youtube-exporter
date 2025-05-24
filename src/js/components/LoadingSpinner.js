/**
 * LoadingSpinner Component - Shows loading states with customizable messages
 * 
 * Features:
 * - Animated spinner
 * - Customizable loading messages
 * - Progress indication
 * - Modal overlay support
 */

import { BaseComponent } from './BaseComponent.js';
import { debugLog } from '../utils/debug.js';

export class LoadingSpinner extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.isVisible = false;
        this.currentMessage = '';
        this.progress = null;
    }
    
    get defaultOptions() {
        return {
            message: 'Loading...',
            showProgress: false,
            overlay: true,
            spinnerType: 'dots', // 'dots', 'spinner', 'bars'
            className: 'loading-spinner'
        };
    }
    
    template() {
        return `
            <div class="loading-component ${this.options.overlay ? 'loading-overlay' : ''}" style="display: none;">
                <div class="loading-content">
                    <div class="loading-animation ${this.options.spinnerType}">
                        ${this.renderSpinner()}
                    </div>
                    <div class="loading-text" id="loadingText">${this.options.message}</div>
                    ${this.options.showProgress ? '<div class="loading-progress" id="loadingProgress"></div>' : ''}
                </div>
            </div>
        `;
    }
    
    renderSpinner() {
        switch (this.options.spinnerType) {
            case 'dots':
                return `
                    <div class="dots-spinner">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                `;
            case 'bars':
                return `
                    <div class="bars-spinner">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                `;
            case 'spinner':
            default:
                return '<div class="circle-spinner"></div>';
        }
    }
    
    // Public API
    show(message = null) {
        if (message) {
            this.setMessage(message);
        }
        
        this.container.style.display = 'block';
        this.isVisible = true;
        
        debugLog(`🔄 Loading: ${this.currentMessage}`);
    }
    
    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
        this.progress = null;
        
        debugLog('✅ Loading hidden');
    }
    
    setMessage(message) {
        this.currentMessage = message;
        const textElement = this.findElement('#loadingText');
        if (textElement) {
            textElement.textContent = message;
        }
    }
    
    setProgress(percent, message = null) {
        if (!this.options.showProgress) return;
        
        this.progress = Math.max(0, Math.min(100, percent));
        
        if (message) {
            this.setMessage(message);
        }
        
        const progressElement = this.findElement('#loadingProgress');
        if (progressElement) {
            progressElement.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(this.progress)}%</div>
            `;
        }
    }
    
    // Async helper methods
    async showForPromise(promise, message = 'Loading...') {
        this.show(message);
        try {
            const result = await promise;
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }
    
    // Progress tracking for multiple operations
    startProgressTracking(total, baseMessage = 'Processing') {
        this.setProgress(0, `${baseMessage}... (0/${total})`);
        
        return {
            update: (completed) => {
                const percent = (completed / total) * 100;
                this.setProgress(percent, `${baseMessage}... (${completed}/${total})`);
            },
            finish: () => {
                this.setProgress(100, 'Complete!');
                setTimeout(() => this.hide(), 500);
            }
        };
    }
    
    onDestroy() {
        this.hide();
    }
}

// Singleton instance for global loading states
let globalLoadingInstance = null;

export const GlobalLoading = {
    init(container, options = {}) {
        if (globalLoadingInstance) {
            globalLoadingInstance.destroy();
        }
        globalLoadingInstance = new LoadingSpinner(container, {
            overlay: true,
            showProgress: true,
            ...options
        }).init();
        return globalLoadingInstance;
    },
    
    show(message) {
        if (globalLoadingInstance) {
            globalLoadingInstance.show(message);
        }
    },
    
    hide() {
        if (globalLoadingInstance) {
            globalLoadingInstance.hide();
        }
    },
    
    setMessage(message) {
        if (globalLoadingInstance) {
            globalLoadingInstance.setMessage(message);
        }
    },
    
    setProgress(percent, message) {
        if (globalLoadingInstance) {
            globalLoadingInstance.setProgress(percent, message);
        }
    },
    
    async forPromise(promise, message) {
        if (globalLoadingInstance) {
            return globalLoadingInstance.showForPromise(promise, message);
        }
        return promise;
    },
    
    startProgressTracking(total, baseMessage) {
        if (globalLoadingInstance) {
            return globalLoadingInstance.startProgressTracking(total, baseMessage);
        }
        return {
            update: () => {},
            finish: () => {}
        };
    }
}; 