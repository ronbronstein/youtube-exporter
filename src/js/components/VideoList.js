/**
 * VideoList Component - Displays videos in list or grid format
 * 
 * Features:
 * - List view with sortable table
 * - Grid view with cards
 * - View switching
 * - Safe video rendering
 */

import { BaseComponent } from './BaseComponent.js';
import { formatViewCount } from '../utils/formatter.js';
import { sanitizeURL } from '../utils/security.js';
import { debugLog } from '../utils/debug.js';

export class VideoList extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.videos = [];
        this.currentView = 'list';
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }
    
    get defaultOptions() {
        return {
            enableSorting: true,
            enableViewSwitch: true,
            defaultView: 'list'
        };
    }
    
    onCreate() {
        this.currentView = this.options.defaultView;
    }
    
    template() {
        return `
            <div class="video-list-component">
                ${this.renderViewControls()}
                <div class="video-content" id="videoContent"></div>
            </div>
        `;
    }
    
    renderViewControls() {
        if (!this.options.enableViewSwitch) return '';
        
        return `
            <div class="view-controls">
                <button 
                    id="listViewBtn" 
                    class="view-btn ${this.currentView === 'list' ? 'active' : ''}"
                    data-view="list">
                    📋 List
                </button>
                <button 
                    id="gridViewBtn" 
                    class="view-btn ${this.currentView === 'grid' ? 'active' : ''}"
                    data-view="grid">
                    ▦ Grid
                </button>
            </div>
        `;
    }
    
    onMount() {
        // Add view switching listeners
        if (this.options.enableViewSwitch) {
            const listBtn = this.findElement('#listViewBtn');
            const gridBtn = this.findElement('#gridViewBtn');
            
            if (listBtn) {
                this.addListener(listBtn, 'click', () => this.switchView('list'));
            }
            if (gridBtn) {
                this.addListener(gridBtn, 'click', () => this.switchView('grid'));
            }
        }
    }
    
    // Public API
    setVideos(videos) {
        this.videos = videos || [];
        this.renderVideos();
    }
    
    switchView(view) {
        if (this.currentView === view) return;
        
        this.currentView = view;
        this.updateViewButtons();
        this.renderVideos();
        
        debugLog(`📺 Switched to ${view} view`);
    }
    
    sortBy(column, direction = null) {
        if (!this.options.enableSorting) return;
        
        // Toggle direction if same column
        if (this.sortColumn === column) {
            direction = direction || (this.sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            direction = direction || 'asc';
        }
        
        this.sortColumn = column;
        this.sortDirection = direction;
        
        this.videos.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle different data types
            if (column === 'publishedDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            let result = 0;
            if (aVal < bVal) result = -1;
            else if (aVal > bVal) result = 1;
            
            return direction === 'desc' ? -result : result;
        });
        
        this.renderVideos();
        debugLog(`📊 Sorted by ${column} ${direction}`);
    }
    
    // Private Methods
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
    
    renderVideos() {
        const contentContainer = this.findElement('#videoContent');
        if (!contentContainer) return;
        
        if (!this.videos || this.videos.length === 0) {
            contentContainer.innerHTML = this.renderEmptyState();
            return;
        }
        
        if (this.currentView === 'grid') {
            this.renderGridView(contentContainer);
        } else {
            this.renderListView(contentContainer);
        }
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--xp-text-disabled);">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No videos found</div>
                <div style="font-size: 14px;">Try adjusting your search criteria</div>
            </div>
        `;
    }
    
    renderListView(container) {
        container.className = 'video-list';
        
        const table = this.createElement('table', { className: 'video-table' });
        
        // Create header
        const thead = this.createElement('thead');
        const headerRow = this.createElement('tr');
        
        const columns = [
            { key: 'title', label: 'Title', sortable: true },
            { key: 'publishedDate', label: 'Date', sortable: true },
            { key: 'viewCount', label: 'Views', sortable: true },
            { key: 'likeCount', label: 'Likes', sortable: true },
            { key: 'commentCount', label: 'Comments', sortable: true },
            { key: 'duration', label: 'Duration', sortable: false }
        ];
        
        columns.forEach(col => {
            const th = this.createElement('th', {
                textContent: col.label,
                'data-column': col.key
            });
            
            if (col.sortable && this.options.enableSorting) {
                th.style.cursor = 'pointer';
                th.title = 'Click to sort';
                
                // Add sort indicator
                if (this.sortColumn === col.key) {
                    th.textContent += this.sortDirection === 'asc' ? ' ↑' : ' ↓';
                }
                
                this.addListener(th, 'click', () => this.sortBy(col.key));
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = this.createElement('tbody');
        
        this.videos.forEach(video => {
            const row = this.createVideoRow(video);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }
    
    createVideoRow(video) {
        const row = this.createElement('tr');
        
        // Title cell
        const titleCell = this.createElement('td', { className: 'video-title-cell' });
        
        const titleLink = this.createElement('a', {
            href: sanitizeURL(video.url),
            target: '_blank',
            className: 'video-title-link',
            textContent: video.title
        });
        
        const metaDiv = this.createElement('div', {
            className: 'video-meta-small',
            textContent: video.description || ''
        });
        
        titleCell.appendChild(titleLink);
        titleCell.appendChild(metaDiv);
        row.appendChild(titleCell);
        
        // Stats cells
        row.appendChild(this.createElement('td', {
            className: 'date-cell',
            textContent: video.publishedAt || ''
        }));
        
        row.appendChild(this.createElement('td', {
            className: 'stats-cell',
            textContent: formatViewCount(video.viewCount || 0)
        }));
        
        row.appendChild(this.createElement('td', {
            className: 'stats-cell',
            textContent: formatViewCount(video.likeCount || 0)
        }));
        
        row.appendChild(this.createElement('td', {
            className: 'stats-cell',
            textContent: formatViewCount(video.commentCount || 0)
        }));
        
        row.appendChild(this.createElement('td', {
            className: 'date-cell',
            textContent: video.duration || ''
        }));
        
        return row;
    }
    
    renderGridView(container) {
        container.className = 'video-grid';
        container.innerHTML = '';
        
        this.videos.forEach(video => {
            const card = this.createVideoCard(video);
            container.appendChild(card);
        });
    }
    
    createVideoCard(video) {
        const card = this.createElement('div', { className: 'video-card' });
        
        // Thumbnail
        const thumbnail = this.createElement('img', {
            src: sanitizeURL(video.thumbnail || ''),
            alt: 'Video thumbnail',
            className: 'video-thumbnail',
            loading: 'lazy'
        });
        card.appendChild(thumbnail);
        
        // Title
        const title = this.createElement('div', {
            className: 'video-title',
            textContent: video.title || 'Untitled'
        });
        card.appendChild(title);
        
        // Metadata
        const metaDiv = this.createElement('div', { className: 'video-meta' });
        
        metaDiv.appendChild(this.createElement('div', {
            textContent: `📅 ${video.publishedAt || 'Unknown date'}`
        }));
        
        metaDiv.appendChild(this.createElement('div', {
            textContent: `⏱️ ${video.duration || 'Unknown'}`
        }));
        
        metaDiv.appendChild(this.createElement('div', {
            textContent: `👀 ${formatViewCount(video.viewCount || 0)}`
        }));
        
        metaDiv.appendChild(this.createElement('div', {
            textContent: `👍 ${formatViewCount(video.likeCount || 0)}`
        }));
        
        card.appendChild(metaDiv);
        
        // Stats and link
        const statsDiv = this.createElement('div', { className: 'video-stats' });
        
        statsDiv.appendChild(this.createElement('span', {
            textContent: `💬 ${formatViewCount(video.commentCount || 0)}`
        }));
        
        const watchLink = this.createElement('a', {
            href: sanitizeURL(video.url || ''),
            target: '_blank',
            className: 'watch-btn',
            textContent: '▶️ Watch'
        });
        statsDiv.appendChild(watchLink);
        
        card.appendChild(statsDiv);
        
        return card;
    }
} 