#!/usr/bin/env node

/**
 * Design Verification Test for YouTube Research Hub
 * Tests that the application loads properly with Windows XP styling
 */

import http from 'http';

const PREVIEW_URL = 'http://localhost:4173';
const TESTS = [
    {
        name: 'Application loads successfully',
        test: async () => {
            const html = await fetchContent('/');
            return html.includes('YouTube Content Research Hub') && 
                   html.includes('Loading modular application');
        }
    },
    {
        name: 'CSS contains Windows XP variables',
        test: async () => {
            // Find the CSS file name from the HTML
            const html = await fetchContent('/');
            const cssMatch = html.match(/href="\/assets\/(index-[^"]+\.css)"/);
            if (!cssMatch) return false;
            
            const css = await fetchContent(`/assets/${cssMatch[1]}`);
            return css.includes('--xp-gray: #ece9d8') && 
                   css.includes('--xp-blue-start: #0a246a') &&
                   css.includes('App Component Styles');
        }
    },
    {
        name: 'Windows XP button styling present',
        test: async () => {
            const html = await fetchContent('/');
            const cssMatch = html.match(/href="\/assets\/(index-[^"]+\.css)"/);
            if (!cssMatch) return false;
            
            const css = await fetchContent(`/assets/${cssMatch[1]}`);
            return css.includes('border: 1px outset var(--xp-button-face)') &&
                   css.includes('font-family: \'Tahoma\'');
        }
    },
    {
        name: 'JavaScript module loads correctly',
        test: async () => {
            const html = await fetchContent('/');
            const jsMatch = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
            if (!jsMatch) return false;
            
            const js = await fetchContent(`/assets/${jsMatch[1]}`);
            return js.length > 1000; // Should be substantial JS bundle
        }
    },
    {
        name: 'Chart.js dependency loads',
        test: async () => {
            const html = await fetchContent('/');
            return html.includes('chart.js');
        }
    }
];

async function fetchContent(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${PREVIEW_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        
        req.on('error', (err) => {
            console.error(`❌ Failed to fetch ${path}:`, err.message);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function runTests() {
    console.log('🧪 Design Verification Test Suite\n');
    console.log(`Testing application at: ${PREVIEW_URL}`);
    console.log('─'.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    for (const { name, test } of TESTS) {
        try {
            const result = await test();
            if (result) {
                console.log(`✅ ${name}`);
                passed++;
            } else {
                console.log(`❌ ${name}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${name} (Error: ${error.message})`);
            failed++;
        }
    }
    
    console.log('─'.repeat(50));
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log('🎉 All design tests passed! Windows XP styling is working correctly.');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please check the preview server and styling.');
        process.exit(1);
    }
}

// Check if preview server is running first
async function checkServer() {
    try {
        await fetchContent('/');
        console.log('✅ Preview server is running\n');
        return true;
    } catch (error) {
        console.error('❌ Preview server is not running. Please start it with: npm run preview');
        console.error(`   Expected URL: ${PREVIEW_URL}`);
        process.exit(1);
    }
}

// Main execution
async function main() {
    await checkServer();
    await runTests();
}

main().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
}); 