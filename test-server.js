const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Demo configuration with abuse prevention
const DEMO_CONFIG = {
    demoMode: true,
    demoApiKey: process.env.YOUTUBE_API_KEY || 'AIzaSyDemoKey123456789', // Use environment variable or placeholder
    enabled: process.env.DEMO_ENABLED !== 'false', // Can be disabled via environment variable
    adminDisabled: process.env.DEMO_ADMIN_DISABLED === 'true' // Admin kill switch
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // API key endpoint for demo mode
    if (req.url === '/api/key') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(DEMO_CONFIG));
        return;
    }
    
    // Admin endpoints for demo management
    if (req.url === '/api/admin/disable-demo' && req.method === 'POST') {
        DEMO_CONFIG.enabled = false;
        DEMO_CONFIG.adminDisabled = true;
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Demo disabled' }));
        console.log('🛑 Demo disabled via admin API');
        return;
    }
    
    if (req.url === '/api/admin/enable-demo' && req.method === 'POST') {
        DEMO_CONFIG.enabled = true;
        DEMO_CONFIG.adminDisabled = false;
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Demo enabled' }));
        console.log('✅ Demo enabled via admin API');
        return;
    }

    // Serve static files
    if (req.url === '/' || req.url === '/index.html') {
        req.url = '/youtube_video_exporter.html';
    }

    const filePath = path.join(__dirname, req.url);
    const ext = path.extname(filePath);
    
    // Security check - only serve files in current directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        // Set content type based on extension
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json'
        };

        const contentType = contentTypes[ext] || 'text/plain';
        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🎭 Demo Test Server running at http://localhost:${PORT}`);
    console.log(`📊 Demo Mode: ${DEMO_CONFIG.demoMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔑 Demo API Key: ${DEMO_CONFIG.demoApiKey ? 'SET' : 'NOT SET'}`);
    console.log('');
    console.log('Test URLs:');
    console.log(`  • Main App: http://localhost:${PORT}`);
    console.log(`  • API Key Test: http://localhost:${PORT}/api/key`);
    console.log('');
    console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down demo test server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
}); 