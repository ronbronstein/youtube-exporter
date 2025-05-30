# 📺 User Guide

Quick guide to analyzing YouTube channels with YouTube Research Hub.

## 🚀 Getting Started

### 1. Get YouTube API Key
See **[README Quick Start](../README.md#-youtube-api-key-2-minutes)** for 2-minute setup.

### 2. Access the Tool
- **Online**: [Launch App →](https://ronbronstein.github.io/youtube-exporter/)
- **Local**: Follow **[README setup](../README.md#run-locally)**

### 3. Analyze a Channel
1. **Enter channel**: `@username`, `youtube.com/@handle`, or channel ID
2. **Add keywords** (optional): `tutorial, crypto, guide`
3. **Choose logic**: AND (all keywords) OR (any keyword)  
4. **Click "Analyze Channel"**

## 📊 Features Overview

### Channel Analysis
**Supported formats:**
```
@mrbeast
youtube.com/@veritasium
youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
UC_x5XG1OV2P6uZZ5FSM9Ttw
```

**Analysis includes:**
- Complete video inventory
- Viral content detection (3x+ average views)
- Upload patterns and timing
- Title pattern analysis from top performers

### Keyword Filtering
| Logic | Example | Results |
|-------|---------|---------|
| **OR** | `tutorial, guide` | Videos with either word |
| **AND** | `tutorial AND beginner` | Videos with both words |
| **Quotes** | `"real world assets"` | Exact phrase matching |

**Tips:**
- Keywords search titles AND descriptions
- Case insensitive matching
- Use quotes for exact phrases

### Export Options
| Format | Content | Best For |
|--------|---------|----------|
| **CSV** | Complete metrics | Excel/Sheets analysis |
| **Markdown** | Structured data | LLM analysis (ChatGPT/Claude) |
| **Text** | Title list only | Content inspiration |

## 🎯 Usage Modes

| Mode | API Key | Video Limit | Use Case |
|------|---------|-------------|----------|
| **Demo** | None required | 100 videos | Quick testing |
| **Live** | Your API key | Unlimited* | Full analysis |

*Subject to YouTube API quotas (10,000 requests/day free)

## 🛠️ Common Workflows

### Content Strategy Research
1. Analyze 3-5 competitor channels
2. Export top performing videos to CSV
3. Identify viral content patterns
4. Find content gaps and opportunities

### Keyword Research
1. Start broad: `tutorial`
2. Analyze results for sub-topics
3. Refine: `tutorial AND beginner`
4. Export refined dataset

### Competitive Analysis
1. Compare upload frequencies across channels
2. Identify trending topics competitors miss
3. Analyze title patterns from top performers
4. Extract successful keywords and formats

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Channel not found"** | Verify URL format, try `@handle` format |
| **"API key invalid"** | Check format (starts with `AIza`), ensure API enabled |
| **Empty keyword results** | Try broader terms, check spelling |
| **Slow analysis** | Large channels take time, be patient |
| **Quota exceeded** | Check Google Cloud Console, wait for reset |

### API Quota Usage
- **Channel lookup**: ~5 units
- **50 videos**: ~1 unit
- **1,000 video analysis**: ~25 units total

*Most analyses cost 20-100 units, well within 10,000 daily free limit.*

## 🔒 Security Notes

- **API keys stored locally** in browser only
- **No backend servers** - direct YouTube API calls
- **Keys visible** in browser dev tools
- **Use on trusted devices** only

**Best practices:**
- Restrict API key to specific domains in Google Cloud Console
- Monitor usage in Google Cloud Console
- Clear key on shared devices using "Clear API Key" button

## 📚 Resources

- **[GitHub Repository](https://github.com/ronbronstein/youtube-exporter)** - Source code
- **[API Reference](API_REFERENCE.md)** - Technical documentation
- **[Contributing](CONTRIBUTING.md)** - Development workflow
- **[YouTube API Documentation](https://developers.google.com/youtube/v3/docs)** - Official docs

---

*Built with Windows XP nostalgia and modern functionality.* 