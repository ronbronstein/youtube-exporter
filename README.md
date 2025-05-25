# 📺 YouTube Research Hub

> **Retro Windows XP meets cutting-edge YouTube analytics** 

A comprehensive YouTube channel analysis tool that combines nostalgic Windows XP aesthetics with powerful modern analytics. Built with modern ES6 modules and professional deployment pipeline.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/vite-latest-646CFF.svg)

## 🌐 **Live Demo**

**🚀 [Try it now](https://ronbronstein.github.io/youtube-exporter/)** - No installation required!

*Just bring your own YouTube API key (free setup in 2 minutes)*

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit **[https://ronbronstein.github.io/youtube-exporter/](https://ronbronstein.github.io/youtube-exporter/)** - no setup required!

### Option 2: Run Locally

#### Prerequisites
- **Git** (to clone the repository)
- **Web browser** (Chrome, Firefox, Safari, Edge)
- **Local web server** (Python, Node.js, or VS Code Live Server)

#### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
```

2. **Start a Local Web Server**

**Option A: Python (if you have Python installed)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js (if you have Node.js installed)**
```bash
npx http-server -p 8000
```

**Option C: VS Code Live Server**
1. Open the project in VS Code
2. Install "Live Server" extension
3. Right-click on `src/index.html` → "Open with Live Server"

3. **Open in Browser**
Navigate to: `http://localhost:8000/src/`

## 🔑 YouTube API Key Setup

### Get Your Free API Key (2 minutes)

1. **Go to Google Cloud Console**
   - Visit: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   - Sign in with your Google account

2. **Create a Project** (if you don't have one)
   - Click "Create Project"
   - Name it "YouTube Exporter" 
   - Click "Create"

3. **Enable YouTube Data API v3**
   - Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
   - Click "Create Credentials" → "API Key"
   - Copy your API key (starts with `AIza...`)

5. **Secure Your API Key** (Optional but Recommended)
   - Click on your API key to edit it
   - Under "Application restrictions" → select "HTTP referrers"
   - Add your domain: `localhost:8000` and your production domain
   - Under "API restrictions" → select "YouTube Data API v3"
   - Save

### Use Your API Key

**For Online Use:**
- Paste your API key in the tool
- Click "Validate & Use"
- Your key is stored locally in your browser only

**For Local Development:**
- Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- Edit `.env` and add your API key:
```bash
YOUTUBE_API_KEY=your_api_key_here
```

## 🧑‍💻 Local Development Setup

*For developers who want to test locally before pushing to GitHub Pages*

### Prerequisites
- **Node.js 18.0.0+** (for Vite development server)
- **npm** (comes with Node.js)
- **Git** (for version control)

### Development Workflow

1. **Clone and Install**
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
npm install
```

2. **Set Up Environment Variables**
```bash
# Create local environment file
cp .env.example .env

# Edit .env and add your API key:
# VITE_DEMO_API_KEY=your_demo_api_key_here
# OR
# VITE_YOUTUBE_API_KEY=your_personal_api_key_here
```

3. **Start Development Server**
```bash
npm run dev
```
*Opens at `http://localhost:5173` with hot reload*

4. **Test Your Changes**
- Make your changes
- Test locally with demo API key
- Verify all functionality works

5. **Deploy to GitHub Pages**
```bash
# Build and test
npm run build
npm run preview

# Commit and push (triggers auto-deployment)
git add .
git commit -m "your changes"
git push origin main
```

### Environment Variables

The app checks for API keys in this order:
1. `VITE_DEMO_API_KEY` (same as GitHub Pages)
2. `VITE_YOUTUBE_API_KEY` (alternative name)
3. `YOUTUBE_API_KEY` (legacy support)

### Development vs Production

| Environment | API Key Source | Behavior |
|-------------|---------------|----------|
| **Local Development** | `.env` file | Full functionality for testing |
| **GitHub Pages** | GitHub Actions secrets | Production deployment |

### Build Commands

```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Troubleshooting Local Development

**"API key not found" in local development:**
1. Ensure `.env` file exists in project root
2. Check that your API key is correctly formatted
3. Restart the development server after adding `.env`

**Local and GitHub Pages behave differently:**
- Both should now behave identically
- If issues persist, check browser console for errors
- Verify API key is working in Google Cloud Console

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

## 🎯 Usage Modes

### Demo Mode
- **No API key required**
- **Limited to 100 videos** per channel
- **Perfect for testing**

### Live Mode  
- **Requires your API key**
- **Unlimited videos** (up to API limits)
- **Full functionality**

### Local Development Mode
- **API key from .env file**
- **Best for developers**
- **Automatic key loading**

## 🔒 Security & Privacy

### Your API Key is Safe
- **Local Storage Only**: Keys are stored in your browser's local storage
- **Never Transmitted**: Keys are not sent to any external servers
- **Client-Side Only**: All processing happens in your browser
- **No Backend**: This tool has no server component

### API Key Best Practices
1. **Restrict Your Key**: Use HTTP referrer restrictions in Google Cloud Console
2. **Monitor Usage**: Check your quota usage in Google Cloud Console
3. **Regenerate if Needed**: You can always create a new key if compromised

### Free Tier Limits
- **10,000 requests/day** (more than enough for most users)
- **100 requests per 100 seconds per user**
- **1 request per second per user**

## 🛠️ Troubleshooting

### Common Issues

**"API key not valid"**
- Check your API key is correct
- Ensure YouTube Data API v3 is enabled
- Verify API key restrictions aren't too strict

**"Videos not showing"**
- Check browser console for errors
- Try refreshing the page
- Switch between Demo and Live modes

**"Channel not found"**
- Try different channel formats:
  - `@channelhandle`
  - `https://youtube.com/@channelhandle`
  - `https://youtube.com/channel/UC...`
  - Channel ID directly

**Local server not working**
- Ensure you're accessing `http://localhost:8000/src/` (note the `/src/`)
- Try a different port: `python -m http.server 3000`
- Check if another service is using port 8000

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📁 Project Structure
```
youtube-exporter/
├── src/
│   ├── index.html          # Main application
│   ├── js/
│   │   ├── components/     # UI components
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── styles/
│       └── main.css        # Retro Windows XP styling
├── legacy/                 # Original single-file version
├── docs/                   # Documentation
├── .env.example            # Environment template
└── README.md
```

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

## 🤝 Contributing

Found a bug or want to contribute?
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use and modify!

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ronbronstein/youtube-exporter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ronbronstein/youtube-exporter/discussions)

---

**Happy analyzing! 🎉**