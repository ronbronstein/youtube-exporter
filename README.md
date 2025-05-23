# 📺 YouTube Channel Research Hub

> **Retro Windows XP meets cutting-edge YouTube analytics** 

A comprehensive YouTube channel analysis tool that combines nostalgic Windows XP aesthetics with powerful modern analytics. Get deep insights into any YouTube channel's content strategy, upload patterns, and viral content detection.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## 🌐 **Try It Online**

**🚀 [Live Web Version](https://ronbronstein.github.io/youtube-exporter/)** - No installation required!

*Just bring your own YouTube API key (free setup in 2 minutes)*

## ✨ Features

### 🔍 **Comprehensive Channel Analysis**
- **Complete video inventory** from any public YouTube channel
- **Smart pagination** handles channels with thousands of videos efficiently
- **Real-time progress tracking** with intelligent quota management
- **Batch processing** for optimal API performance

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

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- YouTube Data API v3 key (free from Google Cloud Console)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/youtube-research-hub.git
cd youtube-research-hub

# Install dependencies
npm install

# Create environment file
cp .env.template .env

# Add your YouTube API key to .env
YOUTUBE_API_KEY=your_api_key_here

# Start the server
npm start
```

🌐 **Open http://localhost:3000 and start analyzing!**

## 📖 Usage Guide

### Getting a YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **YouTube Data API v3**
4. Create credentials (API Key)
5. Add to your `.env` file

### Analyzing a Channel
1. **Enter channel info**: URL, handle (@channel), or channel ID
2. **Set filters**: Keywords with AND/OR logic for topic discovery
3. **Choose sort order**: Upload date, view count, or engagement
4. **Click Analyze**: Get comprehensive insights and metrics
5. **Export data**: Download CSV, text, or markdown files

## 🛠️ Technical Architecture

### Single-File Design Philosophy
- **`youtube_video_exporter.html`**: Complete frontend application (HTML + CSS + JS)
- **`server.js`**: Minimal Express server for secure API key management
- **No framework dependencies**: Pure vanilla JavaScript for maximum compatibility
- **Local storage**: All user data stays in browser for privacy

### API Optimization
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

### Windows XP Styling System
```css
/* Authentic 3D borders */
border: 2px outset var(--xp-button-face);  /* Raised */
border: 2px inset var(--xp-button-face);   /* Pressed */

/* Classic color palette */
--xp-blue-start: #0078d4;    /* Windows XP blue */
--xp-gray: #ece9d8;          /* Classic gray background */
--xp-button-face: #ece9d8;   /* Button face color */
```

## 📊 Advanced Analytics Features

### Content Strategy Insights
- **Upload Patterns**: Discover optimal posting schedule from historical data
- **Title Analysis**: Extract successful title patterns and keywords from top performers
- **Performance Tiers**: Automatically identify viral vs. normal content thresholds
- **Engagement Tracking**: Monitor audience connection trends and patterns

### Data Processing Pipeline
```javascript
// Multi-stage comprehensive analysis
1. Channel ID Resolution  → Handle @username, URLs, direct IDs
2. Video Discovery       → Complete uploads playlist enumeration  
3. Batch Details Fetch   → Efficient API quota usage (50 videos/call)
4. Advanced Analytics    → Pattern recognition & viral content detection
5. Export Generation     → CSV/TXT/Markdown with full metadata
```

## 🤝 Contributing

We love contributions! Here's how to get started:

### Development Setup
```bash
# Fork and clone the repo
git clone https://github.com/your-username/youtube-research-hub.git

# Install dependencies
npm install

# Start development server
npm run dev

# Make your changes and test thoroughly
# Submit a pull request with clear description
```

### Contribution Guidelines
- **Follow the Windows XP aesthetic** - maintain the retro design philosophy
- **Keep it simple** - preserve the single-file frontend approach  
- **Test thoroughly** - verify with multiple channel types and sizes
- **Document changes** - update README and add code comments
- **Respect API limits** - optimize for YouTube quota efficiency

## 📜 License

**MIT License** - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **YouTube Data API v3** for providing comprehensive channel data access
- **Windows XP Design Team** for the timeless aesthetic inspiration
- **Open Source Community** for continuous feedback and improvements

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/youtube-research-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/youtube-research-hub/discussions)
- **Creator**: Made with ❤️ by [Ron Bronstein](https://github.com/your-username)

---

**⭐ Star this repo if you found it useful!** 

*Transform your YouTube content strategy with the power of nostalgia and modern analytics.* 