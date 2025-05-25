# 📺 YouTube Research Hub - User Guide

> **Complete guide to analyzing YouTube channels with retro Windows XP style**

## ⚠️ **Current Development Status**

**The tool is actively being improved!** Core functionality works (channel analysis, video fetching, keyword filtering), but some advanced features from the legacy version are being restored:

**✅ Currently Working:**
- Channel analysis and video fetching
- Keyword filtering (AND/OR logic)
- Basic video list display
- CSV/Markdown exports
- API key management

**🔄 Being Restored:**
- Comprehensive analysis panels (Content Analysis, Advanced Insights)
- Upload Frequency Timeline charts
- Enhanced grid view with emoji metrics
- Improved visual layout and styling

**📋 Planned Improvements:**
- Smart caching (fetch once, filter instantly)
- Two-column grid view
- Better mobile experience

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Your Free YouTube API Key

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create or select a project**
   - Click "Select a project" → "New Project" 
   - Name it anything (e.g., "YouTube Research")
3. **Enable the YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create API credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

### Step 2: Secure Your API Key (Important!)

**Click "Restrict Key" immediately after creation:**

#### Application Restrictions:
- **HTTP referrers (web sites)**
- Add these patterns:
  ```
  yourdomain.github.io/*
  localhost:3000/*
  127.0.0.1:3000/*
  ```

#### API Restrictions:
- **Restrict key to specific APIs**
- Select only: **YouTube Data API v3**

#### Quotas (Recommended):
- Set daily limit: **1,000-5,000 units**
- Monitor usage in Google Cloud Console

### Step 3: Start Analyzing!

1. **Paste your API key** in the tool
2. **Enter channel**: `@username`, full URL, or channel ID
3. **Add keywords** (optional): `tutorial, guide, crypto`
4. **Choose logic**: AND (all keywords) or OR (any keyword)
5. **Click "Analyze Channel"**

---

## 🔒 Security & Privacy

### What You Should Know

- **Your API key is stored locally** in your browser only
- **Keys are visible** in browser developer tools (not 100% secure)
- **API calls go directly** from your browser to YouTube
- **No data is sent to our servers** - everything stays local

### Best Practices

✅ **Do**: Restrict your key to specific domains only  
✅ **Do**: Set reasonable daily quotas (1,000-5,000 units)  
✅ **Do**: Regenerate your key monthly  
✅ **Do**: Monitor usage in Google Cloud Console  

❌ **Don't**: Share your API key publicly  
❌ **Don't**: Use the same key for multiple projects  
❌ **Don't**: Leave unrestricted keys active  

### Understanding API Costs

YouTube API uses a quota system (10,000 free units daily):
- **Channel lookup**: ~5 units
- **50 video details**: ~1 unit  
- **Analyzing 1,000 videos**: ~25 units total

*Most analyses cost 20-100 units, well within free limits.*

---

## 📊 Features Guide

### Channel Analysis

**Supported channel formats:**
```
@channelname          → @mrbeast
youtube.com/@channel  → youtube.com/@veritasium  
youtube.com/channel/  → youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
Channel ID directly   → UC_x5XG1OV2P6uZZ5FSM9Ttw
```

**What you get:**
- Complete video inventory from the channel
- Upload patterns and optimal timing analysis
- Viral content detection (videos performing 3x+ above average views)
- Title pattern analysis from top performing content
- Engagement metrics and trending insights

### Keyword Filtering

**Examples:**
```
tutorial, guide           → OR logic (either word)
AI AND security          → AND logic (both words)  
crypto, bitcoin, DeFi    → OR logic (any word)
tutorial AND (crypto OR bitcoin) → Complex logic
```

**Tips:**
- Use quotes for exact phrases: `"real world assets"`
- Keywords search both titles AND descriptions
- Case insensitive matching
- Punctuation ignored

### Export Options

**CSV Export**: Complete dataset with all metrics
- Title, channel, views, likes, comments
- Publication date, duration, engagement rate
- Full descriptions and URLs
- Ready for Excel/Google Sheets

**Markdown Export**: LLM-ready format  
- Structured data for AI analysis
- Channel summary statistics
- Individual video breakdowns
- Perfect for ChatGPT/Claude analysis

**Title Export**: Simple text list
- Just video titles, one per line
- Great for content inspiration
- Easy to copy/paste

### Saved Searches

**Save frequent analyses:**
- ✅ Check "Save this search" 
- Name it descriptively: "Chainlink DeFi Content"
- Access from saved searches panel
- Up to 10 saved searches stored locally

---

## 🎯 Advanced Usage

### Content Strategy Research

**Find viral content patterns:**
1. Analyze competitor channels
2. Export top performing videos
3. Analyze title patterns in Excel/Sheets
4. Identify optimal upload timing

**Keyword research workflow:**
1. Start with broad terms: `tutorial`
2. Analyze results for sub-topics
3. Refine with specific terms: `tutorial AND beginner`
4. Export refined dataset

**Competitive analysis:**
1. Analyze 3-5 competitor channels
2. Compare upload frequencies
3. Identify content gaps
4. Find trending topics they're missing

### Troubleshooting

**"Channel not found" errors:**
- Verify channel URL/handle is correct
- Some private channels may not be accessible
- Try searching for the channel on YouTube first

**"Quota exceeded" errors:**
- Check your Google Cloud Console quotas
- Wait until next day for quota reset
- Consider increasing daily limits

**Slow performance:**
- Large channels (1000+ videos) take time
- YouTube API has rate limits
- Close other tabs to free up memory

**Empty results with keywords:**
- Try broader terms first
- Check spelling and try variations
- Use OR logic for more results

---

## 🛠️ Local Installation

**Want to run it locally?**

```bash
# Clone the repository
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter

# Install dependencies  
npm install

# Create environment file
cp .env.template .env

# Add your API key to .env
echo "YOUTUBE_API_KEY=your_key_here" > .env

# Start the server
npm start

# Open http://localhost:3000
```

**Benefits of local setup:**
- Your API key stays on your computer
- No browser security limitations
- Full control over data
- Can modify the code

---

## 📞 Support & Resources

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/ronbronstein/youtube-exporter/issues)
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md`
- **API Documentation**: [YouTube Data API v3 Reference](https://developers.google.com/youtube/v3/docs)

### YouTube API Resources

- **Quota Calculator**: [developers.google.com/youtube/v3/determine_quota_cost](https://developers.google.com/youtube/v3/determine_quota_cost)
- **API Console**: [console.cloud.google.com](https://console.cloud.google.com/)
- **Quota Monitoring**: APIs & Services → Dashboard

### Community

- **Share your analyses**: Tag us when you find interesting insights
- **Feature requests**: Open GitHub issues with your ideas
- **Contributions**: PRs welcome for improvements

---

## 🎨 About the Design

This tool celebrates the golden age of Windows XP (2001-2014) with:
- **Authentic 3D borders** and button styling
- **Classic Tahoma fonts** throughout
- **Original XP color palette** (`#ece9d8`, `#0078d4`)
- **Nostalgic scrollbars** and hover effects
- **Modern functionality** with retro aesthetics

*Built with ❤️ for creators who appreciate both cutting-edge analytics and timeless design.*

---

**⭐ Found this useful? Star the [GitHub repository](https://github.com/ronbronstein/youtube-exporter) to help others discover it!** 