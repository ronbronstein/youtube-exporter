# 📚 Internal API Reference

## Overview
This document describes the internal JavaScript API within `youtube_video_exporter.html`. All functions are globally accessible and organized by functional area.

## Configuration System

### `CONFIG` Object
Central configuration for the entire application.

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'https://www.googleapis.com/youtube/v3',
        BATCH_SIZE: 50,
        QUOTA_COSTS: { channel: 1, playlistItems: 1, videos: 1 }
    },
    UI: {
        CHART_COLORS: { primary: 'rgb(0, 120, 212)', ... },
        ANIMATION_DURATION: 400
    },
    STORAGE: {
        MAX_SAVED_SEARCHES: 10,
        CACHE_EXPIRY_HOURS: 24
    }
};
```

## Utility Functions

### `debugLog(message, data?)`
**Purpose**: Centralized logging with consistent format  
**Parameters**: 
- `message` (string) - Log message
- `data` (any, optional) - Additional data object
**Returns**: void  
**Example**: `debugLog('Channel analysis complete', { videoCount: 150 })`

### `formatViewCount(count)`
**Purpose**: Format large numbers to readable format (1.2M, 1.2K)  
**Parameters**: `count` (number) - Raw view count  
**Returns**: string - Formatted count  
**Example**: `formatViewCount(1234567)` → `"1.2M"`

## API Layer Functions

### `initializeApiKey()`
**Purpose**: Auto-detect environment and initialize API key (local vs web mode)  
**Parameters**: None  
**Returns**: Promise\<string\> - 'local' or 'web'  
**Side Effects**: Sets global `apiMode` and `youtubeApiKey` variables

### `getChannelId(channelInput, apiKey)`
**Purpose**: Extract channel ID from various input formats  
**Parameters**:
- `channelInput` (string) - URL, handle, or channel ID
- `apiKey` (string) - YouTube API key
**Returns**: Promise\<string\> - YouTube channel ID  
**Handles**: @username, youtube.com/@channel, youtube.com/channel/ID, direct ID

### `getChannelData(channelInput, apiKey)`
**Purpose**: Get channel metadata including uploads playlist ID  
**Parameters**:
- `channelInput` (string) - Channel identifier
- `apiKey` (string) - YouTube API key  
**Returns**: Promise\<object\> - `{ channelId, uploadsPlaylistId }`

### `getAllChannelVideos(uploadsPlaylistId, apiKey)`
**Purpose**: Fetch ALL videos from channel using uploads playlist  
**Parameters**:
- `uploadsPlaylistId` (string) - Channel's uploads playlist ID
- `apiKey` (string) - YouTube API key
**Returns**: Promise\<array\> - Array of video objects from playlist  
**Performance**: Handles pagination automatically, respects API limits

### `processVideoDataBatched(items, apiKey)`
**Purpose**: Batch process video details in chunks of 50  
**Parameters**:
- `items` (array) - Video items from playlist
- `apiKey` (string) - YouTube API key
**Returns**: Promise\<void\>  
**Side Effects**: Populates global `videosData` array  
**Performance**: Uses CONFIG.API.BATCH_SIZE for optimal API usage

### `formatDuration(duration)`
**Purpose**: Convert YouTube duration format (PT1H2M3S) to readable format  
**Parameters**: `duration` (string) - ISO 8601 duration  
**Returns**: string - Formatted duration (e.g., "1:23:45" or "5:30")  
**Handles**: Edge cases like "P0D", "PT0S", null values

## Storage & Caching Functions

### `saveAnalysis(channelId, data)`
**Purpose**: Cache analysis results in localStorage  
**Parameters**:
- `channelId` (string) - Sanitized channel identifier
- `data` (array) - Video analysis data
**Returns**: void  
**Storage Key**: `analysis_{channelId}`

### `loadAnalysis(channelId)`
**Purpose**: Retrieve cached analysis from localStorage  
**Parameters**: `channelId` (string) - Channel identifier  
**Returns**: array|null - Cached video data or null if not found

### `getSavedSearches()`
**Purpose**: Get all saved search configurations  
**Returns**: array - Array of saved search objects  
**Storage Key**: `youtubeSearches`

### `saveCurrentSearch()`
**Purpose**: Save current search parameters if checkbox is checked  
**Returns**: void  
**Side Effects**: Updates localStorage and UI, enforces max limit

## UI Component Functions

### `showApiKeyPanel()` / `hideApiKeyPanel()`
**Purpose**: Control visibility of API key input panel  
**Returns**: void  
**Used By**: API key initialization system

### `loadSavedClientKey()` / `saveApiKey()`
**Purpose**: Manage client-side API key persistence  
**Returns**: boolean (saveApiKey) - Success status  
**Storage**: localStorage with key validation

### `initializeSavedSearches()`
**Purpose**: Set up saved searches panel and event listeners  
**Returns**: void  
**Side Effects**: Attaches event handlers for checkbox behavior

### `loadSavedSearches()` / `loadSavedSearch(id)` / `deleteSavedSearch(id)`
**Purpose**: Manage saved search functionality  
**Parameters**: `id` (number) - Search ID timestamp  
**Returns**: void  
**Features**: Load/delete individual searches, populate form fields

### `sortTable(column)`
**Purpose**: Sort video table by specified column  
**Parameters**: `column` (string) - Column name to sort by  
**Returns**: void  
**Side Effects**: Updates global `currentSort` state, re-renders table

## Main Analysis Workflow

### `analyzeChannelComplete()`
**Purpose**: Main entry point for complete channel analysis  
**Parameters**: None (reads from DOM inputs)  
**Returns**: Promise\<void\>  
**Workflow**:
1. Validate API key and inputs
2. Get channel data and uploads playlist
3. Fetch all videos from playlist
4. Process video details in batches
5. Apply keyword filtering if specified
6. Generate analysis panels and charts
7. Cache results and save search

### `applyKeywordFilter(query, logic)`
**Purpose**: Filter video results by keywords with AND/OR logic  
**Parameters**:
- `query` (string) - Search terms (comma or space separated)
- `logic` (string) - 'AND' or 'OR'
**Returns**: void  
**Side Effects**: Updates global `videosData` array  
**Features**: Searches titles and descriptions, logs match locations

## Analytics Engine Functions

### `generateContentAnalysis()`
**Purpose**: Generate basic content statistics panel  
**Returns**: void  
**Calculates**: Total videos, avg views, upload frequency, title length, engagement  
**Side Effects**: Inserts analysis panel into DOM

### `analyzeTitlePatterns()`
**Purpose**: Analyze title patterns from top 20% performing videos  
**Returns**: object - `{ patterns, topWords, totalAnalyzed }`  
**Analysis**: Word frequency, length, numbers, questions, caps usage

### `identifyViralContent()`
**Purpose**: Find videos with 3x+ average view performance  
**Returns**: array - Top 5 viral videos sorted by views  
**Threshold**: 3x channel average view count

### `analyzeUploadSchedule()`
**Purpose**: Determine optimal upload timing  
**Returns**: object - `{ bestDay, bestHour, dayStats, hourStats }`  
**Analysis**: Upload frequency by day of week and hour

### `generateAdvancedAnalysis()`
**Purpose**: Create advanced insights panel combining multiple analyses  
**Returns**: void  
**Features**: Title patterns, viral content, upload timing  
**Side Effects**: Inserts advanced analysis panel into DOM

### `createUploadTimeline()`
**Purpose**: Generate Chart.js timeline of upload frequency  
**Returns**: void  
**Chart Type**: Line chart showing videos per month  
**Styling**: Windows XP themed colors and fonts  
**Side Effects**: Inserts chart canvas and initializes Chart.js

## Display & Export Functions

### `switchView(viewType)`
**Purpose**: Toggle between list and grid view modes  
**Parameters**: `viewType` (string) - 'list' or 'grid'  
**Returns**: void  
**Side Effects**: Updates button states, re-renders video display

### `displayVideos(videos)`
**Purpose**: Render videos in current view mode  
**Parameters**: `videos` (array) - Video objects to display  
**Returns**: void  
**Delegates**: `displayListView()` or `displayGridView()`

### `displayListView(videos, container)` / `displayGridView(videos, container)`
**Purpose**: Render videos in specific view format  
**Parameters**:
- `videos` (array) - Video data
- `container` (HTMLElement) - Target container
**Returns**: void  
**Features**: Sortable table (list), thumbnail cards (grid)

### `filterResults()`
**Purpose**: Real-time filtering of displayed videos  
**Returns**: void  
**Triggers**: Title filter input changes  
**Searches**: Title, description, channel name  
**Debounced**: 300ms delay via setTimeout

### Export Functions
- `exportToCSV()` - Complete dataset export
- `exportTitles()` - Title-only text export  
- `exportMarkdown()` - LLM-ready structured export

## Message & Loading Functions

### `showLoading(message)` / `hideLoading()`
**Purpose**: Control loading spinner and message  
**Parameters**: `message` (string) - Loading text  
**Returns**: void

### `showError(message)` / `showSuccess(message)`
**Purpose**: Display user feedback messages  
**Parameters**: `message` (string) - Message text  
**Returns**: void  
**Styling**: Windows XP themed message panels

### `clearMessages()`
**Purpose**: Remove all current message panels  
**Returns**: void

## Event Handlers

### DOM Ready Handler
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeApiKey();
    initializeSavedSearches();
});
```

