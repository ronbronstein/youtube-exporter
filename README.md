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
- **Fetch ALL channel videos** (not just recent ones)
- **Smart pagination** handles channels with 1000+ videos
- **Real-time progress tracking** with quota management
- **Batch processing** for optimal API efficiency

### 📊 **Advanced Content Insights** 
- **Viral content detection** (3x+ average performance)
- **Title pattern analysis** from top 20% performing videos
- **Upload schedule optimization** (best days/times)
- **Success word extraction** from high-performing titles
- **Engagement rate calculations** and trending analysis

### 🎨 **Authentic Windows XP Design**
- **Classic 3D borders** and button styling
- **Tahoma fonts** and original XP color scheme
- **Inset/outset visual effects** with proper hover states
- **Nostalgic scrollbars** and dialog box styling
- **Modern usability** with comfortable spacing and sizing

### 📱 **Dual View Modes**
- **📋 List View**: Sortable table with detailed metrics
- **🎬 Grid View**: Visual cards with thumbnails
- **Real-time filtering** by title/channel name
- **Smart number formatting** (1.2M, 1.2K, etc.)

### 📥 **Export Capabilities**
- **CSV Export**: Complete dataset with all metrics
- **Title Export**: Clean text file of video titles
- **Professional formatting** ready for spreadsheet analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- YouTube Data API v3 key

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
2. **Set filters**: Keywords, sort order, video scope
3. **Choose scope**: Recent videos (fast) or ALL videos (comprehensive)
4. **Click Analyze**: Get detailed insights and metrics
5. **Export data**: Download CSV or text files

## 🛠️ Technical Architecture

### Single-File Design Philosophy
- **`youtube_video_exporter.html`**: Complete frontend (HTML + CSS + JS)
- **`server.js`**: Minimal Express server for API key management
- **No frameworks**: Pure vanilla JavaScript for maximum compatibility
- **Local storage**: All data stays in your browser

### API Optimization
```javascript
// Smart quota management
const quotaCosts = {
    search: 100,      // Per search request
    videoDetails: 1   // Per video batch (50 videos)
};

// Batch processing for efficiency
const batchSize = 50; // YouTube API limit
const videoIds = items.slice(0, 50).map(item => item.id.videoId).join(',');
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
- **Upload Patterns**: Discover optimal posting schedule
- **Title Analysis**: Extract successful title patterns
- **Performance Tiers**: Identify viral vs normal content
- **Engagement Tracking**: Monitor audience connection trends

### Data Processing Pipeline
```javascript
// Multi-stage analysis
1. Channel ID Resolution  → Handle @username, URLs, IDs
2. Video Discovery       → Paginated search with filters  
3. Batch Details Fetch   → Efficient API quota usage
4. Advanced Analytics    → Pattern recognition & insights
5. Export Generation     → CSV/TXT with full metadata
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

- **YouTube Data API v3** for providing comprehensive channel data
- **Windows XP Design Team** for the timeless aesthetic inspiration
- **Open Source Community** for continuous feedback and improvements

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/youtube-research-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/youtube-research-hub/discussions)
- **Creator**: Made with ❤️ by [Ron Bronstein](https://github.com/your-username)

---

**⭐ Star this repo if you found it useful!** 

*Transform your YouTube content strategy with the power of nostalgia and modern analytics.* 