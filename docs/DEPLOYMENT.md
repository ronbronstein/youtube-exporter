# 🚀 Deployment Guide - YouTube Research Hub

## 🎯 **Deployment Architecture Overview**

YouTube Research Hub supports multiple deployment strategies, each optimized for different use cases:

```
🌐 DEPLOYMENT ECOSYSTEM
├─ 📱 GitHub Pages (Public Demo)
│   ├─ Auto-deployment from main branch
│   ├─ User API keys with GitHub OAuth
│   ├─ Zero server costs
│   └─ Global CDN distribution
│
├─ 💻 Local Development
│   ├─ Direct HTML file opening
│   ├─ Local test server option
│   ├─ Environment variable API keys
│   └─ Full feature access
│
└─ 🔧 Contributor Setup
    ├─ Git clone → instant development
    ├─ Zero build process
    └─ Individual API key management
```

---

## 🌐 **GitHub Pages Deployment**

### **Automatic Deployment Setup**

**Step 1: Repository Configuration**
```bash
# 1. Push to main branch triggers auto-deployment
git push origin main

# 2. GitHub Actions builds and deploys
# 3. Live at: https://ronbronstein.github.io/youtube-exporter/
```

**Step 2: GitHub Actions Workflow**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Pages
      uses: actions/configure-pages@v3
      
    - name: Build
      run: |
        # Copy main file to deployment directory
        mkdir -p _site
        cp youtube_video_exporter.html _site/index.html
        cp -r docs _site/docs
        
        # Create CNAME for custom domain (optional)
        # echo "youtube-tool.ronbronstein.com" > _site/CNAME
        
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: '_site'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2

permissions:
  contents: read
  pages: write
  id-token: write

environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**Step 3: Repository Settings**
1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Custom domain (optional): `youtube-tool.ronbronstein.com`
4. Enforce HTTPS: ✅ **Enabled**

### **Environment Detection in Code**

```javascript
/* ===== ENVIRONMENT DETECTION ===== */

function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname.includes('github.io') || hostname.includes('github.dev')) {
        return 'github-pages';
    } else if (protocol === 'file:') {
        return 'local-file';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'local-server';
    } else {
        return 'custom-domain';
    }
}

function initializeEnvironment() {
    const environment = detectEnvironment();
    
    switch (environment) {
        case 'github-pages':
            initializeGitHubPages();
            break;
        case 'local-file':
            initializeLocalFile();
            break;
        case 'local-server':
            initializeLocalServer();
            break;
        default:
            initializeCustomDomain();
    }
}

function initializeGitHubPages() {
    // Enable GitHub OAuth for API key management
    CONFIG.AUTH.GITHUB_OAUTH_ENABLED = true;
    CONFIG.AUTH.CLIENT_ID = 'your_github_oauth_client_id';
    
    // Show environment indicator
    showEnvironmentBanner('🌐 Live Demo - Powered by GitHub Pages');
    
    // Initialize OAuth system
    initializeGitHubOAuth();
}
```

---

## 💻 **Local Development Deployment**

### **Direct HTML File (Recommended)**

**Simplest Setup**:
```bash
# 1. Clone repository
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter

# 2. Open main file
open youtube_video_exporter.html
# OR double-click in file explorer

# 3. Enter API key when prompted
# Key stored locally in browser
```

**API Key Configuration**:
```javascript
// Option 1: Manual input (simplest)
// Just enter key in the UI when prompted

// Option 2: Environment variable detection
function getLocalApiKey() {
    // Check if running via test-server.js with env var
    if (window.YOUTUBE_API_KEY) {
        return window.YOUTUBE_API_KEY;
    }
    
    // Check localStorage for previous session
    const savedKey = localStorage.getItem('youtube_api_key');
    if (savedKey) {
        return savedKey;
    }
    
    // Prompt user for key
    return null;
}
```

### **Local Test Server (Optional)**

For testing server-like behavior locally:

