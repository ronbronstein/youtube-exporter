# 🚀 Deployment Guide - YouTube Research Hub

## 🎯 **Modern Deployment Architecture**

YouTube Research Hub uses a modern ES6 modular architecture with automated GitHub Pages deployment:

```
🌐 DEPLOYMENT ECOSYSTEM
├─ 🚀 GitHub Pages (Production)
│   ├─ Automated CI/CD with GitHub Actions
│   ├─ Vite production build (104KB optimized)
│   ├─ Zero server costs + global CDN
│   └─ Automatic HTTPS + custom domain support
│
├─ 💻 Local Development
│   ├─ Vite dev server (hot reload)
│   ├─ ES6 modules + modern tooling
│   ├─ Environment variable support
│   └─ Comprehensive testing suite
│
└─ 🔧 Production Testing
    ├─ Vite preview server
    ├─ Production build verification
    └─ Performance validation
```

---

## 🌐 **GitHub Pages Deployment (Production)**

### **Automated Deployment Process**

**🎯 One-Command Deployment**:
```bash
# Build and deploy to GitHub Pages
git add .
git commit -m "Deploy latest changes"
git push origin main
# → Automatic deployment via GitHub Actions
```

**Live URL**: `https://ronbronstein.github.io/YoutubeExporter/`

### **GitHub Actions Workflow**

Our `.github/workflows/deploy.yml` handles everything automatically:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      pages: write
      id-token: write
      
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build with Vite
      run: npm run build
      
    - name: Setup Pages
      uses: actions/configure-pages@v3
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: './dist'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2
```

### **Production Build Features**

**Vite Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  base: '/YoutubeExporter/',  // GitHub Pages path
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,           // Readable production code
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
```

**Build Output**:
- **Total Size**: 104KB (optimized)
- **15 ES6 Modules**: Organized architecture
- **Asset Hashing**: Cache-busting for updates
- **Production Paths**: Correctly configured for GitHub Pages

---

## 💻 **Local Development**

### **Quick Development Setup**

```bash
# 1. Clone repository
git clone https://github.com/ronbronstein/YoutubeExporter.git
cd YoutubeExporter

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# → Opens http://localhost:5173
```

**Development Features**:
- ⚡ **Vite Hot Reload**: Instant updates on save
- 🎯 **ES6 Modules**: Modern development experience  
- 🔍 **Source Maps**: Easy debugging
- 🧪 **Integrated Testing**: `npm run test`

### **Development Commands**

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Performance analysis
npm run performance

# Bundle size check
npm run bundle-size
```

---

## 🔧 **Local Testing & Validation**

### **Production Build Testing**

**Step 1: Build Locally**
```bash
npm run build
```

**Step 2: Preview Production**
```bash
npm run preview
# → http://localhost:4173
```

**Step 3: Validate Build**
```bash
# Check bundle size
npm run bundle-size

# Performance test
npm run performance

# Security audit
npm run security-audit
```

### **Testing Checklist**

**Core Functionality**:
- [ ] Application loads correctly
- [ ] API key entry working
- [ ] YouTube data fetching functional
- [ ] Charts rendering properly
- [ ] Windows XP styling preserved
- [ ] Export functionality working

**Performance**:
- [ ] Load time < 3 seconds
- [ ] Bundle size < 200KB
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔐 **Production Configuration**

### **Environment Detection**

Our app automatically detects the environment:

```javascript
// src/js/utils/environment.js
export function detectEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('github.io')) {
    return 'github-pages';
  } else if (hostname === 'localhost') {
    return 'development';
  } else {
    return 'production';
  }
}
```

### **API Security Configuration**

**GitHub Pages Setup**:
```javascript
// Automatic environment-specific configuration
if (environment === 'github-pages') {
  CONFIG.SECURITY = {
    REQUIRE_HTTPS: true,
    ALLOWED_DOMAINS: ['ronbronstein.github.io'],
    API_KEY_ENCRYPTION: true
  };
}
```

**API Key Restrictions** (Google Cloud Console):
```
Application restrictions:
✅ HTTP referrer (web sites)

