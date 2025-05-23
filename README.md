# 📺 YouTube Channel Content Research Tool

Powerful, local tool for comprehensive YouTube channel content analysis. Research any channel's complete video library and uncover content strategies that work.

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy the config template to .env
cp config.template .env

# Edit .env and add your YouTube API key
# Get your key from: https://console.cloud.google.com/apis/credentials
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Tool
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting Your YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**
4. Create credentials → API Key
5. Copy the key to your `.env` file

## 📊 Powerful Research Features

### 🎯 **Complete Channel Analysis**
- **Fetch ALL Videos**: Get entire channel history (not just recent uploads)
- **Smart Pagination**: Automatically handles API limits to fetch thousands of videos
- **Comprehensive Data**: Views, likes, comments, upload dates, durations

### 📈 **Content Strategy Insights**
- **Title Pattern Analysis**: Discover what words/patterns work in top-performing videos
- **Viral Content Detection**: Identify breakout videos (3x+ average views)
- **Upload Schedule Analysis**: Find optimal posting days and times
- **Engagement Metrics**: Calculate engagement rates and performance trends

### 📝 **Title Research**
- **Success Word Analysis**: Extract common words from top 20% performing videos
- **Title Length Optimization**: Discover ideal title lengths for the channel
- **Pattern Recognition**: Numbers, questions, caps usage in successful titles
- **Trending Topics**: Identify themes that drive high engagement

### 📋 **Clean List View**
- **Table Format**: Organized, sortable data instead of cards
- **Engagement Rates**: Built-in engagement percentage calculations
- **Direct Links**: Click titles to watch videos instantly
- **Performance Sorting**: Sort by views, likes, engagement, date

### 💾 **Export Capabilities**
- **Complete CSV**: Full dataset with all metrics for spreadsheet analysis
- **Title Lists**: Export just titles for content planning
- **Research Reports**: Comprehensive data for further analysis

## 🛠️ Technical Features

- **Single File Architecture**: All functionality in one portable HTML file
- **Local Processing**: Everything runs on your machine
- **API Efficient**: Smart batching and pagination
- **Error Resilient**: Handles API limits and network issues gracefully
- **Real-time Progress**: See live updates as data is fetched

## 📝 Usage

1. **Enter Channel**: Use @handle, channel URL, or channel name
2. **Choose Scope**: Recent videos (fast) or ALL videos (comprehensive)
3. **Filter Content**: Optional keyword filtering
4. **Analyze**: Get instant insights and downloadable data
5. **Research**: Use insights to inform your content strategy

## 🎯 Perfect For

- **Content Creators**: Research successful channels in your niche
- **YouTube Strategists**: Analyze competitors' content patterns
- **Content Planners**: Discover trending topics and title formats
- **Channel Managers**: Understand what works for specific audiences
- **Marketing Teams**: Research influencer content strategies

## 🔒 Privacy & Security

- **Local Only**: All processing happens in your browser
- **No Data Collection**: Zero tracking or external analytics
- **API Key Security**: Stored securely in local .env file
- **Minimal Footprint**: Just two dependencies (express + dotenv)

---

**Comprehensive. Insightful. Local.** 🎯

*Transform any YouTube channel into actionable content insights.* 