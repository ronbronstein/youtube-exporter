# 📚 ES6 Module API Reference

## Overview
This document describes the ES6 modular architecture of YouTube Research Hub. The application is built with modern ES6 classes, modules, and services for maintainability and scalability.

## 🏗️ Architecture Overview

```
src/js/
├── main.js                    # Application entry point
├── config.js                  # Global configuration
├── components/                # UI Components (ES6 Classes)
│   ├── BaseComponent.js      # Foundation class for all components
│   ├── App.js                # Main application controller  
│   ├── VideoList.js          # Video display and management
│   ├── Results.js            # Results panel and filtering
│   ├── TagInput.js           # Tag-based keyword input
│   ├── MessagePanel.js       # User feedback and notifications
│   └── LoadingSpinner.js     # Loading states
├── services/                  # Business Logic Services
│   ├── youtubeApi.js         # YouTube Data API v3 integration
│   ├── analytics.js          # Content analysis engine
│   └── storage.js            # Data persistence and caching
└── utils/                     # Utility Modules
    ├── environment.js         # Environment detection
    ├── formatter.js           # Data formatting helpers
    ├── security.js            # API key validation
    ├── debug.js               # Development logging
    ├── performance.js         # Performance monitoring
    └── rateLimiter.js         # Demo mode rate limiting
```

---

## 📋 Configuration System

### `CONFIG` Object (config.js)
Central configuration exported as ES6 module.

```javascript
import { CONFIG } from './config.js';

CONFIG.API.BASE_URL            // YouTube API base URL
CONFIG.API.BATCH_SIZE          // Video processing batch size (50)
CONFIG.API.QUOTA_COSTS         // API quota cost estimates
CONFIG.DEMO.MAX_VIDEOS_PER_ANALYSIS  // Demo mode limits
CONFIG.UI.CHART_COLORS         // Chart.js color scheme
CONFIG.STORAGE.MAX_SAVED_SEARCHES    // localStorage limits
```

### Global State Management
```javascript
import { globalState, updateGlobalState, getGlobalState } from './config.js';

// Access current state
const currentVideos = getGlobalState('videosData');
const apiKey = getGlobalState('youtubeApiKey');

// Update state
updateGlobalState('currentView', 'grid');
updateGlobalState('isDemoMode', true);
```

---

## 🎯 Component System

### BaseComponent Class
Foundation for all UI components with lifecycle management.

```javascript
import { BaseComponent } from './components/BaseComponent.js';

class MyComponent extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
    }
    
    // Lifecycle Methods (override as needed)
    onCreate() { /* Setup logic */ }
    onMount() { /* Post-render logic */ }
    onUpdate(changes) { /* Update logic */ }
    onDestroy() { /* Cleanup logic */ }
    
    template() {
        return '<div>Component content</div>';
    }
}
```

**Key Methods:**
- `init()` - Initialize component (calls onCreate → render → onMount)
- `render()` - Re-render component template
- `addListener(element, event, handler)` - Safe event binding
- `emit(eventName, data)` - Emit custom events
- `destroy()` - Clean up component and remove listeners

### App Component
Main application controller that manages all other components.

```javascript
import { App } from './components/App.js';

const app = new App(container, {
    autoInit: true,
    enableDemoMode: true,
    enableAnalytics: true
});

app.init();
```

**Key Methods:**
- `initializeComponents()` - Set up all child components
- `handleChannelAnalysis(channelInput)` - Main analysis workflow
- `switchToDemo()` / `exitDemo()` - Demo mode management
- `validateApiKey(key)` - API key validation

### VideoList Component
Manages video display in list/grid views with sorting and filtering.

```javascript
import { VideoList } from './components/VideoList.js';

const videoList = new VideoList(container, {
    viewMode: 'list', // 'list' or 'grid'
    sortable: true,
    exportable: true
});

// Methods
videoList.displayVideos(videosArray);
videoList.switchView('grid');
videoList.sortVideos('viewCount', 'desc');
videoList.exportToCSV();
```

### Results Component
Results panel with filtering and export functionality.

```javascript
import { Results } from './components/Results.js';

const results = new Results(container);

// Methods
results.updateStats(videoData);
results.showFilters();
results.exportResults('csv');
```

