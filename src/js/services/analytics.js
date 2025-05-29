/**
 * AnalyticsService - Handles all content analysis and insights generation
 * 
 * Features:
 * - Content statistics and engagement analysis
 * - Upload timeline chart generation with Chart.js
 * - Viral content detection (3x+ performance)
 * - Title pattern analysis and common words
 * - Upload schedule analysis and optimization
 * - Advanced insights panel generation
 */

import { debugLog } from '../utils/debug.js';
import { formatViewCount } from '../utils/formatter.js';
import { CONFIG } from '../config.js';

export class AnalyticsService {
    constructor() {
        this.videosData = [];
        this.chartInstance = null;
    }

    /**
     * Initialize the analytics service (App.js expects this)
     */
    initialize() {
        debugLog('📊 Analytics service initialized');
        return true;
    }

    /**
     * Set the video data for analysis
     * @param {Array} videos - Array of video objects
     */
    setVideosData(videos) {
        this.videosData = videos || [];
    }

    /**
     * Generate basic content analysis statistics
     * @returns {Object} Analysis statistics
     */
    generateContentAnalysis() {
        if (this.videosData.length === 0) {
            return null;
        }

        debugLog('Generating content analysis for', this.videosData.length, 'videos');

        // Calculate core metrics with safe property access
        const totalViews = this.videosData.reduce((sum, video) => sum + (video.viewCount || 0), 0);
        const avgViews = Math.round(totalViews / this.videosData.length);
        const topVideo = this.videosData.reduce((max, video) => 
            (video.viewCount || 0) > (max.viewCount || 0) ? video : max
        );
        const totalVideos = this.videosData.length;

        // Upload frequency calculation
        const sortedByDate = [...this.videosData].sort((a, b) => (b.publishedDate || 0) - (a.publishedDate || 0));
        const oldestDate = sortedByDate[sortedByDate.length - 1]?.publishedDate;
        const newestDate = sortedByDate[0]?.publishedDate;
        const monthsDiff = oldestDate ? (newestDate - oldestDate) / (1000 * 60 * 60 * 24 * 30) : 1;
        const videosPerMonth = Math.round(totalVideos / monthsDiff);

        // Title analysis with safe property access
        const avgTitleLength = Math.round(
            this.videosData.reduce((sum, video) => sum + ((video.title || '').length), 0) / this.videosData.length
        );

        // Engagement rate calculation with safe property access
        const avgEngagement = this.videosData.length > 0 ? 
            (this.videosData.reduce((sum, video) => {
                const views = video.viewCount || 0;
                const likes = video.likeCount || 0;
                const comments = video.commentCount || 0;
                return sum + (views > 0 ? (likes + comments) / views : 0);
            }, 0) / this.videosData.length * 100).toFixed(2) : '0.00';

        return {
            totalVideos,
            totalViews,
            avgViews,
            videosPerMonth,
            avgTitleLength,
            avgEngagement,
            topVideo: {
                title: topVideo.title || 'Untitled',
                views: topVideo.viewCount || 0,
                viewsFormatted: formatViewCount(topVideo.viewCount || 0)
            }
        };
    }

