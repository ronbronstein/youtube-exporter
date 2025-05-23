# 📐 Code Standards - YouTube Research Hub

## 🎯 **Philosophy**

The YouTube Research Hub follows a **"Stupid Simple"** (KISS) principle while maintaining professional code quality. Our single-file architecture should be:
- **Readable**: Self-documenting with clear organization
- **Maintainable**: Easy to find and modify functions
- **Portable**: Works anywhere, no complex build process
- **Contributor-friendly**: Low barrier to entry

---

## 📂 **File Organization**

### **Single HTML File Structure**
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Metadata & External Resources -->
    <title>YouTube Content Research Hub</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Internal CSS Styles -->
    <style>
        /* CSS organized by component hierarchy */
        /* Global variables, base styles, then component-specific */
    </style>
</head>
<body>
    <!-- HTML Structure -->
    <!-- Semantic, accessible markup -->
    
    <script>
        /* ===== TABLE OF CONTENTS ===== */
        /**
         * Comprehensive navigation guide here
         */
        
        /* ===== CONFIGURATION SECTION ===== */
        /* ===== UTILITY FUNCTIONS ===== */
        /* ===== API LAYER ===== */
        /* ===== STORAGE & CACHING ===== */
        /* ===== UI COMPONENTS ===== */
        /* ===== MAIN ANALYSIS WORKFLOW ===== */
        /* ===== ANALYTICS ENGINE ===== */
        /* ===== DISPLAY & VIEW FUNCTIONS ===== */
        /* ===== EXPORT FUNCTIONS ===== */
        /* ===== MESSAGE & LOADING FUNCTIONS ===== */
        /* ===== EVENT HANDLERS & INITIALIZATION ===== */
    </script>
</body>
</html>
```

### **Section Organization Rules**
1. **Each section** must have clear `/* ===== SECTION NAME ===== */` markers
2. **Functions within sections** are ordered by dependency (dependencies first)
3. **Related functions** are grouped together with spacing
4. **Table of contents** is maintained at the top of JavaScript

---

## 🔤 **Naming Conventions**

### **Variables**
```javascript
// ✅ GOOD: Descriptive camelCase with type hints
let videosData = [];           // Array of video objects
let filteredData = [];         // Subset of videosData
let currentView = 'list';      // String state indicator
let isDemoMode = false;        // Boolean flags with 'is' prefix
let apiKeyInput = null;        // DOM element references
const CONFIG = {};             // Constants in SCREAMING_SNAKE

// ❌ AVOID: Generic or unclear names
let data = [];                 // Too generic
let temp = null;              // Temporary variables should be descriptive
let x = 'list';               // Single letter variables
```

### **Functions**
```javascript
// ✅ GOOD: Verb + noun pattern with descriptive prefixes
async function getChannelData(channelId) {}        // get* for data retrieval
function showLoadingSpinner(message) {}            // show*/hide* for UI control
function hideApiKeyPanel() {}                      // 
function analyzeChannelComplete() {}               // analyze* for processing
function displayVideos(videos) {}                  // display* for rendering
function exportToCSV() {}                          // export* for data export
function initializeApiKey() {}                     // initialize* for setup
function processVideoDataBatched(items) {}         // process* for data manipulation
function validateApiKey(key) {}                    // validate* for checks

// ❌ AVOID: Unclear or inconsistent patterns
function doStuff() {}                              // Too generic
function channel() {}                              // Missing action verb
function APIKey() {}                               // Inconsistent casing
```

### **Constants and Configuration**
```javascript
// ✅ GOOD: Organized configuration objects
const CONFIG = {
    API: {
        BASE_URL: 'https://www.googleapis.com/youtube/v3',
        BATCH_SIZE: 50,
        QUOTA_COSTS: {
            search: 100,
            channel: 1
        }
    },
    UI: {
        CHART_COLORS: {
            primary: 'rgb(0, 120, 212)',
            secondary: 'rgb(76, 175, 80)'
        }
    },
    DEMO: {
        MAX_VIDEOS_PER_ANALYSIS: 100,
        MAX_ANALYSES_PER_IP_PER_DAY: 3
    }
};

// Global state variables with type hints
let videosData = [];           // Array<VideoObject>
let youtubeApiKey = null;      // string | null
let currentSort = { column: null, direction: 'asc' };  // SortState
```

---

## 💬 **Comment Standards**

### **Function Documentation (JSDoc Style)**
```javascript
/**
 * Get complete channel data including uploads playlist ID
 * @param {string} channelInput - Channel URL, handle, or ID
 * @param {string} apiKey - YouTube Data API v3 key
 * @returns {Promise<{channelId: string, uploadsPlaylistId: string}>}
 * @throws {Error} When channel not found or API error
 */
async function getChannelData(channelInput, apiKey) {
    // Implementation
}

/**
 * Display videos in sortable table format
 * @param {Array<VideoObject>} videos - Array of video data objects
 */
function displayListView(videos) {
    // Implementation
}
```

### **Section Headers**
```javascript
/* ===== API LAYER ===== */

// Get channel ID from various input formats
async function getChannelId(channelInput, apiKey) {}

// Get channel data including uploads playlist ID  
async function getChannelData(channelInput, apiKey) {}
```

### **Complex Logic Comments**
```javascript
// Apply demo mode video limit
const videoLimit = isDemoMode ? CONFIG.DEMO.MAX_VIDEOS_PER_ANALYSIS : Infinity;
let videosCollected = 0;

// Convert playlist items to search-like format for consistency
const videos = data.items.map(item => ({
    id: { videoId: item.snippet.resourceId.videoId },
    snippet: item.snippet
}));

