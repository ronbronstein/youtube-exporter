/**
 * Results Component - Results display with export functionality
 * 
 * Features:
 * - Results count display
 * - View toggle (list/grid)  
 * - Export options (CSV, Markdown, Titles)
 * - Enhanced tag-based search filter with logic options
 * - Integration with VideoList component
 */

import { BaseComponent } from './BaseComponent.js';
import { TagInput } from './TagInput.js';
import { formatViewCount } from '../utils/formatter.js';
import { debugLog } from '../utils/debug.js';

export class Results extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.videos = [];
        this.filteredVideos = [];
        this.currentView = 'list';
        this.channelName = '';
        
        // Enhanced filtering properties
        this.tagInputComponent = null;
        this.filterTags = [];
        this.filterLogic = 'OR'; // Default to OR logic
        this.searchScope = 'both'; // Default to search both title and description
    }
    
    get defaultOptions() {
        return {
            enableExport: true,
            enableViewToggle: true,
            enableFilter: true,
            defaultView: 'list'
        };
    }
    
    onCreate() {
        this.currentView = this.options.defaultView;
        this.hide(); // Start hidden until videos are loaded
    }
    
    template() {
        return `
            <div class="results-component">
                <div class="results-header">
                    <div class="results-count" id="resultsCount">
                        0 videos found
                    </div>
                    <div class="results-controls">
                        ${this.renderViewToggle()}
                        ${this.renderSearchFilter()}
                    </div>
                </div>
                
                <div class="video-display-container" id="videoDisplayContainer">
                    <!-- VideoList component will be mounted here -->
                </div>
                
                ${this.renderExportSection()}
            </div>
        `;
    }
    
    renderViewToggle() {
        if (!this.options.enableViewToggle) return '';
        
        return `
            <div class="view-toggle">
                <button 
                    id="listViewBtn" 
                    class="toggle-btn ${this.currentView === 'list' ? 'active' : ''}"
                    data-view="list">
                    📋 List
                </button>
                <button 
                    id="gridViewBtn" 
                    class="toggle-btn ${this.currentView === 'grid' ? 'active' : ''}"
                    data-view="grid">
                    📷 Grid
                </button>
            </div>
        `;
    }
    
    renderSearchFilter() {
        if (!this.options.enableFilter) return '';
        
        return `
            <div class="search-filter">
                <div class="filter-header">
                    <label class="filter-label">🔍 Enhanced Keyword Filter</label>
                    <div class="filter-status" id="filterStatus">
                        <span class="filter-count" id="filterCount">No active filters</span>
                        <button class="clear-filters-btn" id="clearFiltersBtn" style="display: none;">
                            ✕ Clear All
                        </button>
                    </div>
                </div>
                <div id="tagInputContainer" class="tag-input-wrapper">
                    <!-- TagInput component will be mounted here -->
                </div>
                <div class="filter-options">
                    <div class="radio-group compact">
                        <div class="radio-group-title">Match Logic:</div>
                        <div class="radio-option">
                            <input type="radio" id="logicOR" name="filterLogic" value="OR" checked>
                            <label for="logicOR">Any keyword (OR)</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="logicAND" name="filterLogic" value="AND">
                            <label for="logicAND">All keywords (AND)</label>
                        </div>
                    </div>
                    <div class="radio-group compact">
                        <div class="radio-group-title">Search In:</div>
                        <div class="radio-option">
                            <input type="radio" id="scopeBoth" name="searchScope" value="both" checked>
                            <label for="scopeBoth">Title & Description</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="scopeTitle" name="searchScope" value="title">
                            <label for="scopeTitle">Title only</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderExportSection() {
        if (!this.options.enableExport) return '';
        
        return `
            <div class="export-section">
                <div class="export-header">
                    <h4>📥 Export Data</h4>
                </div>
                <div class="export-buttons">
                    <button id="exportCsvBtn" class="export-btn" disabled>
                        📊 Download CSV
                    </button>
                    <button id="exportMarkdownBtn" class="export-btn" disabled>
                        📝 LLM Export (Markdown)
                    </button>
                    <button id="exportTitlesBtn" class="export-btn" disabled>
                        📋 Export Titles
                    </button>
                </div>
            </div>
        `;
    }
    
    onMount() {
        // View toggle listeners
        if (this.options.enableViewToggle) {
            const listBtn = this.findElement('#listViewBtn');
            const gridBtn = this.findElement('#gridViewBtn');
            
            if (listBtn) {
                this.addListener(listBtn, 'click', () => this.switchView('list'));
            }
            if (gridBtn) {
                this.addListener(gridBtn, 'click', () => this.switchView('grid'));
            }
        }
        
        // Enhanced search filter with TagInput
        if (this.options.enableFilter) {
            this.initializeTagInput();
        }
        
        // Export button listeners
        if (this.options.enableExport) {
            const csvBtn = this.findElement('#exportCsvBtn');
            const markdownBtn = this.findElement('#exportMarkdownBtn');
            const titlesBtn = this.findElement('#exportTitlesBtn');
            
            if (csvBtn) {
                this.addListener(csvBtn, 'click', () => this.exportToCSV());
            }
            if (markdownBtn) {
                this.addListener(markdownBtn, 'click', () => this.exportToMarkdown());
            }
            if (titlesBtn) {
                this.addListener(titlesBtn, 'click', () => this.exportTitles());
            }
        }
    }
    
    initializeTagInput() {
        const tagContainer = this.findElement('#tagInputContainer');
        if (!tagContainer) {
            debugLog('❌ Results: TagInput container not found');
            return;
        }
        
        // Initialize TagInput component
        this.tagInputComponent = new TagInput(tagContainer, {
            placeholder: 'Add keywords and press Enter...',
            maxTags: 8,
            minTagLength: 2,
            maxTagLength: 25,
            allowDuplicates: false
        });
        
        // Handle tag changes
        this.tagInputComponent.on('tagsChanged', (data) => {
            this.filterTags = data.tags;
            this.applyTagFilter();
            this.updateFilterStatus();
            debugLog(`🏷️ Filter tags updated: ${this.filterTags.join(', ')}`);
        });
        
        // Handle logic toggle
        const orRadio = this.findElement('#logicOR');
        const andRadio = this.findElement('#logicAND');
        
        if (orRadio && andRadio) {
            this.addListener(orRadio, 'change', (e) => {
                if (e.target.checked) {
                    this.filterLogic = 'OR';
                    this.applyTagFilter();
                    this.updateFilterStatus();
                    debugLog('🔀 Filter logic set to OR');
                }
            });
            
            this.addListener(andRadio, 'change', (e) => {
                if (e.target.checked) {
                    this.filterLogic = 'AND';
                    this.applyTagFilter();
                    this.updateFilterStatus();
                    debugLog('🔀 Filter logic set to AND');
                }
            });
        }
        
        // Handle search scope toggle
        const bothRadio = this.findElement('#scopeBoth');
        const titleRadio = this.findElement('#scopeTitle');
        
        if (bothRadio && titleRadio) {
            this.addListener(bothRadio, 'change', (e) => {
                if (e.target.checked) {
                    this.searchScope = 'both';
                    this.applyTagFilter();
                    this.updateFilterStatus();
                    debugLog('🔀 Search scope set to both');
                }
            });
            
            this.addListener(titleRadio, 'change', (e) => {
                if (e.target.checked) {
                    this.searchScope = 'title';
                    this.applyTagFilter();
                    this.updateFilterStatus();
                    debugLog('🔀 Search scope set to title');
                }
            });
        }
        
        // Handle clear filters button
        const clearBtn = this.findElement('#clearFiltersBtn');
        if (clearBtn) {
            this.addListener(clearBtn, 'click', () => {
                this.clearAllFilters();
                debugLog('🧹 All filters cleared via button');
            });
        }
        
        // Initialize filter status
        this.updateFilterStatus();
        
        debugLog('✅ TagInput component and enhanced controls initialized in Results');
    }
    
    // Public API
    setVideos(videos, channelName = '') {
        this.videos = videos || [];
        this.filteredVideos = [...this.videos];
        this.channelName = channelName;
        
        this.updateResultsCount();
        this.updateExportButtons();
        
        if (this.videos.length > 0) {
            this.show();
        } else {
            this.hide();
        }
        
        // Emit event for parent components (like VideoList)
        this.emit('videosChanged', {
            videos: this.filteredVideos,
            view: this.currentView
        });
        
        debugLog(`📊 Results updated: ${this.videos.length} total, ${this.filteredVideos.length} filtered`);
    }
    
    setSearchFilter(query = '') {
        // Convert query to tags for TagInput component
        if (this.tagInputComponent && query.trim()) {
            const tags = query.trim().split(/\s+/).filter(tag => tag.length >= 2);
            this.tagInputComponent.setTags(tags);
            debugLog(`🔍 Search filter set to tags: ${tags.join(', ')}`);
        } else if (this.tagInputComponent) {
            this.tagInputComponent.clearTags();
            debugLog('🔍 Search filter cleared');
        }
    }
    
    applyTagFilter() {
        if (!this.videos || this.videos.length === 0) {
            this.filteredVideos = [];
            this.updateResultsCount();
            this.emit('videosChanged', {
                videos: [],
                view: this.currentView
            });
            return;
        }

        if (!this.filterTags || this.filterTags.length === 0) {
            // If no filter tags, show all fetched videos
            this.filteredVideos = [...this.videos];
        } else {
            // Filter the fetched videos based on the tag keywords, logic, and scope
            this.filteredVideos = this.videos.filter(video => {
                const title = video.title?.toLowerCase() || '';
                const description = video.description?.toLowerCase() || '';
                
                if (this.filterLogic === 'AND') {
                    // ALL tags must match (AND logic)
                    return this.filterTags.every(tag => {
                        const keyword = tag.toLowerCase();
                        if (this.searchScope === 'title') {
                            // Search only in title
                            return title.includes(keyword);
                        } else {
                            // Search in both title and description
                            return title.includes(keyword) || description.includes(keyword);
                        }
                    });
                } else {
                    // ANY tag can match (OR logic - default)
                    return this.filterTags.some(tag => {
                        const keyword = tag.toLowerCase();
                        if (this.searchScope === 'title') {
                            // Search only in title
                            return title.includes(keyword);
                        } else {
                            // Search in both title and description
                            return title.includes(keyword) || description.includes(keyword);
                        }
                    });
                }
            });
        }

        console.log(`🔍 Tag filter applied: [${this.filterTags.join(', ')}] with ${this.filterLogic} logic in ${this.searchScope} → ${this.filteredVideos.length} results`);
        
        // Update count display and emit event
        this.updateResultsCount();
        this.emit('videosChanged', {
            videos: this.filteredVideos,
            view: this.currentView
        });
    }
    
    switchView(view) {
        if (this.currentView === view) return;
        
        this.currentView = view;
        this.updateViewButtons();
        
        // Emit view change event
        this.emit('viewChanged', {
            view: this.currentView,
            videos: this.filteredVideos
        });
        
        debugLog(`📺 View switched to ${view}`);
    }
    
    show() {
        this.container.style.display = 'block';
        this.container.style.visibility = 'visible';
        debugLog('📊 Results component shown');
    }
    
    hide() {
        this.container.style.display = 'none';
        debugLog('📊 Results component hidden');
    }
    
    clearResults() {
        this.videos = [];
        this.filteredVideos = [];
        this.filterTags = [];
        this.filterLogic = 'OR'; // Reset to default
        this.searchScope = 'both'; // Reset to default
        this.channelName = '';
        
        // Clear tag input
        if (this.tagInputComponent) {
            this.tagInputComponent.clearTags();
        }
        
        // Reset logic toggle to OR
        const orRadio = this.findElement('#logicOR');
        if (orRadio) {
            orRadio.checked = true;
        }
        
        // Reset search scope to both
        const bothRadio = this.findElement('#scopeBoth');
        if (bothRadio) {
            bothRadio.checked = true;
        }
        
        // Update UI
        this.updateResultsCount();
        this.updateExportButtons();
        this.updateFilterStatus();
        
        // Hide the component
        this.hide();
        
        // Emit clear event
        this.emit('videosChanged', {
            videos: [],
            view: this.currentView
        });
        
        debugLog('📊 Results cleared');
    }
    
    // Export Functions
    exportToCSV() {
        if (!this.filteredVideos || this.filteredVideos.length === 0) {
            this.showError('No videos to export');
            return;
        }
        
        const headers = ['Title', 'URL', 'Published Date', 'Views', 'Likes', 'Comments', 'Duration', 'Description'];
        const csvData = [
            headers,
            ...this.filteredVideos.map(video => [
                `"${(video.title || '').replace(/"/g, '""')}"`,
                video.url || '',
                video.publishedAt || '',
                video.viewCount || 0,
                video.likeCount || 0,
                video.commentCount || 0,
                video.duration || '',
                `"${(video.fullDescription || video.description || '').replace(/"/g, '""')}"`
            ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        this.downloadFile(csvContent, `youtube-analysis-${this.channelName || 'channel'}-${Date.now()}.csv`, 'text/csv');
        
        debugLog(`📊 CSV exported: ${this.filteredVideos.length} videos`);
    }
    
    exportToMarkdown() {
        if (!this.filteredVideos || this.filteredVideos.length === 0) {
            this.showError('No videos to export');
            return;
        }
        
        const channelName = this.channelName || 'Unknown Channel';
        const totalViews = this.filteredVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0);
        const avgViews = Math.round(totalViews / this.filteredVideos.length);
        
        let markdown = `# YouTube Channel Analysis: ${channelName}\n\n`;
        markdown += `## 📊 Summary Statistics\n`;
        markdown += `- **Total Videos**: ${this.filteredVideos.length.toLocaleString()}\n`;
        markdown += `- **Total Views**: ${formatViewCount(totalViews)}\n`;
        markdown += `- **Average Views**: ${formatViewCount(avgViews)}\n`;
        markdown += `- **Analysis Date**: ${new Date().toLocaleDateString()}\n\n`;
        
        markdown += `## 🎥 Video List\n\n`;
        this.filteredVideos.forEach((video, index) => {
            markdown += `### ${index + 1}. ${video.title || 'Untitled'}\n`;
            markdown += `- **URL**: ${video.url || 'N/A'}\n`;
            markdown += `- **Published**: ${video.publishedAt || 'Unknown'}\n`;
            markdown += `- **Views**: ${formatViewCount(video.viewCount || 0)}\n`;
            markdown += `- **Engagement**: ${formatViewCount(video.likeCount || 0)} likes, ${formatViewCount(video.commentCount || 0)} comments\n`;
            markdown += `- **Duration**: ${video.duration || 'Unknown'}\n`;
            if (video.description) {
                markdown += `- **Description**: ${video.description}\n`;
            }
            markdown += `\n`;
        });
        
        this.downloadFile(markdown, `youtube-analysis-${channelName}-${Date.now()}.md`, 'text/markdown');
        
        debugLog(`📝 Markdown exported: ${this.filteredVideos.length} videos`);
    }
    
    exportTitles() {
        if (!this.filteredVideos || this.filteredVideos.length === 0) {
            this.showError('No videos to export');
            return;
        }
        
        const titlesText = this.filteredVideos
            .map(video => video.title || 'Untitled')
            .join('\n');
        
        this.downloadFile(titlesText, `youtube-titles-${this.channelName || 'channel'}-${Date.now()}.txt`, 'text/plain');
        
        debugLog(`📋 Titles exported: ${this.filteredVideos.length} titles`);
    }
    
    // Helper Methods
    updateResultsCount() {
        const countElement = this.container.querySelector('.results-count');
        if (!countElement) return;

        const totalVideos = this.videos ? this.videos.length : 0;
        const filteredCount = this.filteredVideos ? this.filteredVideos.length : 0;
        
        if (totalVideos === 0) {
            countElement.textContent = 'No videos found';
            return;
        }

        // Check if filtering is active (either by Results search filter OR initial keyword filter)
        const isFiltered = filteredCount !== totalVideos;
        
        if (isFiltered) {
            countElement.textContent = `${filteredCount} videos match filters of the ${totalVideos} videos total`;
            countElement.style.color = 'var(--xp-selection-bg)';
            countElement.style.fontWeight = 'bold';
        } else {
            countElement.textContent = `${totalVideos} videos (showing all fetched videos)`;
            countElement.style.color = 'var(--xp-text)';
            countElement.style.fontWeight = 'normal';
        }
        
        console.log('🔍 DEBUG: 📊 Results updated:', {
            total: totalVideos,
            filtered: filteredCount,
            isFiltered
        });
    }
    
    updateViewButtons() {
        const listBtn = this.findElement('#listViewBtn');
        const gridBtn = this.findElement('#gridViewBtn');
        
        if (listBtn) {
            listBtn.classList.toggle('active', this.currentView === 'list');
        }
        if (gridBtn) {
            gridBtn.classList.toggle('active', this.currentView === 'grid');
        }
    }
    
    updateExportButtons() {
        const hasVideos = this.filteredVideos.length > 0;
        
        const csvBtn = this.findElement('#exportCsvBtn');
        const markdownBtn = this.findElement('#exportMarkdownBtn');
        const titlesBtn = this.findElement('#exportTitlesBtn');
        
        if (csvBtn) csvBtn.disabled = !hasVideos;
        if (markdownBtn) markdownBtn.disabled = !hasVideos;
        if (titlesBtn) titlesBtn.disabled = !hasVideos;
    }
    
    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            this.showError('Download failed: ' + error.message);
        }
    }
    
    showError(message) {
        // Emit error event for parent to handle
        this.emit('error', { message });
    }
    
    onDestroy() {
        // Clean up TagInput component
        if (this.tagInputComponent) {
            this.tagInputComponent.destroy();
            this.tagInputComponent = null;
        }
        
        // Clear component state
        this.videos = [];
        this.filteredVideos = [];
        this.filterTags = [];
        this.filterLogic = 'OR';
        this.searchScope = 'both';
        
        debugLog('📊 Results component destroyed');
        
        // Call parent cleanup
        super.onDestroy();
    }
    
    clearAllFilters() {
        // Clear TagInput tags
        if (this.tagInputComponent) {
            this.tagInputComponent.clearTags();
        }
        
        // Reset to default states
        this.filterTags = [];
        this.filterLogic = 'OR';
        this.searchScope = 'both';
        
        // Reset radio buttons
        const orRadio = this.findElement('#logicOR');
        const bothRadio = this.findElement('#scopeBoth');
        if (orRadio) orRadio.checked = true;
        if (bothRadio) bothRadio.checked = true;
        
        // Reapply filters (will show all videos)
        this.applyTagFilter();
        this.updateFilterStatus();
        
        debugLog('🧹 All filters cleared and reset to defaults');
    }
    
    updateFilterStatus() {
        const filterCountEl = this.findElement('#filterCount');
        const clearBtnEl = this.findElement('#clearFiltersBtn');
        
        if (!filterCountEl || !clearBtnEl) return;
        
        const activeFilters = this.filterTags.length;
        const hasFilters = activeFilters > 0;
        
        if (hasFilters) {
            filterCountEl.textContent = `${activeFilters} keyword${activeFilters === 1 ? '' : 's'} • ${this.filterLogic} logic • ${this.searchScope === 'both' ? 'Title+Desc' : 'Title only'}`;
            filterCountEl.style.color = 'var(--xp-selection-bg)';
            filterCountEl.style.fontWeight = 'bold';
            clearBtnEl.style.display = 'inline-block';
        } else {
            filterCountEl.textContent = 'No active filters';
            filterCountEl.style.color = 'var(--xp-text)';
            filterCountEl.style.fontWeight = 'normal';
            clearBtnEl.style.display = 'none';
        }
    }
} 