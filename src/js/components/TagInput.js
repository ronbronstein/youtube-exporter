/**
 * TagInput Component - Professional Tag-Based Keyword Input
 * 
 * Features:
 * - Windows XP styled tag container
 * - Enter key adds tags, Backspace removes last tag
 * - Visual tags with X buttons for removal
 * - Focus states and hover effects
 * - Mobile-friendly touch targets
 * - Integration with existing search logic
 */

import { BaseComponent } from './BaseComponent.js';
import { debugLog } from '../utils/debug.js';

export class TagInput extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        
        // Component state
        this.tags = [];
        this.inputValue = '';
        this.isFocused = false;
        
        // DOM references
        this.tagContainer = null;
        this.tagInput = null;
    }
    
    get defaultOptions() {
        return {
            placeholder: 'Type keyword and press Enter to add...',
            maxTags: 10,
            minTagLength: 2,
            maxTagLength: 30,
            allowDuplicates: false,
            disabled: false
        };
    }
    
    onCreate() {
        debugLog('🏷️ Initializing TagInput component');
    }
    
    template() {
        const { placeholder, disabled } = this.options;
        const disabledClass = disabled ? 'disabled' : '';
        const disabledAttr = disabled ? 'disabled' : '';
        
        return `
            <div class="tag-input-container ${disabledClass}" id="tagContainer">
                ${this.renderTags()}
                <input 
                    type="text" 
                    class="tag-input" 
                    id="tagInput"
                    placeholder="${placeholder}"
                    ${disabledAttr}
                >
            </div>
        `;
    }
    
    onMount() {
        // Get DOM references
        this.tagContainer = this.findElement('#tagContainer');
        this.tagInput = this.findElement('#tagInput');
        
        if (!this.tagContainer || !this.tagInput) {
            debugLog('❌ TagInput: Required elements not found');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        debugLog('✅ TagInput component mounted');
    }
    
    setupEventListeners() {
        // Input events
        this.addListener(this.tagInput, 'keydown', this.handleKeyDown.bind(this));
        this.addListener(this.tagInput, 'input', this.handleInput.bind(this));
        this.addListener(this.tagInput, 'focus', this.handleFocus.bind(this));
        this.addListener(this.tagInput, 'blur', this.handleBlur.bind(this));
        
        // Container click to focus input
        this.addListener(this.tagContainer, 'click', this.handleContainerClick.bind(this));
        
        debugLog('🔌 TagInput event listeners attached');
    }
    
    handleKeyDown(event) {
        const { key } = event;
        const value = this.tagInput.value.trim();
        
        switch (key) {
            case 'Enter':
                event.preventDefault();
                if (value) {
                    this.addTag(value);
                }
                break;
                
            case 'Backspace':
                if (!value && this.tags.length > 0) {
                    event.preventDefault();
                    this.removeTag(this.tags.length - 1);
                }
                break;
                
            case 'Escape':
                this.tagInput.blur();
                break;
        }
    }
    
    handleInput(event) {
        this.inputValue = event.target.value;
        this.updatePlaceholder();
    }
    
    handleFocus(event) {
        this.isFocused = true;
        this.tagContainer.classList.add('focused');
    }
    
    handleBlur(event) {
        this.isFocused = false;
        this.tagContainer.classList.remove('focused');
        
        // Add tag if there's text when losing focus
        const value = this.tagInput.value.trim();
        if (value) {
            this.addTag(value);
        }
    }
    
    handleContainerClick(event) {
        // Focus input when clicking on container (but not on tags)
        if (event.target === this.tagContainer || event.target.classList.contains('tag-input')) {
            this.tagInput.focus();
        }
    }
    
    handleTagRemove(index) {
        this.removeTag(index);
        this.tagInput.focus(); // Keep focus for better UX
    }
    
    addTag(text) {
        const { maxTags, minTagLength, maxTagLength, allowDuplicates } = this.options;
        
        // Validate tag
        if (!text || text.length < minTagLength) {
            debugLog(`⚠️ Tag too short: ${text} (min: ${minTagLength})`);
            return false;
        }
        
        if (text.length > maxTagLength) {
            debugLog(`⚠️ Tag too long: ${text} (max: ${maxTagLength})`);
            return false;
        }
        
        if (this.tags.length >= maxTags) {
            debugLog(`⚠️ Maximum tags reached: ${maxTags}`);
            return false;
        }
        
        if (!allowDuplicates && this.tags.includes(text)) {
            debugLog(`⚠️ Duplicate tag: ${text}`);
            return false;
        }
        
        // Add tag
        this.tags.push(text);
        this.tagInput.value = '';
        this.inputValue = '';
        
        // Re-render tags
        this.renderTagsInPlace();
        this.updatePlaceholder();
        
        // Emit change event
        this.emit('tagsChanged', { tags: this.tags, added: text });
        
        debugLog(`🏷️ Tag added: ${text} (total: ${this.tags.length})`);
        return true;
    }
    
    removeTag(index) {
        if (index < 0 || index >= this.tags.length) {
            return false;
        }
        
        const removedTag = this.tags[index];
        this.tags.splice(index, 1);
        
        // Re-render tags
        this.renderTagsInPlace();
        this.updatePlaceholder();
        
        // Emit change event
        this.emit('tagsChanged', { tags: this.tags, removed: removedTag });
        
        debugLog(`🗑️ Tag removed: ${removedTag} (remaining: ${this.tags.length})`);
        return true;
    }
    
    renderTags() {
        return this.tags.map((tag, index) => `
            <div class="tag" data-index="${index}">
                <span class="tag-text">${this.escapeHtml(tag)}</span>
                <button class="tag-remove" type="button" data-index="${index}" title="Remove tag">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    renderTagsInPlace() {
        // Update only the tags, keeping the input in place
        const tagsHtml = this.renderTags();
        const existingTags = this.tagContainer.querySelectorAll('.tag');
        
        // Remove existing tags
        existingTags.forEach(tag => tag.remove());
        
        // Add new tags before the input
        if (tagsHtml) {
            this.tagInput.insertAdjacentHTML('beforebegin', tagsHtml);
            
            // Attach event listeners to new remove buttons
            const removeButtons = this.tagContainer.querySelectorAll('.tag-remove');
            removeButtons.forEach(btn => {
                const index = parseInt(btn.getAttribute('data-index'));
                this.addListener(btn, 'click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleTagRemove(index);
                });
            });
        }
    }
    
    updatePlaceholder() {
        const { placeholder } = this.options;
        
        if (this.tags.length === 0) {
            this.tagInput.placeholder = placeholder;
        } else {
            this.tagInput.placeholder = 'Add another keyword...';
        }
    }
    
    // Public API
    getTags() {
        return [...this.tags]; // Return copy
    }
    
    setTags(tags) {
        this.tags = Array.isArray(tags) ? [...tags] : [];
        this.renderTagsInPlace();
        this.updatePlaceholder();
        this.emit('tagsChanged', { tags: this.tags });
        debugLog(`🏷️ Tags set: ${this.tags.length} tags`);
    }
    
    clearTags() {
        this.tags = [];
        this.tagInput.value = '';
        this.inputValue = '';
        this.renderTagsInPlace();
        this.updatePlaceholder();
        this.emit('tagsChanged', { tags: this.tags });
        debugLog('🗑️ All tags cleared');
    }
    
    addTagProgrammatically(tag) {
        return this.addTag(tag);
    }
    
    setDisabled(disabled) {
        this.options.disabled = disabled;
        
        if (disabled) {
            this.tagContainer.classList.add('disabled');
            this.tagInput.setAttribute('disabled', 'true');
        } else {
            this.tagContainer.classList.remove('disabled');
            this.tagInput.removeAttribute('disabled');
        }
    }
    
    focus() {
        this.tagInput.focus();
    }
    
    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    onDestroy() {
        debugLog('🏷️ TagInput component destroyed');
        super.onDestroy();
    }
} 