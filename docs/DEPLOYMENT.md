# 🚀 Deployment Guide

## TOC
- [Quick Setup](#quick-setup)
- [GitHub Pages Production](#github-pages-production)
- [Local Development](#local-development)
- [Build Commands](#build-commands)
- [Environment Config](#environment-config)

## Quick Setup

### Clone & Start Development
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
npm install
npm run dev                 # → http://localhost:5173
```

### Deploy to Production  
```bash
git add .
git commit -m "Deploy updates"
git push origin main        # → Auto-deploys via GitHub Actions
```

**Live URL**: `https://ronbronstein.github.io/youtube-exporter/`

## GitHub Pages Production

### Deployment Process
| Step | Action | Result |
|------|--------|--------|
| **Push** | `git push origin main` | Triggers GitHub Actions |
| **Build** | Vite production build | 104KB optimized bundle |
| **Deploy** | GitHub Pages deployment | Live site updated |
| **Time** | ~2-3 minutes | Complete deployment |

### GitHub Actions
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to main branch
- **Node**: v18, npm ci, Vite build  
- **Deploy**: Automatic to GitHub Pages
- **Features**: Cache, artifact upload, HTTPS

### Production Features
```javascript
// vite.config.js - Production settings
export default defineConfig({
    base: '/youtube-exporter/',     // GitHub Pages path
    build: {
        outDir: 'dist',
        minify: false,              // Readable production code
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    }
});
```

## Local Development

### Development Server
```bash
npm run dev                 # Start dev server (port 5173)
# Features: Hot reload, source maps, ES6 modules
```

### Environment Setup
Create `.env` file in project root:
```bash
# YouTube API Key (required for local development)
VITE_YOUTUBE_API_KEY=your_api_key_here
VITE_DEMO_API_KEY=demo_key_here
```

### API Key Sources
| Environment | Source | Fallback |
|-------------|--------|----------|
| **Local** | `.env` file | User input required |
| **GitHub Pages** | GitHub Secrets | Demo mode (built-in) |

## Build Commands

### Core Commands
```bash
npm run dev                 # Development server
npm run build               # Production build  
npm run preview             # Preview production build
```

### Build Analysis
```bash
npm run build               # Creates dist/ folder
ls -la dist/               # Check build output
```

### Production Validation
```bash
npm run build               # Build for production
npm run preview             # Test production build locally
# → http://localhost:4173
```

## Environment Config

### Development vs Production
| Environment | API Key | Limits | Build |
|-------------|---------|---------|-------|
| **Local Development** | `.env` file | None | Hot reload |
| **GitHub Pages Demo** | GitHub Secrets | 100 videos | Optimized |
| **GitHub Pages Live** | User input | None | Optimized |

### Directory Structure (Production)
```
dist/                       # Production build output
├── index.html             # App shell
├── assets/
│   ├── index-[hash].js   # Main bundle (~90KB)
│   ├── vendor-[hash].js  # Chart.js (~14KB)
│   └── index-[hash].css  # Styles (~8KB)
└── Total: ~104KB optimized
```

### GitHub Pages Settings
1. **Repository** → Settings → Pages
2. **Source**: GitHub Actions
3. **Custom Domain**: Optional
4. **HTTPS**: Auto-enabled

### Environment Variables (GitHub Secrets)
| Secret Name | Purpose | Usage |
|-------------|---------|-------|
| `VITE_DEMO_API_KEY` | Demo mode API | Injected during build |

### Troubleshooting

#### Local Development Issues
```bash
# API Key not found
echo "VITE_YOUTUBE_API_KEY=your_key" > .env

# Port already in use
npm run dev -- --port 5174

# Dependencies out of sync
rm -rf node_modules package-lock.json
npm install
```

#### Production Issues
```bash
# Check build logs
# GitHub → Actions → Latest workflow run

# Test production build locally
npm run build && npm run preview

# Clear browser cache
# Hard refresh (Ctrl+F5 / Cmd+Shift+R)
```

### Performance Metrics
| Metric | Value | Goal |
|--------|--------|------|
| **Build Time** | ~30 seconds | Fast builds |
| **Bundle Size** | 104KB | Lightweight |
| **Deploy Time** | 2-3 minutes | Quick deployments |
| **Hot Reload** | <100ms | Instant feedback |

---

*Optimized for speed, simplicity, and reliable deployments.* 