```javascript
// test-server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static('.'));

// Inject environment variables into HTML
app.get('/', (req, res) => {
    let html = require('fs').readFileSync('youtube_video_exporter.html', 'utf8');
    
    // Inject API key if available
    if (process.env.YOUTUBE_API_KEY) {
        html = html.replace(
            '<script>',
            `<script>
                window.YOUTUBE_API_KEY = "${process.env.YOUTUBE_API_KEY}";
            `
        );
    }
    
    res.send(html);
});

app.listen(port, () => {
    console.log(`🚀 Local server: http://localhost:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Key: ${process.env.YOUTUBE_API_KEY ? 'Loaded' : 'Not set'}`);
});
```

**Usage**:
```bash
# With API key
YOUTUBE_API_KEY="your_api_key_here" node test-server.js

# Without API key (manual input)
node test-server.js

# Then visit: http://localhost:3000
```

---

## 🔧 **Contributor Development Setup**

### **Quick Setup for New Contributors**

```bash
# 1. Fork repository on GitHub
# 2. Clone your fork
git clone https://github.com/yourusername/youtube-exporter.git
cd youtube-exporter

# 3. Create feature branch
git checkout -b feature/your-feature-name

# 4. Start coding
open youtube_video_exporter.html

# 5. Test changes
# Just refresh browser after edits

# 6. Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# 7. Create pull request
```

### **Development Environment Configuration**

**VS Code Settings** (`.vscode/settings.json`):
```json
{
    "html.format.indentInnerHtml": true,
    "html.format.wrapLineLength": 80,
    "javascript.preferences.quoteStyle": "single",
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "files.associations": {
        "*.html": "html"
    },
    "html.validate.scripts": true,
    "html.validate.styles": true
}
```

**Live Server Extension** (optional):
```json
{
    "liveServer.settings.port": 3000,
    "liveServer.settings.root": "/",
    "liveServer.settings.open": "/youtube_video_exporter.html"
}
```

---

## 🔐 **Production Deployment Considerations**

### **Security Configuration**

**Content Security Policy** (for custom domains):
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://www.googleapis.com https://accounts.google.com;
    img-src 'self' data: https://i.ytimg.com;
    font-src 'self' https://fonts.gstatic.com;
">
```

**HTTPS Enforcement**:
```javascript
// Redirect HTTP to HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

### **Performance Optimization**

**Resource Loading**:
```html
<!-- Preload critical resources -->
<link rel="preconnect" href="https://www.googleapis.com">
<link rel="preconnect" href="https://accounts.google.com">
<link rel="dns-prefetch" href="https://i.ytimg.com">

<!-- Load non-critical resources asynchronously -->
<script src="https://cdn.jsdelivr.net/npm/chart.js" async></script>
```

**Caching Strategy**:
```javascript
// Cache API responses for better performance
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

function getCachedApiResponse(url) {
    const cached = localStorage.getItem(`cache_${btoa(url)}`);
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION) {
            return data.response;
        }
    }
    return null;
}
```

---

## 📊 **Deployment Monitoring**

### **GitHub Pages Monitoring**

**Deployment Status**:
```yaml
# Monitor deployment success
- name: Check Deployment
  run: |
    curl -f https://ronbronstein.github.io/youtube-exporter/ || exit 1
    echo "✅ Deployment successful"
```

**Performance Monitoring**:
```javascript
// Simple performance tracking
function trackPageLoad() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Optional: Send to analytics (with user consent)
        if (CONFIG.ANALYTICS_ENABLED && userConsent) {
            trackEvent('page_load_time', loadTime);
        }
    });
}
```

### **Error Monitoring**

```javascript
// Global error handler
window.addEventListener('error', (event) => {
    const error = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.error('🚨 Global error:', error);
    
    // Store locally for debugging
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(error);
    errors.slice(-10); // Keep last 10 errors
    localStorage.setItem('app_errors', JSON.stringify(errors));
});
```

---

## 🔄 **Continuous Deployment Pipeline**

### **Automated Testing Before Deployment**

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: HTML Validation
      run: |
        npm install -g html-validate
        html-validate youtube_video_exporter.html
        
    - name: JavaScript Lint
      run: |
        npm install -g jshint
        jshint youtube_video_exporter.html --extract=auto
        
    - name: Security Scan
      run: |
        # Check for hardcoded secrets
        grep -n "AIza[0-9A-Za-z-_]{35}" . && exit 1 || echo "✅ No hardcoded API keys"
        
    - name: Link Check
      run: |
        npm install -g broken-link-checker
        blc http://localhost:3000 --recursive --follow
```

