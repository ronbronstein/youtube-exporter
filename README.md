# 📺 YouTube Research Hub

> **Windows XP nostalgia meets modern YouTube analytics**

Comprehensive YouTube channel analysis tool with authentic Windows XP design and powerful ES6 modular architecture.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/vite-6.3.5-646CFF.svg)

## 🚀 Quick Start

### Try Online (Recommended)
**[Launch App →](https://ronbronstein.github.io/youtube-exporter/)**
- No installation required
- Demo mode available (100 videos limit)
- Bring your own API key for unlimited access

### Run Locally
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
npm install
npm run dev                 # → http://localhost:5173
```

## 🔑 YouTube API Key (2 minutes)

1. **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)** → Create Project
2. **[Enable YouTube Data API v3](https://console.cloud.google.com/apis/library)**
3. **Create Credentials** → API Key
4. **Copy key** (starts with `AIza...`)

**For local development**: Create `.env` file with `VITE_YOUTUBE_API_KEY=your_key`

## ✨ Features

### 🔍 Channel Analysis
- **Complete video inventory** from any public YouTube channel
- **Smart pagination** handles thousands of videos efficiently
- **Real-time progress** with quota management

### 📊 Content Insights
- **Viral content detection** (3x+ above average performance)
- **Title pattern analysis** from top performers  
- **Upload schedule optimization** 
- **Success word extraction** from high-performing titles

### 🎨 Windows XP Design
- **Authentic 3D borders** and classic button styling
- **Tahoma fonts** and original XP color scheme
- **Nostalgic scrollbars** with modern usability
- **Mobile responsive** XP experience

### 📱 Dual Views & Export
- **📋 List View**: Sortable table with detailed metrics
- **🎬 Grid View**: Visual cards with thumbnails
- **📥 Export**: CSV, titles, markdown (LLM-ready)
- **🔍 Real-time filtering** by title/description

## 🎯 Usage Modes

| Mode | API Key | Limits | Use Case |
|------|---------|--------|----------|
| **Demo** | None required | 100 videos | Quick testing |
| **Live** | Your API key | Unlimited* | Full analysis |
| **Local** | `.env` file | Unlimited* | Development |

*Subject to YouTube API quotas (10,000 requests/day free)

## 🛠️ Development

### Commands
```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Test production build
```

### Project Structure
```
src/js/
├── components/     # UI Components (7 ES6 classes)
├── services/       # YouTube API, Analytics
├── utils/          # Formatting, Storage
└── main.js         # Entry point

docs/               # Documentation
├── API_REFERENCE.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── CONTRIBUTING.md
```

## 🔒 Security & Privacy

- **Local Storage Only**: API keys never leave your browser
- **No Backend**: Client-side processing only
- **API Restrictions**: Use HTTP referrer limits in Google Cloud Console
- **Free Tier**: 10,000 requests/day (more than enough for most users)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"API key not valid"** | Check key format, enable YouTube Data API v3 |
| **"Channel not found"** | Try `@handle` or `youtube.com/@handle` format |
| **"Videos not showing"** | Check browser console, try different modes |
| **Local dev issues** | Ensure Node.js 18+, run `npm install` |

### Browser Support
✅ Chrome 80+ • Firefox 75+ • Safari 13+ • Edge 80+

## 📚 Documentation

- **[API Reference](docs/API_REFERENCE.md)** - Component APIs and methods
- **[Architecture](docs/ARCHITECTURE.md)** - System design and patterns  
- **[Deployment](docs/DEPLOYMENT.md)** - Build and deployment guide
- **[Contributing](docs/CONTRIBUTING.md)** - Development workflow
- **[Project Insights](docs/insights.md)** - Key discoveries and decisions

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow [coding standards](docs/CONTRIBUTING.md#code-standards)
4. Test: `npm run dev` and verify functionality
5. Submit pull request

See **[Contributing Guide](docs/CONTRIBUTING.md)** for detailed workflow.

## 📄 License

MIT License - free to use and modify!

## 🆘 Support

- **[GitHub Issues](https://github.com/ronbronstein/youtube-exporter/issues)** - Bug reports
- **[GitHub Discussions](https://github.com/ronbronstein/youtube-exporter/discussions)** - Questions
- **[Documentation](docs/)** - Comprehensive guides

---

*Modern ES6 architecture • Windows XP nostalgia • Production-ready*