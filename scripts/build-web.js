#!/usr/bin/env node

/**
 * Build script to create standalone web version for GitHub Pages
 * Copies main HTML file and modifies it for static hosting
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building web version for GitHub Pages...');

// Read the main HTML file
const mainHtmlPath = path.join(__dirname, '../youtube_video_exporter.html');
const webHtmlPath = path.join(__dirname, '../docs/index.html');

try {
    let htmlContent = fs.readFileSync(mainHtmlPath, 'utf8');
    
    // Modifications for web version:
    
    // 1. Update title
    htmlContent = htmlContent.replace(
        '<title>YouTube Content Research Hub</title>',
        '<title>YouTube Research Hub - Free Web Version</title>'
    );
    
    // 2. Add web version banner after opening body tag
    const webBanner = `
    <!-- Web Version Banner -->
    <div style="background: linear-gradient(45deg, #28a745, #20c997); color: white; padding: 8px; text-align: center; font-size: 12px; font-weight: bold; position: relative; z-index: 1000;">
        🌐 <strong>Free Web Version</strong> • 
        <a href="https://github.com/ronbronstein/youtube-exporter" style="color: white; text-decoration: underline;">📥 Download for Local Use</a> • 
        <a href="USER_GUIDE.md" style="color: white; text-decoration: underline;">📖 User Guide</a> • 
        <a href="TROUBLESHOOTING.md" style="color: white; text-decoration: underline;">🛠️ Help</a>
    </div>
    `;
    
    htmlContent = htmlContent.replace('<body>', '<body>' + webBanner);
    
    // 3. Force web mode by modifying the initialization
    htmlContent = htmlContent.replace(
        'let apiMode = null; // Track whether we\'re in \'local\' or \'web\' mode',
        'let apiMode = \'web\'; // Force web mode for GitHub Pages version'
    );
    
    // 4. Modify initializeApiKey to skip server check
    const webInitFunction = `
        // Web-only API key initialization (no server check)
        async function initializeApiKey() {
            // Force web mode - client-side key input only
            apiMode = 'web';
            showApiKeyPanel();
            loadSavedClientKey();
            debugLog('🌐 Web mode: Client-side API key required');
            console.log('🌐 Web version: Please enter your YouTube API key');
            return 'web';
        }`;
    
    htmlContent = htmlContent.replace(
        /\/\/ Hybrid API key initialization[\s\S]*?return 'web';\s*}/,
        webInitFunction
    );
    
    // 5. Add meta tags for SEO
    const metaTags = `
    <meta name="description" content="Free YouTube channel analytics tool with retro Windows XP design. Analyze upload patterns, find viral content, and optimize your YouTube strategy.">
    <meta name="keywords" content="youtube analytics, channel analysis, content strategy, windows xp, retro design, viral content">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:title" content="YouTube Research Hub - Free Analytics Tool">
    <meta property="og:description" content="Retro Windows XP meets cutting-edge YouTube analytics">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ronbronstein.github.io/youtube-exporter/">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="YouTube Research Hub">
    <meta name="twitter:description" content="Free YouTube analytics with Windows XP nostalgia">
    `;
    
    htmlContent = htmlContent.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' + metaTags
    );
    
    // Write the web version
    fs.writeFileSync(webHtmlPath, htmlContent);
    
    console.log('✅ Web version created at docs/index.html');
    console.log('🌐 Ready for GitHub Pages deployment!');
    
    // Also create a simple README for the docs folder
    const docsReadme = `# YouTube Research Hub - Web Version

This directory contains the GitHub Pages deployment files.

## Files
- \`index.html\` - Main web application (auto-generated from build script)
- \`USER_GUIDE.md\` - Complete user documentation
- \`TROUBLESHOOTING.md\` - Setup and debugging help

## Deployment
This folder is automatically deployed to GitHub Pages at:
https://ronbronstein.github.io/youtube-exporter/

## Building
To rebuild the web version:
\`\`\`bash
node scripts/build-web.js
\`\`\`
`;
    
    fs.writeFileSync(path.join(__dirname, '../docs/README.md'), docsReadme);
    console.log('✅ Created docs/README.md');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 