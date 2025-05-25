# 🔧 Troubleshooting Guide

Common issues and solutions for YouTube Channel Research Hub.

## 🚨 **Current Known Issues (Active Development)**

### Missing Analysis Sections
**Problem**: Analysis panels from legacy version are not displaying  
**Status**: 🔄 Being restored in current sprint  
**Workaround**: Basic video list and filtering still work  
**ETA**: Next few days  

**Missing Features**:
- Content Analysis grid (Total Videos, Avg Views, etc.)
- Advanced Content Insights (Viral Content, Title Patterns)
- Upload Frequency Timeline chart

### Video Display Issues
**Problem**: Videos may not be visible even when data is fetched successfully  
**Status**: 🔄 Being fixed in current sprint  
**Workaround**: Check browser console for "videos found" messages  
**Debug**: Look for debug logs showing successful API calls  

### Loading States Not Always Visible
**Problem**: No loading indicator during API calls in some cases  
**Status**: ✅ Partially fixed with fallback system  
**Solution**: Loading should work now, but may appear different than expected  

### Grid View Needs Improvement
**Problem**: Grid view layout needs optimization  
**Status**: 🔄 Being redesigned for two-column layout with emoji metrics  
**Workaround**: Use list view for now  

---

## 🔑 YouTube API Setup Issues

### "API key not loaded" Error
**Problem**: Server can't find or load your YouTube API key  
**Solution**:
1. Check if `.env` file exists in project root
2. Verify format: `YOUTUBE_API_KEY=your_key_here` (no spaces around =)
3. Restart server after editing .env: `npm start`
4. Check server console for "✅ Yes" message

### "Invalid API Key" (400 Error)
**Problem**: API key is malformed or doesn't exist  
**Solutions**:
- Generate new key at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Enable "YouTube Data API v3" in your project
- Copy exact key string (check for trailing spaces)
- API keys can take 5-10 minutes to activate

### "API key not authorized" (403 Error)
**Problem**: API key doesn't have YouTube API access  
**Solutions**:
- Go to Google Cloud Console → APIs & Services → Enabled APIs
- Search for "YouTube Data API v3" and enable it
- Wait 10 minutes for changes to propagate

## 📊 YouTube API Quota System

### How Quotas Work
- **Daily Limit**: 10,000 units per project (resets at midnight Pacific Time)
- **No per-second limits** but reasonable usage expected
- **Cost per operation**:
  - Channel lookup: 1 unit
  - Get uploads playlist: 1 unit  
  - Fetch 50 videos: 1 unit
  - **Total for 1000 videos**: ~21 units

### Quota Exceeded (403 Error)
**Symptoms**: "quotaExceeded" error message  
**Solutions**:
- Wait until midnight PT for quota reset
- Create additional Google Cloud projects with separate API keys
- Optimize usage: analyze fewer massive channels per day
- Increase quota limits (paid Google Cloud account)

### Quota Implications for Large Channels
YouTube Research Hub is designed to efficiently handle channels of any size:

- **Small channels (< 100 videos)**: ~2-5 quota units
- **Medium channels (100-1000 videos)**: ~5-25 quota units  
- **Large channels (1000-5000 videos)**: ~25-100 quota units
- **Very large channels (5000+ videos)**: ~100+ quota units

**Strategy**: The tool automatically batches requests and provides progress feedback. Most users can analyze multiple large channels per day within the free 10,000 unit daily limit.

## 🚫 Channel Issues

### "Channel not found" Error
**Possible causes**:
- Channel was deleted or suspended
- Channel handle changed recently
- Private/unlisted channel
- Typo in channel URL/handle

**Debugging steps**:
1. Try different formats:
   - `@channelname`
   - `youtube.com/@channelname` 
   - `youtube.com/channel/UCxxxxx`
2. Check if channel exists by visiting URL manually
3. Try channel ID instead of handle (from channel "About" page)

### "No videos found" (0 results)
**Causes**:
- Channel has no public videos
- All videos are private/unlisted
- Channel only has Shorts (some don't appear in uploads playlist)
- Very new channel (indexing delay)

**Solutions**:
- Check channel manually for public videos
- Try different channel URL format
- Wait 24-48 hours for new channels

## ⚡ Performance Issues

### Browser Freezing (Large Channels)
**Problem**: 2000+ video channels overwhelm browser  
**Solutions**:
- Close other browser tabs
- Use Chrome/Firefox (better memory management)
- Restart browser between large analyses
- Filter by keywords to reduce dataset

### "Network timeout" Errors
**Causes**: 
- Slow internet connection
- YouTube API temporary issues
- Too many concurrent requests

**Solutions**:
- Retry the analysis
- Check internet connection stability
- Try during off-peak hours (avoid US evening)

### Slow Loading Times
**Normal expectations**:
- 50 videos: 2-5 seconds
- 500 videos: 15-30 seconds  
- 2000+ videos: 1-3 minutes

**If slower**:
- Check network speed
- Close resource-heavy applications
- Try incognito/private browsing mode

## 🔄 Data Issues

### Incorrect Video Counts
**Problem**: Results don't match channel's displayed video count  
**Explanation**: 
- YouTube's public count includes Shorts, Lives, premieres, and unlisted videos
- Our tool analyzes public regular videos from the uploads playlist
- This difference is normal and expected - we show only publicly accessible content

### Missing Recent Videos
**Problem**: Latest videos don't appear  
**Causes**:
- YouTube indexing delay (up to 24 hours)
- Videos are premieres/scheduled
- Videos are unlisted or private

### Engagement Rates Seem Wrong
**Problem**: Rates appear too low/high  
**Note**: 
- Engagement = (Likes + Comments) / Views × 100
- 2-5% is typical for most channels
- Viral videos often have lower engagement rates
- Very new videos may show inflated rates

## 🗂️ Export Problems

### CSV Won't Download
**Solutions**:
- Check browser's download permissions
- Try different browser
- Disable popup/download blockers
- Clear browser cache

### Garbled Text in Exports
**Problem**: Special characters appear as symbols  
**Solution**:
- Open CSV in Google Sheets instead of Excel
- Use UTF-8 encoding when importing to Excel
- Try TXT export for title-only lists

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+  
- ✅ Safari 13+
- ✅ Edge 80+

### Known Issues
- **Internet Explorer**: Not supported (missing ES6 features)
- **Old browsers**: Chart.js may not render properly
- **Mobile Safari**: Some XP styling may appear different

## 🆘 Still Having Issues?

### Quick Diagnostic Checklist
1. **API Key**: Does server show "✅ Yes" on startup?
2. **Internet**: Can you visit YouTube.com normally?
3. **Channel**: Can you access the channel manually?
4. **Browser**: Try incognito mode + different browser
5. **Quota**: Have you analyzed many large channels today?

### When to Create New API Key
- Key compromised or exposed
- Quota exhausted and can't wait for reset
- Moving to different Google account
- Key stops working unexpectedly

### Performance Expectations
- **Small channels (≤100 videos)**: Near-instant
- **Medium channels (100-1000 videos)**: 10-60 seconds
- **Large channels (1000+ videos)**: 1-5 minutes
- **Massive channels (5000+ videos)**: 3-10 minutes

Remember: This tool prioritizes **accuracy over speed** - we fetch every single video for complete analysis rather than estimates. 