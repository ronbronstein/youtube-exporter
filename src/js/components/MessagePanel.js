/**
 * MessagePanel Component - Displays various types of user messages
 * 
 * Features:
 * - Error, success, warning, info message types
 * - Auto-dismiss functionality
 * - Dismissible messages with close button
 * - Accessibility support
 * - Safe message rendering (XSS prevention)
 */

import { BaseComponent } from './BaseComponent.js';
import { debugLog } from '../utils/debug.js';

export class MessagePanel extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.messages = new Map();
        this.nextId = 1;
    }
    
    get defaultOptions() {
        return {
            autoHide: true,
            autoHideDelay: {
                error: 10000,
                success: 5000,
                warning: 8000,
                info: 6000
            },
            allowDismiss: true,
            maxMessages: 5,
            position: 'top' // 'top', 'bottom'
        };
    }
    
    template() {
        return `
            <div class="message-panel ${this.options.position}">
                <div class="message-container" id="messageContainer"></div>
            </div>
        `;
    }
    
    onMount() {
        // Clear any existing messages
        this.clearAll();
    }
    
    // Public API
    showError(message, persistent = false) {
        return this.addMessage('error', message, persistent);
    }
    
    showSuccess(message, persistent = false) {
        return this.addMessage('success', message, persistent);
    }
    
    showWarning(message, persistent = false) {
        return this.addMessage('warning', message, persistent);
    }
    
    showInfo(message, persistent = false) {
        return this.addMessage('info', message, persistent);
    }
    
    addMessage(type, message, persistent = false) {
        const id = this.nextId++;
        
        // Enforce max messages limit
        if (this.messages.size >= this.options.maxMessages) {
            const oldestId = this.messages.keys().next().value;
            this.removeMessage(oldestId);
        }
        
        const messageData = {
            id,
            type,
            text: message,
            persistent,
            timestamp: Date.now()
        };
        
        this.messages.set(id, messageData);
        this.renderMessage(messageData);
        
        // Auto-hide if not persistent and autoHide is enabled
        if (!persistent && this.options.autoHide) {
            const delay = this.options.autoHideDelay[type] || 5000;
            setTimeout(() => {
                this.removeMessage(id);
            }, delay);
        }
        
        debugLog(`📢 ${type.toUpperCase()}: ${message}`);
        return id;
    }
    
    removeMessage(id) {
        const messageData = this.messages.get(id);
        if (!messageData) return;
        
        const messageElement = this.findElement(`[data-message-id="${id}"]`);
        if (messageElement) {
            messageElement.classList.add('message-exit');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
                this.messages.delete(id);
            }, 300); // Match CSS transition duration
        } else {
            this.messages.delete(id);
        }
    }
    
    clearAll() {
        this.messages.clear();
        const container = this.findElement('#messageContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    clearType(type) {
        const messagesToRemove = [];
        this.messages.forEach((messageData, id) => {
            if (messageData.type === type) {
                messagesToRemove.push(id);
            }
        });
        messagesToRemove.forEach(id => this.removeMessage(id));
    }
    
    // Private Methods
    renderMessage(messageData) {
        const container = this.findElement('#messageContainer');
        if (!container) return;
        
        const messageElement = this.createMessageElement(messageData);
        
        // Add to top or bottom based on position
        if (this.options.position === 'bottom') {
            container.appendChild(messageElement);
        } else {
            container.insertBefore(messageElement, container.firstChild);
        }
        
        // Trigger entrance animation
        setTimeout(() => {
            messageElement.classList.add('message-enter');
        }, 10);
    }
    
    createMessageElement(messageData) {
        const element = this.createElement('div', {
            className: `message message-${messageData.type}`,
            'data-message-id': messageData.id,
            role: 'alert',
            'aria-live': messageData.type === 'error' ? 'assertive' : 'polite'
        });
        
        // Icon based on message type
        const icon = this.createElement('span', {
            className: 'message-icon',
            textContent: this.getMessageIcon(messageData.type)
        });
        element.appendChild(icon);
        
        // Message content
        const content = this.createElement('div', { className: 'message-content' });
        
        // Strong prefix for message type
        const prefix = this.createElement('strong', {
            textContent: `${messageData.type.charAt(0).toUpperCase() + messageData.type.slice(1)}:`
        });
        content.appendChild(prefix);
        
        // Message text (safe text content, no HTML)
        const textNode = document.createTextNode(` ${messageData.text}`);
        content.appendChild(textNode);
        
        element.appendChild(content);
        
        // Close button if dismissible
        if (this.options.allowDismiss) {
            const closeBtn = this.createElement('button', {
                className: 'message-close',
                textContent: '×',
                title: 'Dismiss message',
                'aria-label': 'Close message'
            });
            
            this.addListener(closeBtn, 'click', () => {
                this.removeMessage(messageData.id);
            });
            
            element.appendChild(closeBtn);
        }
        
        return element;
    }
    
    getMessageIcon(type) {
        const icons = {
            error: '❌',
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// Global message system for app-wide notifications
let globalMessageInstance = null;

export const GlobalMessages = {
    init(container, options = {}) {
        if (globalMessageInstance) {
            globalMessageInstance.destroy();
        }
        globalMessageInstance = new MessagePanel(container, {
            position: 'top',
            maxMessages: 3,
            ...options
        }).init();
        return globalMessageInstance;
    },
    
    error(message, persistent = false) {
        if (globalMessageInstance) {
            return globalMessageInstance.showError(message, persistent);
        }
        console.error('Error:', message);
        return null;
    },
    
    success(message, persistent = false) {
        if (globalMessageInstance) {
            return globalMessageInstance.showSuccess(message, persistent);
        }
        console.log('Success:', message);
        return null;
    },
    
    warning(message, persistent = false) {
        if (globalMessageInstance) {
            return globalMessageInstance.showWarning(message, persistent);
        }
        console.warn('Warning:', message);
        return null;
    },
    
    info(message, persistent = false) {
        if (globalMessageInstance) {
            return globalMessageInstance.showInfo(message, persistent);
        }
        console.info('Info:', message);
        return null;
    },
    
    clear() {
        if (globalMessageInstance) {
            globalMessageInstance.clearAll();
        }
    },
    
    clearType(type) {
        if (globalMessageInstance) {
            globalMessageInstance.clearType(type);
        }
    }
}; 