### **Deployment Rollback Strategy**

```bash
# Automatic rollback on deployment failure
if deployment_failed; then
    echo "🚨 Deployment failed, rolling back..."
    git revert HEAD --no-edit
    git push origin main
    echo "✅ Rolled back to previous version"
fi
```

---

## 🌍 **Custom Domain Deployment**

### **Custom Domain Setup**

**DNS Configuration**:
```
# DNS Records for custom domain
TYPE    NAME                           VALUE
CNAME   youtube-tool.ronbronstein.com  ronbronstein.github.io
TXT     _github-pages-challenge-...    verification-code
```

**GitHub Repository Settings**:
1. Settings → Pages → Custom domain: `youtube-tool.ronbronstein.com`
2. Enforce HTTPS: ✅ Enabled
3. Wait for DNS propagation (up to 24 hours)

**Domain Verification in Code**:
```javascript
function validateCustomDomain() {
    const allowedDomains = [
        'ronbronstein.github.io',
        'youtube-tool.ronbronstein.com',
        'localhost'
    ];
    
    if (!allowedDomains.includes(window.location.hostname)) {
        showError('This application is not authorized for this domain.');
        return false;
    }
    
    return true;
}
```

---

## 📚 **Deployment Troubleshooting**

### **Common Issues & Solutions**

**1. GitHub Pages Not Updating**
```bash
# Force rebuild
git commit --allow-empty -m "Force rebuild"
git push origin main
```

**2. HTTPS Certificate Issues**
- Wait 24 hours for DNS propagation
- Check GitHub Pages settings
- Verify CNAME record is correct

**3. API Key Not Working on GitHub Pages**
- Check HTTP referrer restrictions
- Ensure domain is whitelisted in Google Cloud Console
- Verify HTTPS is being used

**4. Local Development Issues**
```javascript
// Debug environment detection
console.log('Environment:', detectEnvironment());
console.log('Location:', window.location);
console.log('API Key Available:', !!getApiKey());
```

### **Debug Information Panel**

```javascript
function showDebugInfo() {
    const debugInfo = {
        environment: detectEnvironment(),
        location: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        apiKeyPresent: !!getApiKey(),
        localStorage: Object.keys(localStorage),
        errors: JSON.parse(localStorage.getItem('app_errors') || '[]')
    };
    
    console.table(debugInfo);
    
    // Show in UI for easy copying
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; padding: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; max-height: 80vh; overflow-y: auto;">
                <h3>🔍 Debug Information</h3>
                <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
                <button onclick="this.closest('div').remove()">Close</button>
                <button onclick="navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))">Copy to Clipboard</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Add debug hotkey (Ctrl+Shift+D)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        showDebugInfo();
    }
});
```

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] No API keys in source code
- [ ] Documentation updated
- [ ] Performance tested

### **GitHub Pages Deployment**
- [ ] GitHub Actions workflow configured
- [ ] Repository settings configured
- [ ] Custom domain DNS configured (if applicable)
- [ ] HTTPS enforced
- [ ] Environment detection working

### **Post-Deployment**
- [ ] Site loads correctly
- [ ] API functionality works
- [ ] Authentication flow works (if applicable)
- [ ] Mobile responsiveness verified
- [ ] Error monitoring active

---

*Deployment should be boring. If it's exciting, something went wrong.* 🚀 