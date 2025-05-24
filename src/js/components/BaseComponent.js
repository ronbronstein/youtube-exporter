/**
 * BaseComponent - Foundation class for all UI components
 * 
 * Features:
 * - Common lifecycle methods
 * - Event handling and cleanup
 * - Safe DOM manipulation
 * - State management integration
 */

import { debugLog } from '../utils/debug.js';

export class BaseComponent {
    constructor(container, options = {}) {
        this.container = container;
        this.options = { ...this.defaultOptions, ...options };
        this.eventListeners = new Map();
        this.childComponents = new Set();
        this.isDestroyed = false;
        
        debugLog(`🏗️ Creating component: ${this.constructor.name}`);
    }
    
    get defaultOptions() {
        return {};
    }
    
    // Lifecycle Methods
    init() {
        if (this.isDestroyed) {
            throw new Error('Cannot initialize destroyed component');
        }
        this.onCreate();
        this.render();
        this.onMount();
        return this;
    }
    
    onCreate() {
        // Override in subclasses for setup logic
    }
    
    onMount() {
        // Override in subclasses for post-render logic
    }
    
    onUpdate(changes) {
        // Override in subclasses for update logic
    }
    
    onDestroy() {
        // Override in subclasses for cleanup logic
    }
    
    // Rendering
    render() {
        if (this.isDestroyed) return;
        
        const content = this.template();
        if (content) {
            this.container.innerHTML = '';
            if (typeof content === 'string') {
                this.container.innerHTML = content;
            } else {
                this.container.appendChild(content);
            }
        }
        this.onUpdate({});
    }
    
    template() {
        // Override in subclasses to return DOM content
        return '';
    }
    
    // Event Management
    addListener(element, event, handler, options = {}) {
        if (this.isDestroyed) return;
        
        const key = `${element.id || 'element'}_${event}_${Date.now()}`;
        const boundHandler = handler.bind(this);
        
        element.addEventListener(event, boundHandler, options);
        this.eventListeners.set(key, {
            element,
            event,
            handler: boundHandler,
            options
        });
        
        return key;
    }
    
    removeListener(key) {
        const listener = this.eventListeners.get(key);
        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            this.eventListeners.delete(key);
        }
    }
    
    // Child Component Management
    addChild(component) {
        if (this.isDestroyed) return;
        this.childComponents.add(component);
        return component;
    }
    
    removeChild(component) {
        this.childComponents.delete(component);
        component.destroy();
    }
    
    // Safe DOM Helpers
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        // Set attributes safely
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className' || key === 'class') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }
    
    findElement(selector) {
        return this.container.querySelector(selector);
    }
    
    findElements(selector) {
        return this.container.querySelectorAll(selector);
    }
    
    // State Updates
    update(changes = {}) {
        if (this.isDestroyed) return;
        this.onUpdate(changes);
    }
    
    // Cleanup
    destroy() {
        if (this.isDestroyed) return;
        
        debugLog(`🗑️ Destroying component: ${this.constructor.name}`);
        
        // Cleanup child components
        this.childComponents.forEach(child => child.destroy());
        this.childComponents.clear();
        
        // Remove event listeners
        this.eventListeners.forEach((listener, key) => {
            this.removeListener(key);
        });
        
        // Call custom cleanup
        this.onDestroy();
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isDestroyed = true;
    }
    
    // Utility Methods
    show() {
        if (this.container) {
            this.container.style.display = '';
        }
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
    
    toggleVisibility(visible = null) {
        if (visible === null) {
            visible = this.container.style.display === 'none';
        }
        
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    addClass(className) {
        if (this.container) {
            this.container.classList.add(className);
        }
    }
    
    removeClass(className) {
        if (this.container) {
            this.container.classList.remove(className);
        }
    }
    
    toggleClass(className, force = null) {
        if (this.container) {
            this.container.classList.toggle(className, force);
        }
    }
} 