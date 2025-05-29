/**
 * Results Component - Results display with export functionality
 * 
 * Features:
 * - Results count display
 * - View toggle (list/grid)  
 * - Export options (CSV, Markdown, Titles)
 * - Real-time search filter
 * - Integration with VideoList component
 */

import { BaseComponent } from './BaseComponent.js';
import { formatViewCount } from '../utils/formatter.js';
import { debugLog } from '../utils/debug.js';

export class Results extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.videos = [];
        this.filteredVideos = [];
        this.currentView = 'list';
        this.channelName = '';
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
                <input 
                    type="text" 
                    id="titleFilter" 
                    class="filter-input"
                    placeholder="Filter by title or description..."
                >
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
        
        // Search filter listener
        if (this.options.enableFilter) {
            const titleFilter = this.findElement('#titleFilter');
            if (titleFilter) {
                let filterTimeout;
                this.addListener(titleFilter, 'input', (e) => {
                    clearTimeout(filterTimeout);
                    filterTimeout = setTimeout(() => {
                        this.filterResults(e.target.value);
                    }, 300); // Debounce
                });
            }
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
        const titleFilter = this.findElement('#titleFilter');
        if (titleFilter) {
            titleFilter.value = query;
            // Apply the filter immediately if there's a query
            if (query.trim()) {
                this.filterResults(query);
            }
            debugLog(`🔍 Search filter set to: "${query}"`);
        }
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
    
    filterResults(query = '') {
        if (!this.videos || this.videos.length === 0) {
            this.filteredVideos = [];
            this.videoListComponent.setVideos([]);
            this.updateResultsCount();
            return;
        }

        query = query.trim().toLowerCase();
        
        if (!query) {
            // If no filter query, show all fetched videos
            this.filteredVideos = [...this.videos];
        } else {
            // Filter the fetched videos based on the search query
            this.filteredVideos = this.videos.filter(video => {
                const title = video.title?.toLowerCase() || '';
                const description = video.description?.toLowerCase() || '';
                
                // Split query into keywords and check if any match
                const keywords = query.split(/\s+/).filter(k => k.length > 0);
                return keywords.some(keyword => 
                    title.includes(keyword) || description.includes(keyword)
                );
            });
        }

        console.log(`🔍 Filter applied: "${query}" → ${this.filteredVideos.length} results`);
        
        // Update video list with filtered results
        this.videoListComponent.setVideos(this.filteredVideos);
        
        // Update count display
        this.updateResultsCount();
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
        this.channelName = '';
        
        // Clear search filter
        const titleFilter = this.findElement('#titleFilter');
        if (titleFilter) {
            titleFilter.value = '';
        }
        
        // Update UI
        this.updateResultsCount();
        this.updateExportButtons();
        
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
} 