### Keyboard Support
```javascript
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && target.matches('#channelInput, #channelQuery')) {
        analyzeChannelComplete();
    }
});
```

### Real-time Filtering
```javascript
document.getElementById('titleFilter').addEventListener('input', function() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(filterResults, 300);
});
```

## Global State Variables

- `videosData` (array) - Complete video dataset
- `filteredData` (array) - Currently filtered/displayed videos
- `youtubeApiKey` (string) - Current API key
- `currentView` (string) - 'list' or 'grid'
- `currentSort` (object) - `{ column, direction }`
- `apiMode` (string) - 'local' or 'web'

## Error Handling

### Global Error Listeners
```javascript
window.addEventListener('error', handleError);
window.addEventListener('unhandledrejection', handlePromiseError);
```

### API Error Patterns
- Quota exceeded (403) - Clear messaging about daily limits
- Invalid API key (403) - Guidance on key setup
- Channel not found (404) - Input validation suggestions
- Network errors - Retry recommendations

## Performance Notes

- **Batch Size**: 50 videos per API call (YouTube limit)
- **Debouncing**: 300ms for search input
- **Memory**: Large channels cache analysis results
- **DOM Updates**: Efficient innerHTML replacement for large datasets
- **Chart Rendering**: setTimeout ensures DOM readiness

## Security Considerations

- **API Key Visibility**: Client-side keys are visible in browser
- **Input Sanitization**: Channel IDs sanitized for cache keys
- **XSS Prevention**: User input properly escaped in innerHTML
- **CORS**: All API calls to googleapis.com (same-origin policy compliant) 