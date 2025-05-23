# 🔐 API Security - YouTube Research Hub

## 🎯 **Security Philosophy**

YouTube Research Hub implements a **"Zero Trust"** approach to API key management:
- **No API keys** stored in code, repositories, or servers
- **User-controlled keys** for maximum security and cost control
- **Client-side encryption** when storage is necessary
- **Transparent practices** with open-source implementation

---

## 🔑 **API Key Management Strategies**

### **📱 Public Demo (GitHub Pages)**
```
🌐 LIVE DEMO SECURITY MODEL
├─ User Authentication: GitHub OAuth
├─ Key Storage: AES-256 encrypted localStorage  
├─ Key Scope: User's personal YouTube quota
├─ Data Flow: Browser ↔ YouTube API (direct)
└─ Server Knowledge: Zero (keys never sent to server)
```

**Implementation**:
```javascript
// Client-side encryption (never leaves browser)
async function encryptApiKey(key, userSession) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive key from user session + salt
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userSession.id + userSession.created),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    
    const cryptoKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
    );
    
    return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        salt: Array.from(salt),
        iv: Array.from(iv)
    };
}
```

### **💻 Local Development**
```
🏠 LOCAL DEVELOPMENT SECURITY
├─ Key Storage: Environment variables or manual input
├─ Key Scope: Developer's personal quota
├─ Data Flow: Local app ↔ YouTube API
└─ Security: Local machine protection
```

**Recommended Setup**:
```bash
# Option 1: Environment variable (recommended)
export YOUTUBE_API_KEY="AIzaSyYourApiKeyHere"
node test-server.js

# Option 2: Manual input each session
# Just open youtube_video_exporter.html and enter key
```

### **🤝 Contributor Testing**
```
👥 CONTRIBUTOR SECURITY MODEL
├─ Key Requirement: Each contributor uses their own key
├─ Key Storage: Local environment only
├─ Key Sharing: Never shared, each person gets their own
└─ Documentation: Clear setup instructions
```

---

## 🛡️ **YouTube API Key Security Best Practices**

### **1. Creating Secure API Keys**

