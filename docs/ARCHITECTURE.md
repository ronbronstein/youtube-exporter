# 🏗️ Architecture Documentation

## TOC
- [Overview](#overview)
- [File Structure](#file-structure) 
- [Design Patterns](#design-patterns)
- [Technical Stack](#technical-stack)
- [Performance](#performance)
- [Environments](#environments)

## Overview

**YouTube Research Hub** uses modern ES6 modular architecture with Vite build system for maintainability and performance.

**Key Principles:**
- ES6 modules with clean imports/exports
- Component-based UI with lifecycle management
- Service layer for business logic
- Utility modules for shared functionality

## File Structure

```
src/
├── index.html              # App shell
├── js/
│   ├── main.js            # Entry point & initialization
│   ├── config.js          # Global configuration
│   ├── components/        # UI Components (7 ES6 classes)
│   │   ├── BaseComponent.js   # Foundation class
│   │   ├── App.js            # Main controller
│   │   ├── VideoList.js      # Video display & export
│   │   ├── Results.js        # Results panel
│   │   ├── TagInput.js       # Keyword input
│   │   ├── MessagePanel.js   # User notifications
│   │   └── LoadingSpinner.js # Loading states
│   ├── services/          # Business Logic (3 services)
│   │   ├── youtubeApi.js     # YouTube API integration
│   │   ├── analytics.js      # Content analysis
│   │   └── storage.js        # Data persistence
│   └── utils/             # Utilities (6 modules)
│       ├── environment.js    # Environment detection
│       ├── formatter.js      # Data formatting
│       ├── security.js       # API key validation
│       ├── debug.js          # Logging
│       ├── performance.js    # Monitoring
│       └── rateLimiter.js    # Demo rate limiting
├── css/
│   └── main.css           # Windows XP styling (5900+ lines)
└── assets/                # Static resources
```

## Design Patterns

### Component Pattern
All UI components extend BaseComponent for consistent lifecycle:

| Lifecycle Method | Purpose | When Called |
|------------------|---------|-------------|
| `onCreate()` | Setup state, bind events | Before first render |
| `template()` | Return HTML string/element | During render |
| `onMount()` | DOM manipulation, event listeners | After render |
| `onUpdate()` | Handle state changes | On updates |
| `onDestroy()` | Cleanup, remove listeners | Component removal |

### Service Layer
Business logic separated from UI:

| Service | Responsibility | Key Methods |
|---------|---------------|-------------|
| **YouTubeApiService** | API calls, data fetching | `getChannelData()`, `getAllChannelVideos()` |
| **AnalyticsService** | Content analysis, insights | `generateBasicStats()`, `identifyViralContent()` |
| **StorageService** | Caching, persistence | `saveAnalysis()`, `loadAnalysis()` |

### Configuration Pattern
Centralized config with environment awareness:
```javascript
export const CONFIG = {
    API: { BASE_URL, BATCH_SIZE: 50, QUOTA_COSTS },
    DEMO: { MAX_VIDEOS: 100, RATE_LIMITS },
    UI: { CHART_COLORS, ANIMATION_DURATION: 400 },
    STORAGE: { MAX_SAVED_SEARCHES: 10, CACHE_EXPIRY: 24h }
};
```

## Technical Stack

### Build System
| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Vite** | Dev server, bundling | Hot reload, ES6 modules, 104KB output |
| **GitHub Actions** | CI/CD | Auto-deploy on push to main |
| **ESModules** | Import/export | No bundler required for development |

### Core Technologies
- **ES6 Classes** - Component architecture
- **Chart.js** - Analytics visualization  
- **YouTube Data API v3** - Channel analysis
- **localStorage** - Caching & persistence
- **CSS3** - Windows XP styling system

### Bundle Analysis
```
Production Build (npm run build):
├── index.html              # App shell
├── assets/
│   ├── index-[hash].js    # Main bundle (~90KB)
│   ├── vendor-[hash].js   # Chart.js (~14KB)  
│   └── index-[hash].css   # Styles (~8KB)
└── Total: ~104KB optimized
```

## Performance

### Optimization Strategies
| Strategy | Implementation | Benefit |
|----------|---------------|---------|
| **Component Lifecycle** | `onDestroy()` cleanup | Prevents memory leaks |
| **Event Management** | Automatic listener removal | No zombie listeners |
| **API Batching** | 50 videos per API call | YouTube API efficiency |
| **Tree Shaking** | ES6 modules + Vite | Only used code included |
| **Demo Rate Limiting** | IP-based limits | API quota protection |

### Memory Management
- **Component Destruction**: Automatic cleanup via BaseComponent
- **Event Cleanup**: Listeners removed in component lifecycle
- **Cache Limits**: 10 saved searches, 24h expiry
- **Global State**: Minimal globals via config.js

### API Efficiency
```javascript
// YouTube API optimization
CONFIG.API.BATCH_SIZE = 50;           // YouTube's maximum
CONFIG.DEMO.MAX_VIDEOS = 100;         // 2 API calls max
CONFIG.API.QUOTA_COSTS = {
    channel: 1,        // Per channel lookup
    playlistItems: 1,  // Per 50 videos  
    videos: 1          // Per 50 video details
};
```

## Environments

### Local Development
```bash
npm run dev                    # Vite dev server (port 5173)
# Auto-loads API key from .env file
# Full functionality, no demo limits
# Hot reload, source maps, debugging
```

### GitHub Pages Production  
```bash
git push origin main           # Auto-deployment
# Demo mode: Built-in API key, 100 video limit
# Live mode: User API key, unlimited
# Optimized bundle, CDN delivery
```

### Environment Detection
```javascript
export function detectEnvironment() {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) return 'github-pages';
    if (hostname.includes('localhost')) return 'local';
    return 'local';
}
```

### API Key Sources
| Environment | Source | Fallback |
|-------------|--------|----------|
| **Local** | `.env` file | User input |
| **GitHub Pages Demo** | GitHub Secrets | N/A |
| **GitHub Pages Live** | User input | Demo mode |

### Build Commands
```bash
npm run dev                    # Development server
npm run build                  # Production build  
npm run preview                # Preview production
npm run test                   # Integration tests (?test=true)
```

## Key Design Decisions

### 1. ES6 Modules + Vite
- **Benefits**: Hot reload, tree shaking, modern development
- **Trade-off**: Build step required vs direct HTML
- **Result**: 104KB optimized bundle, excellent developer experience

### 2. Component Lifecycle
- **Benefits**: Predictable behavior, automatic cleanup
- **Trade-off**: More boilerplate vs simple functions  
- **Result**: Memory leak prevention, maintainable UI

### 3. Windows XP Styling
- **Benefits**: Unique identity, nostalgic appeal
- **Trade-off**: Custom CSS vs modern frameworks
- **Result**: 5900+ line CSS system, authentic retro experience

### 4. Demo Mode Integration
- **Benefits**: Showcase without API setup, quota protection
- **Trade-off**: Additional complexity vs live-only
- **Result**: Accessible demo with smart rate limiting

---

*Architecture designed for maintainability, performance, and unique user experience.* 