// Stop if we've reached the demo limit
if (isDemoMode && videosCollected >= videoLimit) {
    debugLog(`Demo mode: Reached video limit of ${videoLimit}`);
    break;
}
```

---

## 🏗️ **Code Structure Patterns**

### **Error Handling Pattern**
```javascript
// ✅ GOOD: Consistent error handling with user feedback
async function analyzeChannelComplete() {
    try {
        showLoading('Analyzing channel content...');
        
        // Main logic here
        const result = await processData();
        
        showSuccess('Analysis complete!');
        return result;
        
    } catch (error) {
        debugLog('Analysis error', error);
        showError('Error: ' + error.message);
    } finally {
        hideLoading();
    }
}
```

### **Configuration Access Pattern**
```javascript
// ✅ GOOD: Use CONFIG object for all settings
const batchSize = CONFIG.API.BATCH_SIZE;
const videoLimit = isDemoMode ? CONFIG.DEMO.MAX_VIDEOS_PER_ANALYSIS : Infinity;

// ❌ AVOID: Magic numbers scattered in code
const batchSize = 50;  // Should be in CONFIG
```

### **DOM Manipulation Pattern**
```javascript
// ✅ GOOD: Check element exists before manipulation
function showError(message) {
    const container = document.querySelector('.main-section');
    if (!container) return;
    
    // Create and insert error element
}

// ✅ GOOD: Use semantic selectors
const analyzeButton = document.getElementById('analyzeButton');
const titleFilter = document.getElementById('titleFilter');
```

---

## 🔧 **Development Practices**

### **Debugging and Logging**
```javascript
// ✅ GOOD: Use centralized debug logging
function debugLog(message, data = null) {
    console.log(`🔍 DEBUG: ${message}`, data);
}

// Usage throughout code
debugLog('Channel data resolved', channelData);
debugLog(`Total videos collected: ${allVideos.length}`);
```

### **State Management**
```javascript
// ✅ GOOD: Clear state variables with meaningful names
let videosData = [];           // Source of truth for video data
let filteredData = [];         // Currently displayed subset
let currentView = 'list';      // UI state
let isDemoMode = false;        // Environment state

// ✅ GOOD: State updates are explicit and documented
function switchView(view) {
    currentView = view;
    
    // Update UI to reflect state change
    updateViewButtons();
    displayVideos(filteredData);
}
```

### **Performance Considerations**
```javascript
// ✅ GOOD: Batch operations for performance
async function processVideoDataBatched(items, apiKey) {
    const batchSize = CONFIG.API.BATCH_SIZE;
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await processBatch(batch);
        
        // Small delay to be API-friendly
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// ✅ GOOD: Debounce user input for performance
let filterTimeout;
titleFilter.addEventListener('input', function() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(filterResults, 300); // Debounce
});
```

---

## 🧪 **Testing Standards**

### **Function Testing**
```javascript
// Each major function should be testable in isolation
// Example: Rate limiting function
function checkDemoRateLimit() {
    // Returns predictable object for testing
    return {
        allowed: boolean,
        remaining: number,
        reason?: string
    };
}
```

### **Manual Testing Checklist**
Before committing changes, test:
- [ ] Load page → No console errors
- [ ] Enter channel → Analysis completes
- [ ] Switch views → Both list/grid work
- [ ] Export functions → Files download correctly
- [ ] Rate limiting → Appropriate limits enforced (demo mode)
- [ ] Responsive design → Works on mobile

---

## 📋 **Git Commit Standards**

### **Commit Message Format**
```
type: brief description

Extended explanation if needed

- Details as bullet points
- Reference issue numbers: #123
- Breaking changes noted clearly
```

### **Commit Types**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code formatting (no functionality change)
- `refactor:` Code restructuring (no functionality change)
- `test:` Adding tests
- `chore:` Development tools, build process

### **Examples**
```bash
feat: add GitHub OAuth authentication for API key management

- Implement OAuth flow for secure user authentication
- Add encrypted localStorage for API key storage
- Create user dashboard for key management
- Fixes #42, addresses security concerns from #38

fix: resolve ReferenceError in demo mode initialization

- Add missing showError and displayVideos functions
- Fix function call order in initialization
- Ensure all dependencies are loaded before use

docs: update CODE_STANDARDS.md with naming conventions

- Define camelCase standards for variables and functions
- Add JSDoc comment requirements
- Include testing checklist for contributors
```

---

## 🚀 **Deployment Standards**

### **Environment Detection**
```javascript
// Detect environment and adjust behavior
function detectEnvironment() {
    if (window.location.hostname.includes('github.io')) {
        return 'github-pages';
    } else if (window.location.protocol === 'file:') {
        return 'local-file';
    } else {
        return 'local-server';
    }
}
```

### **GitHub Pages Compatibility**
- All external resources use HTTPS URLs
- No server-side dependencies
- All functionality works with static hosting
- Graceful degradation for missing features

---

## ✅ **Code Review Checklist**

Before approving pull requests, verify:

### **Functionality**
- [ ] All functions have descriptive names
- [ ] Error handling is consistent
- [ ] No magic numbers (use CONFIG)
- [ ] Console errors resolved

### **Organization**
- [ ] Functions are in correct sections
- [ ] Section markers are present
- [ ] Table of contents updated
- [ ] Dependencies ordered correctly

### **Documentation**
- [ ] Complex functions have JSDoc comments
- [ ] Inline comments explain non-obvious logic
- [ ] README updated if needed
- [ ] Breaking changes documented

### **Performance**
- [ ] No unnecessary API calls
- [ ] Batch operations where appropriate
- [ ] Debounced user input handling
- [ ] Memory leaks avoided

---

This document should be updated as the project evolves. Contributors should reference these standards and suggest improvements through pull requests. 