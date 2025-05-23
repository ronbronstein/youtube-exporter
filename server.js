require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// API endpoint to get YouTube API key
app.get('/api/key', (req, res) => {
  if (!process.env.YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }
  res.json({ apiKey: process.env.YOUTUBE_API_KEY });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'youtube_video_exporter.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 YouTube Research Hub running at http://localhost:${PORT}`);
  console.log(`📁 API Key loaded: ${process.env.YOUTUBE_API_KEY ? '✅ Yes' : '❌ Missing'}`);
}); 