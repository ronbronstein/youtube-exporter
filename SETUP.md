# 🚀 YouTube Exporter Setup Guide

## Quick Start (2 minutes)

### Option 1: Use Online (Recommended)
Visit **[https://ronbronstein.github.io/youtube-exporter/](https://ronbronstein.github.io/youtube-exporter/)** - no setup required!

### Option 2: Run Locally

## 📋 Prerequisites
- **Git** (to clone the repository)
- **Web browser** (Chrome, Firefox, Safari, Edge)
- **Local web server** (Python, Node.js, or VS Code Live Server)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
```

### 2. Start a Local Web Server

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

### 3. Open in Browser
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
- Create a `.env` file in the project root:
```bash
YOUTUBE_API_KEY=your_api_key_here
```

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
└── README.md
```

## 🎨 Features

### Analysis Features
- **Channel Overview**: Subscriber count, video count, total views
- **Video List**: Sortable table with views, likes, comments, duration
- **Keyword Filtering**: Search within titles and descriptions
- **Export Options**: CSV, Markdown, or text files

### UI Features
- **Retro Windows XP Theme**: Nostalgic and unique design
- **Responsive Design**: Works on desktop and mobile
- **List/Grid Views**: Toggle between table and card layouts
- **Real-time Search**: Filter results as you type

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