**Step-by-Step Secure Setup**:
1. **Google Cloud Console** → [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create Project** → Use descriptive name: "YouTube Research Tool"
3. **Enable API** → Search "YouTube Data API v3" → Enable
4. **Create Credentials** → API Key

**⚠️ CRITICAL: Secure Your Key Immediately**:
```
🔒 API KEY RESTRICTIONS (Required!)

Application Restrictions:
├─ HTTP referrers (websites)
├─ Add referrers:
│   ├─ localhost/*                          # Local development
│   ├─ 127.0.0.1/*                         # Local testing
│   ├─ ronbronstein.github.io/*            # GitHub Pages
│   └─ your-custom-domain.com/*            # Custom domain
│
API Restrictions:
└─ Restrict key → Select APIs:
    └─ YouTube Data API v3 (only this API)

Quotas & Limits:
├─ Daily quota: 10,000 units (default)
├─ Queries per day: 1,000 (recommended limit)
└─ Queries per minute: 100 (rate limiting)
```

### **2. API Key Validation**

**Client-Side Validation**:
```javascript
/**
 * Validate YouTube API key format and accessibility
 * @param {string} apiKey - API key to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateApiKey(apiKey) {
    // Format validation
    if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
        return {
            valid: false,
            error: 'Invalid API key format. YouTube API keys start with "AIza" and are 39+ characters.'
        };
    }
    
    try {
        // Test API accessibility with minimal quota usage
        const testUrl = `${CONFIG.API.BASE_URL}/search?part=snippet&type=channel&q=test&maxResults=1&key=${apiKey}`;
        const response = await fetch(testUrl);
        const data = await response.json();
        
        if (data.error) {
            if (data.error.code === 403) {
                return {
                    valid: false,
                    error: 'API key access denied. Check your key restrictions and quotas.'
                };
            } else if (data.error.code === 400) {
                return {
                    valid: false,
                    error: 'Invalid API key. Please check your key and try again.'
                };
            }
            return {
                valid: false,
                error: `API Error: ${data.error.message}`
            };
        }
        
        return { valid: true };
        
    } catch (error) {
        return {
            valid: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
}
```

### **3. Quota Management**

**Understanding YouTube API Costs**:
```
📊 YOUTUBE API QUOTA COSTS

Search Operations:
├─ Search request: 100 units
├─ Channel details: 1 unit  
├─ Playlist items: 1 unit
└─ Video details: 1 unit

Typical Analysis Costs:
├─ 100 videos = ~300-400 units
├─ 500 videos = ~1,500 units  
├─ 1000 videos = ~3,000 units
└─ Daily limit: 10,000 units = ~2,500 videos
```

**Quota Monitoring**:
```javascript
function estimateQuotaCost(videoCount) {
    const searchCost = 100;  // Initial search
    const channelCost = 1;   // Channel details
    const playlistPages = Math.ceil(videoCount / 50);
    const playlistCost = playlistPages * 1;
    const videoBatches = Math.ceil(videoCount / 50);
    const videoCost = videoBatches * 1;
    
    return searchCost + channelCost + playlistCost + videoCost;
}

function showQuotaWarning(estimatedCost) {
    if (estimatedCost > 5000) {
        showWarning(`This analysis will use ~${estimatedCost} API quota units (${Math.round(estimatedCost/100)}% of daily limit). Continue?`);
    }
}
```

---

## 🚨 **Security Threats & Mitigations**

### **1. API Key Exposure**

**Threat**: API keys visible in browser dev tools
**Impact**: Unauthorized usage, quota theft
**Mitigation**:
```javascript
// ✅ GOOD: Key restrictions prevent abuse
const restrictedKey = "AIzaSy..."; // Even if exposed, restricted to specific domains

// ⚠️ RISK: Unprotected key
const unrestrictedKey = "AIzaSy..."; // Could be used from anywhere
```

**Additional Protection**:
- Always use HTTP referrer restrictions
- Monitor quota usage regularly
- Rotate keys periodically (quarterly recommended)
- Set up quota alerts in Google Cloud Console

### **2. Man-in-the-Middle Attacks**

**Threat**: API requests intercepted
**Impact**: Data exposure, request manipulation  
**Mitigation**:
- ✅ HTTPS-only connections to YouTube API
- ✅ Certificate pinning (handled by browsers)
- ✅ No sensitive data in URLs (keys in headers)

### **3. Client-Side Storage Attacks**

**Threat**: localStorage access by malicious scripts
**Impact**: API key theft
**Mitigation**:
```javascript
// ✅ GOOD: Encrypted storage with user-specific key
const encryptedKey = await encryptApiKey(apiKey, userSession);
localStorage.setItem('yt_key', JSON.stringify(encryptedKey));

// ❌ BAD: Plain text storage
localStorage.setItem('api_key', apiKey); // Never do this!
```

### **4. Session Hijacking**

**Threat**: User session compromise
**Impact**: Access to encrypted API keys
**Mitigation**:
- GitHub OAuth with proper scopes
- Session timeout after inactivity
- Secure logout (clear all encrypted data)
- No persistent sessions without user consent

---

## 🔍 **Security Audit Checklist**

### **Code Review Security Checklist**
- [ ] No API keys in source code
- [ ] No console.log() statements with sensitive data
- [ ] All external requests use HTTPS
- [ ] User input is sanitized before display
- [ ] Error messages don't leak sensitive information
- [ ] localStorage encryption is properly implemented
- [ ] Session management follows security best practices

### **Deployment Security Checklist**
- [ ] GitHub repository has no secrets in history
- [ ] Environment variables are properly configured
- [ ] HTTPS is enforced for all connections
- [ ] Content Security Policy headers are set
- [ ] No sensitive data in client-side logs
- [ ] API key restrictions are properly configured

### **User Security Checklist**
- [ ] API key setup instructions are clear
- [ ] Key restriction guidance is provided
- [ ] Quota monitoring is explained
- [ ] Secure logout procedure is documented
- [ ] Data privacy policy is transparent

---

## 📋 **Incident Response Plan**

### **If API Key is Compromised**

**Immediate Actions** (< 5 minutes):
1. **Disable the key** in Google Cloud Console
2. **Create a new key** with proper restrictions
3. **Update your local configuration**
4. **Clear browser storage** (`localStorage.clear()`)

**Investigation** (< 30 minutes):
1. Check Google Cloud Console usage logs
2. Review recent quota consumption
3. Identify unauthorized usage patterns
4. Document the incident

**Recovery** (< 1 hour):
1. Generate new restricted API key
2. Update all development environments
3. Notify users to refresh their sessions
4. Monitor for continued unauthorized usage

**Prevention**:
1. Implement better key restrictions
2. Add quota monitoring alerts
3. Review security practices
4. Update documentation

### **If User Data is Compromised**

**Assessment**:
- Determine scope (single user vs. multiple users)
- Identify data types affected
- Assess potential impact

**Response**:
1. **Immediate**: Notify affected users
2. **Short-term**: Implement additional security measures
3. **Long-term**: Review and improve security architecture

---

## 🎓 **Security Training for Contributors**

### **Essential Security Knowledge**
1. **API Key Management**: Never commit, always restrict
2. **HTTPS Everywhere**: All external communications encrypted
3. **Input Validation**: Sanitize all user input
4. **Error Handling**: Don't leak sensitive information
5. **Dependency Security**: Keep libraries updated

### **Security Code Review Guidelines**
```javascript
// ❌ SECURITY ISSUES TO CATCH

// 1. API key exposure
const apiKey = "AIzaSyExample123";  // Never hardcode

// 2. Unvalidated input
element.innerHTML = userInput;  // XSS vulnerability

// 3. Insecure storage
localStorage.setItem('key', apiKey);  // Plain text storage

// 4. Information leakage
console.log('API Response:', fullResponse);  // May contain sensitive data

// 5. Insecure requests
fetch('http://api.example.com/data');  // Should use HTTPS
```

---

## 📚 **Security Resources**

### **Documentation**
- [YouTube Data API Security](https://developers.google.com/youtube/v3/docs/security)
- [Google Cloud API Security Best Practices](https://cloud.google.com/apis/docs/security)
- [OWASP Client-Side Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Client_Side_Security_Cheat_Sheet.html)

### **Tools**
- [Google Cloud Console](https://console.cloud.google.com/) - API key management
- [GitHub Security Advisories](https://github.com/advisories) - Dependency vulnerabilities
- [Observatory by Mozilla](https://observatory.mozilla.org/) - Website security scanner

### **Regular Security Tasks**
- **Monthly**: Review API key usage and restrictions
- **Quarterly**: Rotate API keys
- **Annually**: Security architecture review
- **As needed**: Respond to security advisories

---

## 🔒 **Privacy Policy Summary**

### **Data We DON'T Collect**
- ❌ User API keys (encrypted locally only)
- ❌ YouTube analysis data
- ❌ Personal information beyond GitHub OAuth
- ❌ Usage analytics or tracking
- ❌ Browser fingerprinting data

### **Data We DO Process**
- ✅ GitHub OAuth tokens (for authentication only)
- ✅ YouTube API responses (processed locally, not stored)
- ✅ User preferences (stored locally)
- ✅ Error logs (no sensitive data included)

---

*Security is everyone's responsibility. When in doubt, ask questions and err on the side of caution.* 