    /**
     * Generate content analysis HTML panel
     * @returns {string} HTML string for analysis panel
     */
    generateContentAnalysisHTML() {
        const analysis = this.generateContentAnalysis();
        if (!analysis) return '';

        return `
            <div class="analysis-panel" data-title="📊 Content Analysis">
                <h3>📊 Content Analysis</h3>
                <div class="analysis-grid">
                    <div class="analysis-stat">
                        <h4>${analysis.totalVideos.toLocaleString()}</h4>
                        <p>Total Videos</p>
                    </div>
                    <div class="analysis-stat">
                        <h4>${analysis.avgViews.toLocaleString()}</h4>
                        <p>Avg Views</p>
                    </div>
                    <div class="analysis-stat">
                        <h4>${analysis.videosPerMonth}</h4>
                        <p>Videos/Month</p>
                    </div>
                    <div class="analysis-stat">
                        <h4>${analysis.avgTitleLength}</h4>
                        <p>Avg Title Length</p>
                    </div>
                    <div class="analysis-stat">
                        <h4>${analysis.avgEngagement}%</h4>
                        <p>Avg Engagement</p>
                    </div>
                    <div class="analysis-stat">
                        <h4>${(analysis.topVideo.views / 1000000).toFixed(1)}M</h4>
                        <p>Top Video Views</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Identify viral content (3x+ average performance)
     * @returns {Array} Array of viral videos
     */
    identifyViralContent() {
        if (this.videosData.length === 0) return [];

        const avgViews = this.videosData.reduce((sum, v) => sum + (v.viewCount || 0), 0) / this.videosData.length;
        const viralThreshold = avgViews * 3;

        const viralVideos = this.videosData
            .filter(video => (video.viewCount || 0) >= viralThreshold)
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 5); // Top 5 viral videos

        debugLog('Viral content analysis', {
            avgViews: Math.round(avgViews),
            threshold: Math.round(viralThreshold),
            viralCount: viralVideos.length
        });

        return viralVideos;
    }

    /**
     * Analyze title patterns for insights
     * @returns {Object} Title pattern analysis
     */
    analyzeTitlePatterns() {
        if (this.videosData.length === 0) {
            return { avgLength: 0, commonWords: [], questionPercent: 0 };
        }

        const titles = this.videosData.map(v => v.title || 'Untitled');
        const avgLength = Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length);

        // Find common words (excluding stop words)
        const stopWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
            'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ];

        const allWords = titles.join(' ').toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        const wordCounts = {};
        allWords.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        const commonWords = Object.entries(wordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);

        // Calculate question percentage
        const questionTitles = titles.filter(title => title.includes('?')).length;
        const questionPercent = Math.round((questionTitles / titles.length) * 100);

        return { avgLength, commonWords, questionPercent };
    }

    /**
     * Analyze upload schedule for optimal timing
     * @returns {Object} Upload schedule analysis
     */
    analyzeUploadSchedule() {
        if (this.videosData.length === 0) {
            return { bestDay: 'Unknown', mostActiveDay: 'Unknown', consistency: 'Unknown' };
        }

        const dayViews = {};
        const dayCounts = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        this.videosData.forEach(video => {
            const day = dayNames[video.publishedDate.getDay()];
            dayViews[day] = (dayViews[day] || 0) + video.viewCount;
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        // Best performing day (highest average views)
        let bestDay = 'Monday';
        let bestAvgViews = 0;
        Object.keys(dayViews).forEach(day => {
            const avgViews = dayViews[day] / dayCounts[day];
            if (avgViews > bestAvgViews) {
                bestAvgViews = avgViews;
                bestDay = day;
            }
        });

        // Most active day (most uploads)
        const mostActiveDay = Object.entries(dayCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Monday';

        // Upload consistency
        const uploadDays = Object.keys(dayCounts).length;
        const consistency = uploadDays >= 5 ? 'High' : uploadDays >= 3 ? 'Medium' : 'Low';

        return { bestDay, mostActiveDay, consistency };
    }

    /**
     * Generate advanced analysis HTML panel
     * @returns {string} HTML string for advanced analysis
     */
    generateAdvancedAnalysisHTML() {
        if (this.videosData.length === 0) return '';

        const viralVideos = this.identifyViralContent();
        const titlePatterns = this.analyzeTitlePatterns();
        const uploadSchedule = this.analyzeUploadSchedule();

        return `
            <div class="analysis-panel" data-title="🔬 Advanced Content Insights">
                <h3>🔬 Advanced Content Insights</h3>
                
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--xp-blue-start); margin-bottom: 8px;">🚀 Viral Content (3x+ avg performance)</h4>
                    <div style="background: white; padding: 12px; border: 1px inset var(--xp-button-face); border-radius: 4px; font-size: 12px;">
                        ${viralVideos.length > 0 ? 
                            viralVideos.map(v => `• <strong>${v.title}</strong> (${formatViewCount(v.viewCount)} views)`).join('<br>') :
                            'No viral content detected (3x+ average performance)'
                        }
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--xp-blue-start); margin-bottom: 8px;">📝 Title Patterns</h4>
                    <div style="background: white; padding: 12px; border: 1px inset var(--xp-button-face); border-radius: 4px; font-size: 12px;">
                        • Average title length: <strong>${titlePatterns.avgLength} characters</strong><br>
                        • Common words: <strong>${titlePatterns.commonWords.join(', ')}</strong><br>
                        • Question titles: <strong>${titlePatterns.questionPercent}%</strong>
                    </div>
                </div>
                
                <div>
                    <h4 style="color: var(--xp-blue-start); margin-bottom: 8px;">⏰ Upload Schedule</h4>
                    <div style="background: white; padding: 12px; border: 1px inset var(--xp-button-face); border-radius: 4px; font-size: 12px;">
                        • Best performing day: <strong>${uploadSchedule.bestDay}</strong><br>
                        • Most active day: <strong>${uploadSchedule.mostActiveDay}</strong><br>
                        • Upload consistency: <strong>${uploadSchedule.consistency}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Prepare data for upload timeline chart
     * @returns {Object} Chart data object
     */
    prepareUploadTimelineData() {
        if (this.videosData.length === 0) return null;

        // Group videos by month
        const monthlyData = {};
        this.videosData.forEach(video => {
            const date = new Date(video.publishedDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        // Convert to chart data
        const sortedMonths = Object.keys(monthlyData).sort();
        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        });
        const data = sortedMonths.map(month => monthlyData[month]);

        return {
            labels,
            datasets: [{
                label: 'Videos Uploaded',
                data: data,
                borderColor: CONFIG.UI.CHART_COLORS.primary,
                backgroundColor: CONFIG.UI.CHART_COLORS.background,
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        };
    }

    /**
     * Create upload timeline chart with Chart.js
     * @param {string} canvasId - ID of canvas element
     */
    createUploadTimelineChart(canvasId = 'uploadChart') {
        const chartData = this.prepareUploadTimelineData();
        if (!chartData) return;

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            debugLog('Canvas element not found:', canvasId);
            return;
        }

        // Destroy existing chart instance if it exists
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        try {
            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                font: { family: 'Tahoma', size: 11 },
                                color: '#000000'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: { family: 'Tahoma', size: 10 },
                                color: '#000000'
                            },
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Tahoma', size: 10 },
                                color: '#000000'
                            },
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        }
                    }
                }
            });

            debugLog('Upload timeline chart created successfully');
        } catch (error) {
            debugLog('Failed to create chart', error);
        }
    }

    /**
     * Generate chart panel HTML
     * @returns {string} HTML string for chart panel
     */
    generateChartPanelHTML(canvasId = 'uploadChart') {
        return `
            <div class="chart-panel" data-title="📈 Upload Frequency Timeline">
                <div class="chart-container">
                    <canvas id="${canvasId}" style="max-height: 300px;"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Get comprehensive analytics summary
     * @returns {Object} Complete analytics data
     */
    getAnalyticsSummary() {
        if (this.videosData.length === 0) return null;

        return {
            contentAnalysis: this.generateContentAnalysis(),
            viralContent: this.identifyViralContent(),
            titlePatterns: this.analyzeTitlePatterns(),
            uploadSchedule: this.analyzeUploadSchedule(),
            chartData: this.prepareUploadTimelineData()
        };
    }

    /**
     * Generate analytics in the format expected by App.js
     * @returns {Object} Analytics data with overview, topVideos, and insights
     */
    generateAnalytics() {
        if (this.videosData.length === 0) {
            return {
                overview: { totalVideos: 0, totalViews: 0, averageViews: 0 },
                topVideos: { byViews: [] },
                insights: []
            };
        }

        const contentAnalysis = this.generateContentAnalysis();
        const viralVideos = this.identifyViralContent();
        const titlePatterns = this.analyzeTitlePatterns();
        const uploadSchedule = this.analyzeUploadSchedule();

        // Prepare top videos by views
        const topVideosByViews = [...this.videosData]
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 10);

        // Generate insights based on analysis
        const insights = this.generateInsights(contentAnalysis, viralVideos, titlePatterns, uploadSchedule);

        return {
            overview: {
                totalVideos: contentAnalysis.totalVideos,
                totalViews: contentAnalysis.totalViews,
                averageViews: contentAnalysis.avgViews
            },
            topVideos: {
                byViews: topVideosByViews
            },
            insights: insights
        };
    }

    /**
     * Generate actionable insights from analytics data
     * @param {Object} contentAnalysis - Basic content metrics
     * @param {Array} viralVideos - Viral content list
     * @param {Object} titlePatterns - Title analysis results
     * @param {Object} uploadSchedule - Schedule analysis results
     * @returns {Array} Array of insight objects
     */
    generateInsights(contentAnalysis, viralVideos, titlePatterns, uploadSchedule) {
        const insights = [];

        // Viral content insights
        if (viralVideos.length > 0) {
            insights.push({
                type: 'success',
                message: `Found ${viralVideos.length} viral video${viralVideos.length > 1 ? 's' : ''} with 3x+ average performance`
            });
        } else {
            insights.push({
                type: 'info',
                message: 'No viral content detected. Videos performing consistently around average.'
            });
        }

        // Upload frequency insights
        if (contentAnalysis.videosPerMonth > 4) {
            insights.push({
                type: 'success',
                message: `High upload frequency: ${contentAnalysis.videosPerMonth} videos/month`
            });
        } else if (contentAnalysis.videosPerMonth < 1) {
            insights.push({
                type: 'warning',
                message: 'Low upload frequency. Consider more consistent content creation.'
            });
        }

        // Engagement insights
        const avgEngagement = parseFloat(contentAnalysis.avgEngagement);
        if (avgEngagement > 5) {
            insights.push({
                type: 'success',
                message: `Strong engagement rate: ${contentAnalysis.avgEngagement}%`
            });
        } else if (avgEngagement < 1) {
            insights.push({
                type: 'warning',
                message: 'Low engagement rate. Consider improving content quality or targeting.'
            });
        }

        // Title length insights
        if (titlePatterns.avgLength > 60) {
            insights.push({
                type: 'warning',
                message: 'Titles are quite long. Consider shorter, punchier titles for better CTR.'
            });
        } else if (titlePatterns.avgLength < 30) {
            insights.push({
                type: 'info',
                message: 'Short titles detected. Consider adding more descriptive keywords.'
            });
        }

        // Upload schedule insights
        insights.push({
            type: 'info',
            message: `Best performing day: ${uploadSchedule.bestDay}. Upload consistency: ${uploadSchedule.consistency}`
        });

        // Question titles insight
        if (titlePatterns.questionPercent > 20) {
            insights.push({
                type: 'info',
                message: `${titlePatterns.questionPercent}% of titles are questions - good for engagement`
            });
        }

        // Common words insight
        if (titlePatterns.commonWords.length > 0) {
            insights.push({
                type: 'info',
                message: `Common title keywords: ${titlePatterns.commonWords.slice(0, 3).join(', ')}`
            });
        }

        return insights;
    }

    /**
     * Clear analytics data and destroy chart
     */
    clearAnalytics() {
        this.videosData = [];
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        debugLog('Analytics cleared');
    }
}

// Create singleton instance
export const analyticsService = new AnalyticsService(); 