### TagInput Component
Professional tag-based keyword input system.

```javascript
import { TagInput } from './components/TagInput.js';

const tagInput = new TagInput(container, {
    placeholder: 'Enter keywords...',
    maxTags: 10
});

// Events
tagInput.on('tagsChanged', (tags) => {
    console.log('Current tags:', tags);
});

// Methods
tagInput.addTag('keyword');
tagInput.removeTag('keyword');
tagInput.getTags(); // Returns array of current tags
```

### MessagePanel Component
User feedback and notification system.

```javascript
import { MessagePanel } from './components/MessagePanel.js';

const messagePanel = new MessagePanel(container);

// Methods
messagePanel.showSuccess('Operation completed!');
messagePanel.showError('Something went wrong');
messagePanel.showInfo('Processing...');
messagePanel.clear();
```

### LoadingSpinner Component
Loading state management with progress tracking.

```javascript
import { LoadingSpinner } from './components/LoadingSpinner.js';

const spinner = new LoadingSpinner(container);

// Methods
spinner.show('Loading videos...');
spinner.updateProgress(45); // 45% complete
spinner.hide();
```

---

## 🔧 Service Layer

### YouTubeApiService
Handles all YouTube Data API v3 interactions.

```javascript
import { YouTubeApiService } from './services/youtubeApi.js';

const api = new YouTubeApiService(apiKey);

// Configuration
api.setDemoMode(true);        // Enable demo mode limits
api.setApiKey(newKey);        // Update API key

// Core Methods
const channelId = await api.getChannelId('@channelname');
const channelData = await api.getChannelData(channelInput);
const videos = await api.getAllChannelVideos(uploadsPlaylistId, progressCallback);
const videoDetails = await api.getVideoDetails(videoIds);
```

**Features:**
- Handles @username, full URLs, and direct channel IDs
- Automatic pagination for large channels
- Demo mode with rate limiting (100 videos max)
- Progress callbacks for long operations
- Comprehensive error handling

### AnalyticsService
Content analysis and insights generation.

```javascript
import { AnalyticsService } from './services/analytics.js';

const analytics = new AnalyticsService();

// Analysis Methods
const stats = analytics.generateBasicStats(videos);
const insights = analytics.generateAdvancedAnalysis(videos);
const viralVideos = analytics.identifyViralContent(videos);
const titlePatterns = analytics.analyzeTitlePatterns(videos);
const uploadSchedule = analytics.analyzeUploadSchedule(videos);

// Chart Generation
analytics.createViewsChart(videos, chartContainer);
analytics.createUploadTimeline(videos, chartContainer);
analytics.createEngagementChart(videos, chartContainer);
```

### StorageService
Data persistence and caching management.

```javascript
import { StorageService } from './services/storage.js';

const storage = new StorageService();

// Cache Management
storage.saveAnalysis(channelId, videoData);
const cachedData = storage.loadAnalysis(channelId);
storage.clearExpiredCache();

// Search History
storage.saveSearch(searchParams);
const searches = storage.getSavedSearches();
storage.deleteSearch(searchId);

// API Key Management
storage.saveApiKey(encryptedKey);
const apiKey = storage.loadApiKey();
```

---

## 🛠️ Utility Modules

### Environment Detection
```javascript
import { initializeEnvironment, detectEnvironment, getEnvironmentMode } from './utils/environment.js';

const env = detectEnvironment(); // 'local', 'github-pages', etc.
const mode = getEnvironmentMode(); // 'demo', 'live'
```

### Data Formatting
```javascript
import { formatViewCount, formatDuration, formatDate } from './utils/formatter.js';

formatViewCount(1234567);     // "1.2M"
formatDuration('PT4M33S');    // "4:33"
formatDate('2024-01-15');     // "Jan 15, 2024"
```

### Security Utilities
```javascript
import { validateApiKey, encryptApiKey, decryptApiKey } from './utils/security.js';

const isValid = validateApiKey(key);    // Boolean validation
const encrypted = encryptApiKey(key);   // Encrypt for storage
const decrypted = decryptApiKey(hash);  // Decrypt from storage
```

