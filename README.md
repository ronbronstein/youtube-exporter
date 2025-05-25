# 📺 YouTube Research Hub

> **Retro Windows XP meets cutting-edge YouTube analytics** 

A comprehensive YouTube channel analysis tool that combines nostalgic Windows XP aesthetics with powerful modern analytics. Built with modern ES6 modules and professional deployment pipeline.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/vite-latest-646CFF.svg)

## 🌐 **Live Demo**

**🚀 [Try it now](https://ronbronstein.github.io/youtube-exporter/)** - No installation required!

*Just bring your own YouTube API key (free setup in 2 minutes)*

## ✨ Features

### 🔍 **Comprehensive Channel Analysis**
- **Complete video inventory** from any public YouTube channel
- **Smart pagination** handles channels with thousands of videos efficiently
- **Real-time progress tracking** with intelligent quota management
- **15 modular ES6 components** for maintainable architecture

### 📊 **Advanced Content Insights** 
- **Viral content detection** (identifies videos performing 3x+ above average)
- **Title pattern analysis** extracts successful patterns from top performers
- **Upload schedule optimization** reveals best posting days and times
- **Success word extraction** from high-performing video titles
- **Engagement rate calculations** and performance trending

### 🎨 **Authentic Windows XP Design**
- **Classic 3D borders** and authentic button styling
- **Tahoma fonts** and original XP color scheme
- **Inset/outset visual effects** with proper hover states
- **Nostalgic scrollbars** and dialog box styling
- **Modern usability** with comfortable spacing and responsive design

### 📱 **Dual View Modes**
- **📋 List View**: Sortable table with detailed metrics and engagement rates
- **🎬 Grid View**: Visual cards with thumbnails and key statistics
- **Real-time filtering** by title, channel name, or description content
- **Smart number formatting** (1.2M, 1.2K, etc.) for easy readability

### 📥 **Export Capabilities**
- **CSV Export**: Complete dataset with all metrics for spreadsheet analysis
- **Title Export**: Clean text file of video titles for content planning
- **Markdown Export**: LLM-ready format optimized for AI analysis workflows

## 🚀 Quick Start (For Your Own Use)

1. **Clone this repository**
2. **Get a YouTube API key** from [Google Cloud Console](https://console.cloud.google.com/)
3. **Create `.env` file**:
   ```bash
   # Your personal YouTube API key
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
4. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```

That's it! You'll have the full app running locally with your own API key.

## 🌐 Live Demo Versions

I also host two versions on GitHub Pages to showcase the app:

- **[Demo Mode](https://ronbronstein.github.io/youtube-exporter/?mode=demo)** - Try it instantly with built-in API key (limited to 100 videos)
- **[Live Mode](https://ronbronstein.github.io/youtube-exporter/?mode=live)** - Full functionality, bring your own API key

These versions include a mode selector UI that you don't need for your own deployment.

## 📁 What You Get vs What I Host

**Your cloned version:**
- Clean, simple app
- Uses your API key from `.env`
- No mode switching complexity
- Full functionality

**My GitHub Pages versions:**
- Demo mode with my API key (for showcasing)
- Live mode for users to test with their keys
- Mode selector UI for switching between them

The code is identical - I just add environment detection and mode switching for the hosted versions.

## 📖 Usage Guide

### Getting a YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **YouTube Data API v3**
4. Create credentials (API Key)
5. **🔒 Critical**: Restrict your key:
   - **HTTP referrers**: `ronbronstein.github.io/*`, `localhost/*`
   - **API restrictions**: YouTube Data API v3 only
6. Enter your key in the app when prompted

### Analyzing a Channel
1. **Enter channel info**: URL, handle (@channel), or channel ID
2. **Set filters**: Keywords with AND/OR logic for topic discovery
3. **Choose sort order**: Upload date, view count, or engagement
4. **Click Analyze**: Get comprehensive insights and metrics
5. **Export data**: Download CSV, text, or markdown files

## 🛠️ Modern Architecture

### **ES6 Modular Design**
```
src/
├── js/
│   ├── components/     # UI components (App, VideoTable, etc.)
│   ├── services/       # API services (YouTube, analytics)
│   ├── utils/          # Utilities (formatting, storage, etc.)
│   └── main.js         # Application entry point
├── css/
│   └── styles.css      # Windows XP styling system
└── index.html          # Application shell
```

### **Build System**
- **⚡ Vite**: Modern build tool with hot reload
- **📦 ES6 Modules**: Clean, maintainable code organization
- **🔧 Production Build**: 104KB optimized bundle
- **🚀 GitHub Pages**: Automated CI/CD deployment

### **API Optimization**
```javascript
// Smart quota management
const quotaCosts = {
    channel: 1,           // Per channel lookup
    playlistItems: 1,     // Per 50 videos from playlist
    videoDetails: 1       // Per 50 detailed video records
};

// Efficient batch processing
const batchSize = 50; // YouTube API limit
// Handles large channels (1000+ videos) efficiently
```

### **Windows XP Styling System**
```css
/* Authentic 3D borders */
border: 2px outset var(--xp-button-face);  /* Raised */
border: 2px inset var(--xp-button-face);   /* Pressed */

/* Classic color palette */
--xp-blue-start: #0078d4;    /* Windows XP blue */
--xp-gray: #ece9d8;          /* Classic gray background */
--xp-button-face: #ece9d8;   /* Button face color */
```

## 📊 Development Commands

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

# Deploy to GitHub Pages
git push origin main  # Automatic deployment
```

## 🔐 Security & Privacy

### **"Bring Your Own API Key" Philosophy**
- **No shared keys** - you control your own quotas and costs
- **No server storage** - your API key stays in your browser
- **Zero abuse potential** - self-managed usage only
- **Client-side encryption** - keys encrypted before localStorage

### **The Only Security Concern: API Key Protection**
1. **Restrict domains** - key only works on approved websites
2. **Restrict APIs** - limit to YouTube Data API v3 only
3. **Monitor usage** - set quota alerts in Google Cloud Console
4. **Rotate regularly** - change keys every few months

## 🤝 Contributing

### **Development Setup**
```bash
# Fork and clone
git clone https://github.com/your-username/youtube-exporter.git
cd youtube-exporter

# Install dependencies
npm install

# Start development
npm run dev

# Make changes, test, and submit PR
```

### **Project Structure**
- **`src/js/components/`** - React-like UI components
- **`src/js/services/`** - API and business logic
- **`src/js/utils/`** - Helper functions and utilities
- **`docs/`** - Comprehensive documentation system
- **`vite.config.js`** - Build configuration

### **Contribution Guidelines**
- **Maintain XP aesthetic** - preserve the retro design philosophy
- **Use ES6 modules** - keep the modular architecture clean
- **Add tests** - verify functionality works as expected
- **Update docs** - keep documentation current
- **Optimize performance** - respect API quotas and bundle size

## 📚 Documentation

### **For Users**
- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** - Complete usage instructions
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### **For Developers**
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture details
- **[API_REFERENCE.md](./docs/API_REFERENCE.md)** - Component and service documentation
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Detailed contribution guide

### **For Deployment**
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - GitHub Pages deployment guide
- **[API_SECURITY.md](./docs/API_SECURITY.md)** - API key security best practices

## 🚀 Deployment

### **Automatic GitHub Pages**
Every push to `main` automatically deploys via GitHub Actions:

1. **Build** with Vite (ES6 → optimized bundle)
2. **Test** bundle integrity and performance
3. **Deploy** to GitHub Pages with custom domain support
4. **Verify** deployment health

Live at: https://ronbronstein.github.io/youtube-exporter/

### **Local Preview**
```bash
npm run build    # Build production bundle
npm run preview  # Test locally at localhost:4173
```

## 📈 Performance

- **⚡ Load Time**: < 3 seconds on 3G connection
- **📦 Bundle Size**: 104KB optimized (gzipped)
- **🏃 Runtime**: 60fps smooth scrolling and interactions
- **💾 Memory**: Efficient garbage collection and memory management

## 📜 License

**MIT License** - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **YouTube Data API v3** for comprehensive channel data access
- **Windows XP Design Team** for timeless aesthetic inspiration
- **Vite Community** for modern build tooling
- **Open Source Community** for continuous feedback and improvements

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/ronbronstein/youtube-exporter/issues)
- **Documentation**: [Complete docs](./docs/)
- **Creator**: Made with ❤️ by [Ron Bronstein](https://github.com/ronbronstein)

---

**⭐ Star this repo if it helps your YouTube strategy!** 

*Modern architecture meets nostalgic design for powerful content insights.* 🚀✨

## 🎭 Demo Mode Setup

To enable demo mode with your own API key:

1. **Create a `.env` file** in the project root:
```bash
# .env
VITE_DEMO_API_KEY=your_actual_youtube_api_key_here
```

2. **Get a YouTube API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Copy the key to your `.env` file

3. **Demo Mode Features**:
   - ✅ Uses your private API key (not exposed to users)
   - ✅ Limited to 100 most recent videos per channel
   - ✅ Cost-controlled (2 API calls max per analysis)
   - ✅ Perfect for showcasing the app functionality

4. **Security**: The `.env` file is gitignored and never committed to version control.

## 🌐 Live Mode

Users provide their own YouTube API key for full functionality:
- ✅ Unlimited video analysis
- ✅ Complete channel history
- ✅ Uses user's own API quota