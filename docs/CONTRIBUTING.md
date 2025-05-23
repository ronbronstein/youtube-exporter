# 🤝 Contributing to YouTube Research Hub

Welcome! We're excited you want to contribute to the YouTube Research Hub. This guide will help you get started quickly and effectively.

## 🚀 **Quick Start (60 seconds)**

```bash
# 1. Clone the repository
git clone https://github.com/ronbronstein/youtube-exporter.git
cd youtube-exporter

# 2. Open the main file
open youtube_video_exporter.html
# OR double-click the file in your file explorer

# 3. Start contributing!
# The single HTML file contains everything you need
```

**That's it!** No build process, no dependencies, no configuration. Just open the HTML file and start coding.

---

## 📋 **Before You Start**

### **Get Your YouTube API Key (Required for Testing)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Create credentials → API key
5. **Important**: Restrict your API key:
   - Application restrictions: HTTP referrers → Add `localhost/*` and your domain
   - API restrictions: Restrict to "YouTube Data API v3" only

### **Test Your Setup**
1. Open `youtube_video_exporter.html` in your browser
2. Enter your API key when prompted (stored locally only)
3. Try analyzing a channel: `@mkbhd` or `@veritasium`
4. If you see video results, you're ready to contribute! 🎉

---

## 🗂️ **Project Structure**

```
youtube-exporter/
├── youtube_video_exporter.html    # 🎯 Main application (single file)
├── test-server.js                 # 🧪 Local testing server
├── docs/                          # 📚 All documentation
│   ├── CONTRIBUTING.md            # This file
│   ├── CODE_STANDARDS.md          # Development standards
│   ├── TaskBoard.md               # Project roadmap
│   ├── ARCHITECTURE.md            # Technical overview
│   └── [other docs]               # User guides, API reference
├── .github/                       # 🔧 GitHub automation (coming soon)
└── README.md                      # Project overview
```

### **Why Single HTML File?**
- ✅ **Zero setup**: No build process or dependencies
- ✅ **Portable**: Works offline, easy to share
- ✅ **Beginner-friendly**: Lower barrier to entry
- ✅ **Deploy anywhere**: GitHub Pages, file hosting, CDN

---

## 🎯 **How to Contribute**

### **🐛 Found a Bug?**
1. Check existing [issues](https://github.com/ronbronstein/youtube-exporter/issues)
2. If not reported, create a new issue using the bug template
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior  
   - Browser and OS version
   - Console errors (if any)

### **💡 Have a Feature Idea?**
1. Check the [TaskBoard.md](./TaskBoard.md) to see if it's planned
2. Create a feature request issue
3. Discuss the approach before implementing large features

### **🔧 Want to Fix Something?**
1. **Small fixes** (typos, minor bugs): Create a PR directly
2. **Larger changes**: Create an issue first to discuss

---

## 📝 **Development Workflow**

### **Step 1: Set Up Your Branch**
```bash
# Create a feature branch
git checkout -b feature/your-feature-name
# Examples:
# git checkout -b fix/rate-limiting-bug
# git checkout -b feature/dark-mode
# git checkout -b docs/api-guide-update
```

### **Step 2: Make Your Changes**
- Edit `youtube_video_exporter.html` directly
- Follow our [Code Standards](./CODE_STANDARDS.md)
- Use the section markers: `/* ===== SECTION NAME ===== */`
- Add JSDoc comments for new functions

### **Step 3: Test Your Changes**
```bash
# Option 1: Open HTML file directly
open youtube_video_exporter.html

# Option 2: Use test server (if needed)
node test-server.js
# Then visit http://localhost:3000
```

**Testing Checklist**:
- [ ] Page loads without console errors
- [ ] Can analyze a channel successfully
- [ ] Export functions work (if modified)
- [ ] UI looks good on mobile and desktop
- [ ] No broken links or missing resources

### **Step 4: Commit and Push**
```bash
# Follow our commit message format
git add .
git commit -m "type: brief description

- Detailed changes as bullet points
- Reference issue numbers: #123"

# Examples:
# git commit -m "fix: resolve rate limiting calculation error

# - Fix getUserIP() fingerprinting collision
# - Add better error handling for quota exceeded
# - Fixes #42"

git push origin your-branch-name
```

### **Step 5: Create Pull Request**
- Use the PR template (coming soon)
- Link to related issues
- Add screenshots for UI changes
- Request review from maintainers

---

## 🧪 **Testing Guidelines**

### **Manual Testing**
Before submitting, test these scenarios:

**Basic Functionality**:
- [ ] Enter channel: `@mkbhd` → Should analyze ~100 videos
- [ ] Try handle: `@veritasium` → Should work the same
- [ ] Try URL: `youtube.com/c/mkbhd` → Should extract and work
- [ ] Invalid channel → Should show clear error message

**Features**:
- [ ] Keyword filtering: "review AND phone" → Should filter results
- [ ] View switching: List ↔ Grid → Both should display correctly
- [ ] Sorting: Click table headers → Should sort correctly
- [ ] Export: CSV, Markdown, Titles → Files should download

**Edge Cases**:
- [ ] Very short channel name: `@a` → Should handle gracefully
- [ ] Channel with no videos → Should show appropriate message
- [ ] Network interruption → Should show error, allow retry
- [ ] Invalid API key → Should show clear setup instructions

### **Browser Testing**
Test on these browsers (if possible):
- [ ] Chrome (latest)
- [ ] Firefox (latest)  
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)
- [ ] Mobile browser (any)