### Debug Logging
```javascript
import { debugLog } from './utils/debug.js';

debugLog('Operation started', { channelId: 'UC123' });
// Output: [DEBUG] Operation started { channelId: 'UC123' }
```

### Performance Monitoring
```javascript
import { globalPerformanceMonitor } from './utils/performance.js';

// Track component renders
globalPerformanceMonitor.trackRender('VideoList', renderFunction);

// Track API calls
globalPerformanceMonitor.trackApiCall('channels', apiCall);

// Get performance data
const metrics = globalPerformanceMonitor.getMetrics();
```

### Rate Limiting (Demo Mode)
```javascript
import { DemoRateLimiter } from './utils/rateLimiter.js';

const limiter = new DemoRateLimiter(CONFIG);
limiter.setDemoMode(true);

const canProceed = await limiter.checkRateLimit('analysis');
limiter.recordUsage('analysis');
```

---

## 🚀 Application Lifecycle

### 1. Initialization (main.js)
```javascript
// Environment detection
initializeEnvironment();

// App creation and initialization
const app = new App(container, options);
app.init();
```

### 2. Component Lifecycle
```javascript
// All components follow this pattern:
component.onCreate();    // Setup
component.render();      // DOM creation
component.onMount();     // Post-render setup
component.onUpdate();    // Handle updates  
component.onDestroy();   // Cleanup
```

### 3. Analysis Workflow
```javascript
// Typical analysis flow:
app.validateApiKey(key)
  → app.handleChannelAnalysis(channelInput)
  → youtubeApi.getChannelData(input)
  → youtubeApi.getAllChannelVideos(playlistId)
  → analytics.generateAnalysis(videos)
  → videoList.displayVideos(videos)
  → storage.saveAnalysis(channelId, data)
```

---

## 🎭 Demo Mode Integration

### Features
- **Video Limits**: Maximum 100 videos per analysis
- **Rate Limiting**: 5 analyses per IP per day
- **Progress Tracking**: Real-time progress updates
- **Sample Data**: Built-in demo channels

### Implementation
```javascript
// Enable demo mode
api.setDemoMode(true);
rateLimiter.setDemoMode(true);

// Check limits before analysis
const canProceed = await rateLimiter.checkRateLimit('analysis');
if (!canProceed) {
    messagePanel.showError('Demo limit reached');
    return;
}

// Perform limited analysis
const videos = await api.getAllChannelVideos(playlistId, progressCallback);
// Auto-limited to 100 videos in demo mode
```

---

## 🧪 Testing & Debugging

### Integration Tests
```javascript
// Access via URL parameter: ?test=true
// Or programmatically:
import('./integration-test.js').then(({ default: IntegrationTest }) => {
    const tester = new IntegrationTest();
    const results = await tester.runAllTests();
});
```

### Debug Access
```javascript
// Available in browser console:
window.debugApp;                    // Main app instance
window.integrationTestResults;      // Test results
globalPerformanceMonitor.getMetrics(); // Performance data
```

### Error Handling
- **Component Errors**: Caught by BaseComponent and logged
- **API Errors**: Handled by services with user-friendly messages
- **Global Errors**: Window error handlers with fallback UI

---

## 📈 Performance Considerations

### Optimization Features
- **Component Lifecycle**: Proper cleanup prevents memory leaks
- **Event Management**: Automatic listener removal
- **API Batching**: Process videos in chunks of 50
- **Render Tracking**: Monitor component performance
- **Lazy Loading**: Components load only when needed

### Memory Management
- **Component Destruction**: `onDestroy()` cleanup
- **Event Cleanup**: Automatic listener removal
- **Cache Limits**: Configurable storage limits
- **Global State**: Minimal global variables

---

## 🔐 Security Features

### API Key Protection
- **Client-side Encryption**: API keys encrypted before localStorage
- **Validation**: Key format and access validation
- **Environment Variables**: Support for build-time API keys
- **Demo Mode**: Secure demo without exposing keys

### Input Sanitization
- **Channel Input**: URL parsing and validation
- **Search Terms**: XSS prevention in keyword filtering
- **Storage Keys**: Sanitized cache identifiers

---

*This API reference documents the current ES6 modular architecture. For legacy functionality, see the `legacy/` folder.* 