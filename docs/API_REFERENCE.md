Here's the rewritten **API_REFERENCE.md** - much more concise:

```markdown
# 📚 ES6 Module API Reference

## TOC
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Components](#components)
- [Services](#services)
- [Utilities](#utilities)
- [Workflow](#workflow)

## Architecture
```
src/js/
├── main.js              # Entry point
├── config.js            # Global config
├── components/          # UI Components (7 files)
├── services/            # Business logic (3 files)
└── utils/               # Utilities (6 files)
```

## Configuration
```javascript
import { CONFIG } from './config.js';

CONFIG.API.BASE_URL          // YouTube API base
CONFIG.API.BATCH_SIZE        // 50 videos per batch
CONFIG.DEMO.MAX_VIDEOS       // 100 video demo limit
CONFIG.UI.CHART_COLORS       // Chart styling
```

**Global State:**
```javascript
import { globalState, updateGlobalState } from './config.js';

updateGlobalState('currentView', 'grid');
const videos = globalState.videosData;
```

## Components

### BaseComponent
Foundation class for all UI components:
```javascript
import { BaseComponent } from './components/BaseComponent.js';

class MyComponent extends BaseComponent {
  onCreate() { /* setup */ }
  template() { return '<div>...</div>'; }
  onMount() { /* post-render */ }
  onDestroy() { /* cleanup */ }
}
```

### Key Components
| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| **App.js** | Main controller | `handleChannelAnalysis()`, `switchToDemo()` |
| **VideoList.js** | Video display | `displayVideos()`, `switchView()`, `exportToCSV()` |
| **TagInput.js** | Keyword input | `addTag()`, `getTags()`, `on('tagsChanged')` |
| **Results.js** | Results panel | `updateStats()`, `exportResults()` |

## Services

### YouTubeApiService
```javascript
import { YouTubeApiService } from './services/youtubeApi.js';

const api = new YouTubeApiService(apiKey);
api.setDemoMode(true);                    // 100 video limit

// Core methods
const channelData = await api.getChannelData('@channel');
const videos = await api.getAllChannelVideos(playlistId, progressCallback);
```

### AnalyticsService
```javascript
import { AnalyticsService } from './services/analytics.js';

const analytics = new AnalyticsService();
const stats = analytics.generateBasicStats(videos);
const viralVideos = analytics.identifyViralContent(videos);
```

### StorageService
```javascript
import { StorageService } from './services/storage.js';

const storage = new StorageService();
storage.saveAnalysis(channelId, data);
const cached = storage.loadAnalysis(channelId);
```

## Utilities

| Utility | Import | Purpose |
|---------|--------|---------|
| **Environment** | `import { detectEnvironment } from './utils/environment.js'` | Detect local/github-pages |
| **Formatter** | `import { formatViewCount } from './utils/formatter.js'` | Format numbers (1.2M) |
| **Debug** | `import { debugLog } from './utils/debug.js'` | Console logging |
| **Security** | `import { validateApiKey } from './utils/security.js'` | API key validation |

## Workflow

### Application Lifecycle
```javascript
// 1. Initialize
initializeEnvironment() → new App() → app.init()

// 2. Component Lifecycle  
onCreate() → render() → onMount() → onDestroy()

// 3. Analysis Flow
validateApiKey() → getChannelData() → getAllVideos() → 
generateAnalysis() → displayResults() → saveCache()
```

### Demo Mode
```javascript
api.setDemoMode(true);                    // Enable 100 video limit
const canProceed = await rateLimiter.checkRateLimit();
if (canProceed) {
  const videos = await api.getAllChannelVideos(playlistId);
  // Auto-limited to 100 videos
}
```

### Error Handling
- **Components**: BaseComponent catches and logs errors
- **Services**: User-friendly error messages via MessagePanel
- **API**: Quota exceeded → cached data fallback

### Performance
- **Batching**: 50 videos per API call
- **Cleanup**: Automatic event listener removal
- **Monitoring**: `globalPerformanceMonitor.trackRender()`

## Quick Examples

**Create component:**
```javascript
const videoList = new VideoList(container, { viewMode: 'list' });
videoList.init();
```

**API call:**
```javascript
const api = new YouTubeApiService(apiKey);
const videos = await api.getAllChannelVideos(playlistId);
```

**Format data:**
```javascript
formatViewCount(1234567);  // "1.2M"
formatDuration('PT4M33S'); // "4:33"
```

**Debug:**
```javascript
debugLog('Analysis complete', { videoCount: 150 });
```