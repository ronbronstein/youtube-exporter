# 🤝 Contributing Guide

## TOC
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Contribution Areas](#contribution-areas)

## Quick Start

### Setup Development Environment
```bash
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
npm install
npm run dev                     # → http://localhost:5173
```

### Get YouTube API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create `.env` file: `VITE_YOUTUBE_API_KEY=your_key_here`
4. Test with any channel (@mkbhd, @veritasium)

### Project Structure
```
src/js/
├── components/     # UI Components (7 ES6 classes)
├── services/       # Business Logic (YouTube API, Analytics)  
├── utils/          # Utilities (Formatting, Storage)
└── main.js         # Entry point

src/css/main.css    # Windows XP styling (5900+ lines)
docs/               # Documentation
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# Examples: fix/chart-rendering, feature/export-csv
```

### 2. Development Commands
```bash
npm run dev         # Development server (hot reload)
npm run build       # Production build test
npm run preview     # Test production build
```

### 3. Commit Standards
```bash
git commit -m "type(scope): description"
# Examples:
# feat(api): add rate limiting for demo mode
# fix(ui): resolve chart rendering on mobile
# docs: update API reference for new methods
```

### 4. Submit Pull Request
- Reference related Jira issue (e.g., "Fixes YRH-123")
- Include testing steps
- Ensure all checks pass

## Code Standards

### ES6 Component Pattern
```javascript
// src/js/components/VideoCard.js
import { formatNumber, formatDate } from '../utils/formatters.js';

export class VideoCard extends BaseComponent {
    constructor(container, video) {
        super(container);
        this.video = video;
    }
    
    template() {
        return `<div class="video-card">...</div>`;
    }
    
    onMount() {
        this.setupEventListeners();
    }
    
    onDestroy() {
        this.cleanup();
    }
}
```

### Service Layer Pattern
```javascript
// src/js/services/youtubeApi.js
export class YouTubeApiService {
    async getChannelData(query) {
        // API implementation
    }
}
```

### Windows XP Styling
```css
/* Maintain authentic XP aesthetic */
.button {
    border: 2px outset var(--xp-button-face);
    background: var(--xp-button-face);
    font-family: Tahoma, sans-serif;
}

.window {
    border: 3px outset var(--xp-window-border);
    background: var(--xp-window-face);
}
```

### Code Quality Guidelines
| Area | Requirement |
|------|-------------|
| **Components** | Extend BaseComponent, use lifecycle methods |
| **Imports** | Use relative paths, ES6 module syntax |
| **Naming** | camelCase variables, PascalCase classes |
| **Comments** | JSDoc for public methods |
| **Error Handling** | Try-catch for async operations |

## Testing

### Pre-Submit Checklist
```bash
npm run dev         # ✅ No console errors
npm run build       # ✅ Build succeeds  
npm run preview     # ✅ Production works locally
```

### Manual Testing
| Feature | Test Steps |
|---------|------------|
| **Channel Analysis** | Enter @mkbhd, verify data loads |
| **Export** | Download CSV/JSON, check format |
| **Demo Mode** | Test rate limiting (100 videos max) |
| **Mobile** | Verify responsive layout |
| **Windows XP UI** | Check authentic styling |

### Integration Tests
Access test mode: `http://localhost:5173/?test=true`
- Component rendering
- API integration  
- Data processing
- Export functionality

## Contribution Areas

### 🐛 Bug Fixes
- Check [GitHub Issues](https://github.com/ronbronstein/youtube-exporter/issues)
- Small fixes: Submit PR directly
- Complex bugs: Create issue for discussion

### ✨ New Features  
- Review [Jira Board](https://ronbronstein.atlassian.net) for planned features
- Create feature request issue first
- Focus on user value + XP aesthetic preservation

### 📚 Documentation
- Update docs when changing APIs
- Add examples for new features
- Improve troubleshooting sections
- Follow established concise format

### 🎨 UI/UX Improvements
- **Preserve** Windows XP design language
- **Enhance** usability while maintaining nostalgia
- **Ensure** mobile responsiveness
- **Test** across different screen sizes

### 🔧 Performance Optimization
- Bundle size reduction
- API efficiency improvements
- Memory leak prevention
- Loading time optimization

## Security Best Practices

### API Key Security
| Environment | Storage | Validation |
|-------------|---------|------------|
| **Development** | `.env` file | Local only |
| **Production** | User input | Domain restrictions |
| **Demo** | GitHub Secrets | Rate limited |

### Code Security
- **Sanitize** all user inputs
- **Validate** API responses
- **Use HTTPS** for external resources
- **Encrypt** sensitive localStorage data

## Resources

### Documentation
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Component APIs
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Build & deploy

### External Resources
- **[Vite Documentation](https://vitejs.dev/)** - Build tool
- **[YouTube Data API v3](https://developers.google.com/youtube/v3)** - API reference
- **[ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)** - Modern JS

### Project Management
- **[Jira Board](https://ronbronstein.atlassian.net)** - Current tasks & features
- **[GitHub Issues](https://github.com/ronbronstein/youtube-exporter/issues)** - Bug reports

---

*Focused on essential contribution knowledge, not generic open-source philosophy.* 