---

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- **Windows XP Theme**: Maintain the retro aesthetic
- **Accessibility**: Good contrast, keyboard navigation
- **Mobile-First**: Should work well on phones
- **Performance**: Fast loading, responsive interactions

### **CSS Organization**
```css
/* Follow this hierarchy in <style> section: */
:root { /* CSS variables */ }
* { /* Reset styles */ }
body { /* Base styles */ }
.component { /* Component styles */ }
@media { /* Responsive overrides */ }
```

### **Adding New UI Elements**
- Use existing CSS classes when possible
- Follow the XP button/panel styling
- Test on mobile devices
- Add hover states for interactive elements

---

## 🔍 **Code Organization**

### **JavaScript Structure**
The code is organized in clear sections:

```javascript
/* ===== TABLE OF CONTENTS ===== */
// Navigation guide

/* ===== CONFIGURATION SECTION ===== */
// CONFIG object, global variables

/* ===== UTILITY FUNCTIONS ===== */
// formatViewCount(), debugLog()

/* ===== API LAYER ===== */
// YouTube API interactions

/* ===== STORAGE & CACHING ===== */
// localStorage operations

/* ===== UI COMPONENTS ===== */
// DOM manipulation, panels

/* ===== MAIN ANALYSIS WORKFLOW ===== */
// analyzeChannelComplete()

/* ===== ANALYTICS ENGINE ===== */
// Data processing, insights

/* ===== DISPLAY & VIEW FUNCTIONS ===== */
// Video list/grid rendering

/* ===== EXPORT FUNCTIONS ===== */
// CSV, Markdown exports

/* ===== MESSAGE & LOADING FUNCTIONS ===== */
// User feedback

/* ===== EVENT HANDLERS & INITIALIZATION ===== */
// Setup and event binding
```

### **Adding New Functions**
1. **Find the right section** for your function
2. **Add to table of contents** if it's a major function
3. **Use descriptive names**: `getChannelData()`, `showLoadingSpinner()`
4. **Add JSDoc comments** for complex functions
5. **Group related functions** together

---

## 🛡️ **Security Guidelines**

### **API Key Handling**
- **NEVER** commit API keys to the repository
- Use environment variables for testing: `YOUTUBE_API_KEY=your_key`
- Client-side keys should be encrypted in localStorage
- Always validate API keys before use

### **User Data**
- No user data leaves the browser
- localStorage is used only for caching and preferences
- No tracking or analytics without user consent

### **External Resources**
- Use HTTPS URLs for all external resources
- Validate data from YouTube API before processing
- Sanitize user input for display

---

## 📚 **Documentation Standards**

### **Code Comments**
```javascript
/**
 * Process video data in batches for better performance
 * @param {Array<Object>} items - Video items from YouTube API
 * @param {string} apiKey - YouTube Data API v3 key
 * @returns {Promise<void>} Populates global videosData array
 */
async function processVideoDataBatched(items, apiKey) {
    // Implementation details...
}
```

### **Updating Documentation**
When you change functionality:
- [ ] Update relevant doc files in `/docs/`
- [ ] Update table of contents if needed
- [ ] Add examples for new features
- [ ] Update API_REFERENCE.md for new functions

---

## 🏷️ **Issue Labels**

We use these labels to organize work:

- 🐛 `bug` - Something isn't working
- ✨ `enhancement` - New feature or improvement
- 📚 `documentation` - Documentation updates
- 🎨 `ui/ux` - User interface changes
- 🔧 `tooling` - Development tools, build process
- 🆘 `help wanted` - Looking for contributors
- 🥇 `good first issue` - Perfect for new contributors
- 🚨 `priority: high` - Urgent issues
- 📦 `epic` - Large features spanning multiple PRs

---

## 🎯 **Current Priorities**

Check [TaskBoard.md](./TaskBoard.md) for the full roadmap. Current focus areas:

### **High Priority**
1. **GitHub OAuth Integration** - Secure API key management
2. **GitHub Pages Deployment** - Auto-deploying live demo
3. **Enhanced Error Handling** - Better user feedback

### **Good First Issues**
- UI improvements (mobile responsiveness)
- Additional export formats
- Browser compatibility fixes
- Documentation improvements

---

## 💬 **Getting Help**

### **Stuck on Something?**
1. Check existing [issues](https://github.com/ronbronstein/youtube-exporter/issues)
2. Read through [CODE_STANDARDS.md](./CODE_STANDARDS.md)
3. Look at recent commits for examples
4. Create a discussion or issue with your question

### **Want to Chat?**
- 💬 GitHub Discussions for general questions
- 🐛 GitHub Issues for bugs and features
- 📧 Email maintainers for private matters

---

## 🏆 **Recognition**

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor stats
- Potential future website/about page

---

## 📄 **License**

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## 🙏 **Thank You!**

Every contribution helps make YouTube Research Hub better for everyone. Whether you:
- Fix a typo
- Report a bug  
- Add a feature
- Improve documentation
- Help other contributors

**You're making a difference!** 🎉

---

*Questions about contributing? Create an issue or discussion - we're here to help!* 