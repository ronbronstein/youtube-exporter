# 🤝 Contributing to YouTube Research Hub

Welcome! We're excited you want to contribute to the YouTube Research Hub. This guide covers the essentials for getting started with our modern ES6 modular architecture.

## 🚀 **Quick Start**

```bash
# 1. Clone and setup
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter
npm install

# 2. Start development
npm run dev
# → Opens http://localhost:5173

# 3. Get API key for testing
# Visit console.cloud.google.com → Enable YouTube Data API v3
```

**Test Setup**: Enter any channel (@mkbhd, @veritasium) to verify everything works!

---

## 📁 **Project Structure**

```
src/
├── js/
│   ├── components/     # UI components (App, VideoTable, etc.)
│   ├── services/       # API services (YouTube, analytics)
│   ├── utils/          # Helpers (formatting, storage, etc.)
│   └── main.js         # Entry point
├── css/styles.css      # Windows XP styling
└── index.html          # App shell

docs/                   # Documentation
vite.config.js         # Build configuration
package.json           # Dependencies and scripts
```

---

## 🛠️ **Development Workflow**

### **1. Create Your Branch**
```bash
git checkout -b feature/your-feature-name
# Examples: fix/chart-rendering, feature/dark-mode
```

### **2. Make Changes**
- **Components**: Add React-like components in `src/js/components/`
- **Services**: API logic goes in `src/js/services/`
- **Utilities**: Helpers in `src/js/utils/`
- **Styling**: Maintain Windows XP aesthetic in CSS

### **3. Test Locally**
```bash
npm run dev      # Development server
npm run test     # Run test suite
npm run build    # Test production build
npm run preview  # Preview production locally
```

### **4. Commit Standards**
```bash
git commit -m "type: brief description

- Specific changes made
- Reference issues: Fixes #123"

# Types: feat, fix, docs, style, refactor, test, chore
```

---

## 📐 **Code Standards**

### **ES6 Module Pattern**
```javascript
// src/js/components/VideoCard.js
import { formatNumber, formatDate } from '../utils/formatters.js';

export class VideoCard {
  constructor(video) {
    this.video = video;
    this.element = this.render();
  }
  
  render() {
    // Return DOM element
  }
}
```

### **Component Structure**
- **Constructor**: Initialize state and DOM
- **Render**: Create/update DOM elements  
- **Event handlers**: Handle user interactions
- **Cleanup**: Remove listeners when destroyed

### **Windows XP Styling**
```css
/* Maintain authentic XP aesthetic */
.button {
  border: 2px outset var(--xp-button-face);
  background: var(--xp-button-face);
  font-family: Tahoma, sans-serif;
}

.button:hover {
  background: var(--xp-button-hover);
}

.button:active {
  border: 2px inset var(--xp-button-face);
}
```

---

## 🧪 **Testing Guidelines**

### **Before Submitting**
- [ ] `npm run dev` works without errors
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Can analyze channels successfully
- [ ] Export functions work
- [ ] UI looks correct on mobile/desktop
- [ ] No console errors

### **Integration Tests**
Our tests verify:
- Component rendering and interactions
- YouTube API integration  
- Data processing and analytics
- Export functionality
- Windows XP styling preservation

---

## 🎯 **Contribution Areas**

### **🐛 Bug Fixes**
- Check [Issues](https://github.com/ronbronstein/youtube-exporter/issues)
- Small fixes: PR directly
- Large fixes: Create issue first

### **✨ Features**
- Review [project-management/](./project-management/) for planned features
- Create feature request issue for discussion
- Focus on user value and XP aesthetic

### **📚 Documentation**
- Keep docs current with code changes
- Add examples for new features
- Improve user guides and troubleshooting

### **🎨 UI/UX**
- Preserve authentic Windows XP design
- Improve usability while maintaining nostalgia
- Ensure mobile responsiveness

---

## 🔐 **Security Considerations**

### **API Key Handling**
- **Never hardcode** API keys in source
- **Test with your own** API key during development
- **Encrypt keys** before localStorage storage
- **Validate inputs** to prevent XSS

### **Best Practices**
- Sanitize all user inputs
- Use HTTPS URLs for external resources
- Follow principle of least privilege
- Test with restricted API keys

---

## 📚 **Resources**

### **Documentation**
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Component docs
- **[project-management/](./project-management/)** - Current tasks and epics

### **Development**
- **Vite Docs**: https://vitejs.dev/
- **YouTube API**: https://developers.google.com/youtube/v3
- **ES6 Modules**: Modern JavaScript patterns

---

## 🚀 **Deployment**

### **Automatic Deployment**
Every merge to `main` automatically deploys via GitHub Actions:

```bash
git push origin main
# → Builds with Vite
# → Deploys to GitHub Pages  
# → Live at ronbronstein.github.io/youtube-exporter/
```

### **Manual Testing**
```bash
npm run build && npm run preview
# Test production build locally before pushing
```

---

## 🙋 **Getting Help**

- **Questions**: Create a [Discussion](https://github.com/ronbronstein/youtube-exporter/discussions)
- **Bugs**: Open an [Issue](https://github.com/ronbronstein/youtube-exporter/issues)  
- **Ideas**: Check [project-management/](./project-management/) or start a discussion

## 🎉 **Recognition**

All contributors are recognized in our documentation and commit history. Quality contributions help improve the tool for everyone!

---

**Thank you for contributing to YouTube Research Hub!** 🚀

*Your efforts help creators worldwide make better content decisions.* ✨ 