Website restrictions:
• https://ronbronstein.github.io/YoutubeExporter/*
• http://localhost:*/* (for development)

API restrictions:
✅ YouTube Data API v3 (only)
```

---

## 📊 **Deployment Monitoring**

### **Automated Health Checks**

```yaml
# In GitHub Actions workflow
- name: Verify Deployment
  run: |
    sleep 30  # Wait for propagation
    curl -f https://ronbronstein.github.io/YoutubeExporter/ || exit 1
    echo "✅ Deployment verified"
```

### **Performance Monitoring**

```javascript
// Built-in performance tracking
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`📊 Load time: ${loadTime.toFixed(2)}ms`);
  
  // Track in localStorage for debugging
  const metrics = {
    loadTime,
    timestamp: Date.now(),
    environment: detectEnvironment()
  };
  localStorage.setItem('performance_metrics', JSON.stringify(metrics));
});
```

---

## 🌍 **Custom Domain (Optional)**

### **DNS Configuration**

```
# DNS Records for custom domain
TYPE    NAME                    VALUE
CNAME   youtube-hub.domain.com  ronbronstein.github.io
```

### **Repository Settings**

1. **GitHub Settings** → **Pages**:
   - Source: `GitHub Actions`
   - Custom domain: `youtube-hub.domain.com`
   - Enforce HTTPS: ✅

2. **Update Vite Config**:
```javascript
// vite.config.js
base: process.env.NODE_ENV === 'production' 
  ? (process.env.CUSTOM_DOMAIN ? '/' : '/YoutubeExporter/')
  : '/'
```

---

## 🔄 **Continuous Deployment**

### **Deployment Triggers**

**Automatic Deployment**:
- ✅ Push to `main` branch
- ✅ Merged pull requests
- ✅ Manual workflow dispatch

**Deployment Steps**:
1. **Checkout** code
2. **Install** dependencies  
3. **Build** with Vite
4. **Test** build output
5. **Deploy** to GitHub Pages
6. **Verify** deployment

### **Rollback Strategy**

```bash
# Quick rollback to previous commit
git revert HEAD --no-edit
git push origin main
# → Automatic deployment of previous version
```

---

## 🛠️ **Troubleshooting**

### **Common Deployment Issues**

**1. Build Failures**
```bash
# Check build locally
npm run build

# Common fixes
rm -rf node_modules dist
npm install
npm run build
```

**2. GitHub Pages Not Updating**
```bash
# Force rebuild
git commit --allow-empty -m "Force rebuild"
git push origin main
```

**3. API Key Issues on Production**
- Verify domain in Google Cloud Console
- Check HTTPS is enabled
- Confirm API restrictions

**4. Module Loading Errors**
- Check browser console for detailed errors
- Verify all imports are correctly resolved
- Test with `npm run preview` locally

### **Debug Mode**

Access debug information: `Ctrl+Shift+D`

```javascript
// Shows environment details, performance metrics, and errors
{
  "environment": "github-pages",
  "buildTime": "2024-12-24T10:30:00Z",
  "loadTime": "234ms",
  "modules": 15,
  "bundleSize": "104KB"
}
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works correctly
- [ ] All tests passing (`npm run test`)
- [ ] No console errors
- [ ] Bundle size under 200KB

### **Post-Deployment**
- [ ] Site loads at GitHub Pages URL
- [ ] API functionality working
- [ ] Charts and visualizations rendering
- [ ] Windows XP styling preserved
- [ ] Mobile responsiveness verified

### **Production Validation**
- [ ] Performance under 3s load time
- [ ] No JavaScript errors in console
- [ ] All features working as expected
- [ ] Analytics tracking functional (if enabled)

---

**🎯 The goal: Boring, reliable deployments that just work.** 

*Modern architecture → Simple deployment → Happy users* ✨ 