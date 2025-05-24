(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/YoutubeExporter/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function debugLog(message, data = null) {
  console.log(`🔍 DEBUG: ${message}`, data);
}
class BaseComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...this.defaultOptions, ...options };
    this.eventListeners = /* @__PURE__ */ new Map();
    this.childComponents = /* @__PURE__ */ new Set();
    this.isDestroyed = false;
    debugLog(`🏗️ Creating component: ${this.constructor.name}`);
  }
  get defaultOptions() {
    return {};
  }
  // Lifecycle Methods
  init() {
    if (this.isDestroyed) {
      throw new Error("Cannot initialize destroyed component");
    }
    this.onCreate();
    this.render();
    this.onMount();
    return this;
  }
  onCreate() {
  }
  onMount() {
  }
  onUpdate(changes) {
  }
  onDestroy() {
  }
  // Rendering
  render() {
    if (this.isDestroyed) return;
    const content = this.template();
    if (content) {
      this.container.innerHTML = "";
      if (typeof content === "string") {
        this.container.innerHTML = content;
      } else {
        this.container.appendChild(content);
      }
    }
    this.onUpdate({});
  }
  template() {
    return "";
  }
  // Event Management
  addListener(element, event, handler, options = {}) {
    if (this.isDestroyed) return;
    const key = `${element.id || "element"}_${event}_${Date.now()}`;
    const boundHandler = handler.bind(this);
    element.addEventListener(event, boundHandler, options);
    this.eventListeners.set(key, {
      element,
      event,
      handler: boundHandler,
      options
    });
    return key;
  }
  removeListener(key) {
    const listener = this.eventListeners.get(key);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler, listener.options);
      this.eventListeners.delete(key);
    }
  }
  // Child Component Management
  addChild(component) {
    if (this.isDestroyed) return;
    this.childComponents.add(component);
    return component;
  }
  removeChild(component) {
    this.childComponents.delete(component);
    component.destroy();
  }
  // Safe DOM Helpers
  createElement(tag, attributes = {}, textContent = "") {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className" || key === "class") {
        element.className = value;
      } else if (key === "textContent") {
        element.textContent = value;
      } else if (key.startsWith("data-")) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }
  findElement(selector) {
    return this.container.querySelector(selector);
  }
  findElements(selector) {
    return this.container.querySelectorAll(selector);
  }
  // State Updates
  update(changes = {}) {
    if (this.isDestroyed) return;
    this.onUpdate(changes);
  }
  // Cleanup
  destroy() {
    if (this.isDestroyed) return;
    debugLog(`🗑️ Destroying component: ${this.constructor.name}`);
    this.childComponents.forEach((child) => child.destroy());
    this.childComponents.clear();
    this.eventListeners.forEach((listener, key) => {
      this.removeListener(key);
    });
    this.onDestroy();
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.isDestroyed = true;
  }
  // Utility Methods
  show() {
    if (this.container) {
      this.container.style.display = "";
    }
  }
  hide() {
    if (this.container) {
      this.container.style.display = "none";
    }
  }
  toggleVisibility(visible = null) {
    if (visible === null) {
      visible = this.container.style.display === "none";
    }
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }
  addClass(className) {
    if (this.container) {
      this.container.classList.add(className);
    }
  }
  removeClass(className) {
    if (this.container) {
      this.container.classList.remove(className);
    }
  }
  toggleClass(className, force = null) {
    if (this.container) {
      this.container.classList.toggle(className, force);
    }
  }
}
function formatViewCount(count) {
  if (count >= 1e9) {
    return (count / 1e9).toFixed(1) + "B";
  } else if (count >= 1e6) {
    return (count / 1e6).toFixed(1) + "M";
  } else if (count >= 1e3) {
    return (count / 1e3).toFixed(1) + "K";
  } else {
    return count.toLocaleString();
  }
}
function formatDuration(duration) {
  if (!duration) {
    return "0:00";
  }
  if (duration === "P0D" || duration === "PT0S") {
    return "0:00";
  }
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    console.warn("Unusual duration format (non-critical):", duration);
    return "0:00";
  }
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
function sanitizeURL(url) {
  if (!url || typeof url !== "string") {
    return "#";
  }
  const allowedSchemes = ["http:", "https:", "mailto:"];
  try {
    const parsedUrl = new URL(url);
    if (allowedSchemes.includes(parsedUrl.protocol)) {
      return url;
    }
  } catch (e) {
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return "#";
}
function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith("AIza") || apiKey.length < 35) {
    return {
      valid: false,
      error: 'Invalid API key format. YouTube API keys start with "AIza" and are 39+ characters.'
    };
  }
  return { valid: true };
}
class VideoList extends BaseComponent {
  constructor(container, options = {}) {
    super(container, options);
    this.videos = [];
    this.currentView = "list";
    this.sortColumn = null;
    this.sortDirection = "asc";
  }
  get defaultOptions() {
    return {
      enableSorting: true,
      enableViewSwitch: true,
      defaultView: "list"
    };
  }
  onCreate() {
    this.currentView = this.options.defaultView;
  }
  template() {
    return `
            <div class="video-list-component">
                ${this.renderViewControls()}
                <div class="video-content" id="videoContent"></div>
            </div>
        `;
  }
  renderViewControls() {
    if (!this.options.enableViewSwitch) return "";
    return `
            <div class="view-controls">
                <button 
                    id="listViewBtn" 
                    class="view-btn ${this.currentView === "list" ? "active" : ""}"
                    data-view="list">
                    📋 List
                </button>
                <button 
                    id="gridViewBtn" 
                    class="view-btn ${this.currentView === "grid" ? "active" : ""}"
                    data-view="grid">
                    ▦ Grid
                </button>
            </div>
        `;
  }
  onMount() {
    if (this.options.enableViewSwitch) {
      const listBtn = this.findElement("#listViewBtn");
      const gridBtn = this.findElement("#gridViewBtn");
      if (listBtn) {
        this.addListener(listBtn, "click", () => this.switchView("list"));
      }
      if (gridBtn) {
        this.addListener(gridBtn, "click", () => this.switchView("grid"));
      }
    }
  }
  // Public API
  setVideos(videos) {
    this.videos = videos || [];
    this.renderVideos();
  }
  switchView(view) {
    if (this.currentView === view) return;
    this.currentView = view;
    this.updateViewButtons();
    this.renderVideos();
    debugLog(`📺 Switched to ${view} view`);
  }
  sortBy(column, direction = null) {
    if (!this.options.enableSorting) return;
    if (this.sortColumn === column) {
      direction = direction || (this.sortDirection === "asc" ? "desc" : "asc");
    } else {
      direction = direction || "asc";
    }
    this.sortColumn = column;
    this.sortDirection = direction;
    this.videos.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];
      if (column === "publishedDate") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      let result = 0;
      if (aVal < bVal) result = -1;
      else if (aVal > bVal) result = 1;
      return direction === "desc" ? -result : result;
    });
    this.renderVideos();
    debugLog(`📊 Sorted by ${column} ${direction}`);
  }
  // Private Methods
  updateViewButtons() {
    const listBtn = this.findElement("#listViewBtn");
    const gridBtn = this.findElement("#gridViewBtn");
    if (listBtn) {
      listBtn.classList.toggle("active", this.currentView === "list");
    }
    if (gridBtn) {
      gridBtn.classList.toggle("active", this.currentView === "grid");
    }
  }
  renderVideos() {
    const contentContainer = this.findElement("#videoContent");
    if (!contentContainer) return;
    if (!this.videos || this.videos.length === 0) {
      contentContainer.innerHTML = this.renderEmptyState();
      return;
    }
    if (this.currentView === "grid") {
      this.renderGridView(contentContainer);
    } else {
      this.renderListView(contentContainer);
    }
  }
  renderEmptyState() {
    return `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--xp-text-disabled);">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No videos found</div>
                <div style="font-size: 14px;">Try adjusting your search criteria</div>
            </div>
        `;
  }
  renderListView(container) {
    container.className = "video-list";
    const table = this.createElement("table", { className: "video-table" });
    const thead = this.createElement("thead");
    const headerRow = this.createElement("tr");
    const columns = [
      { key: "title", label: "Title", sortable: true },
      { key: "publishedDate", label: "Date", sortable: true },
      { key: "viewCount", label: "Views", sortable: true },
      { key: "likeCount", label: "Likes", sortable: true },
      { key: "commentCount", label: "Comments", sortable: true },
      { key: "duration", label: "Duration", sortable: false }
    ];
    columns.forEach((col) => {
      const th = this.createElement("th", {
        textContent: col.label,
        "data-column": col.key
      });
      if (col.sortable && this.options.enableSorting) {
        th.style.cursor = "pointer";
        th.title = "Click to sort";
        if (this.sortColumn === col.key) {
          th.textContent += this.sortDirection === "asc" ? " ↑" : " ↓";
        }
        this.addListener(th, "click", () => this.sortBy(col.key));
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = this.createElement("tbody");
    this.videos.forEach((video) => {
      const row = this.createVideoRow(video);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
  }
  createVideoRow(video) {
    const row = this.createElement("tr");
    const titleCell = this.createElement("td", { className: "video-title-cell" });
    const titleLink = this.createElement("a", {
      href: sanitizeURL(video.url),
      target: "_blank",
      className: "video-title-link",
      textContent: video.title
    });
    const metaDiv = this.createElement("div", {
      className: "video-meta-small",
      textContent: video.description || ""
    });
    titleCell.appendChild(titleLink);
    titleCell.appendChild(metaDiv);
    row.appendChild(titleCell);
    row.appendChild(this.createElement("td", {
      className: "date-cell",
      textContent: video.publishedAt || ""
    }));
    row.appendChild(this.createElement("td", {
      className: "stats-cell",
      textContent: formatViewCount(video.viewCount || 0)
    }));
    row.appendChild(this.createElement("td", {
      className: "stats-cell",
      textContent: formatViewCount(video.likeCount || 0)
    }));
    row.appendChild(this.createElement("td", {
      className: "stats-cell",
      textContent: formatViewCount(video.commentCount || 0)
    }));
    row.appendChild(this.createElement("td", {
      className: "date-cell",
      textContent: video.duration || ""
    }));
    return row;
  }
  renderGridView(container) {
    container.className = "video-grid";
    container.innerHTML = "";
    this.videos.forEach((video) => {
      const card = this.createVideoCard(video);
      container.appendChild(card);
    });
  }
  createVideoCard(video) {
    const card = this.createElement("div", { className: "video-card" });
    const thumbnail = this.createElement("img", {
      src: sanitizeURL(video.thumbnail || ""),
      alt: "Video thumbnail",
      className: "video-thumbnail",
      loading: "lazy"
    });
    card.appendChild(thumbnail);
    const title = this.createElement("div", {
      className: "video-title",
      textContent: video.title || "Untitled"
    });
    card.appendChild(title);
    const metaDiv = this.createElement("div", { className: "video-meta" });
    metaDiv.appendChild(this.createElement("div", {
      textContent: `📅 ${video.publishedAt || "Unknown date"}`
    }));
    metaDiv.appendChild(this.createElement("div", {
      textContent: `⏱️ ${video.duration || "Unknown"}`
    }));
    metaDiv.appendChild(this.createElement("div", {
      textContent: `👀 ${formatViewCount(video.viewCount || 0)}`
    }));
    metaDiv.appendChild(this.createElement("div", {
      textContent: `👍 ${formatViewCount(video.likeCount || 0)}`
    }));
    card.appendChild(metaDiv);
    const statsDiv = this.createElement("div", { className: "video-stats" });
    statsDiv.appendChild(this.createElement("span", {
      textContent: `💬 ${formatViewCount(video.commentCount || 0)}`
    }));
    const watchLink = this.createElement("a", {
      href: sanitizeURL(video.url || ""),
      target: "_blank",
      className: "watch-btn",
      textContent: "▶️ Watch"
    });
    statsDiv.appendChild(watchLink);
    card.appendChild(statsDiv);
    return card;
  }
}
class LoadingSpinner extends BaseComponent {
  constructor(container, options = {}) {
    super(container, options);
    this.isVisible = false;
    this.currentMessage = "";
    this.progress = null;
  }
  get defaultOptions() {
    return {
      message: "Loading...",
      showProgress: false,
      overlay: true,
      spinnerType: "dots",
      // 'dots', 'spinner', 'bars'
      className: "loading-spinner"
    };
  }
  template() {
    return `
            <div class="loading-component ${this.options.overlay ? "loading-overlay" : ""}" style="display: none;">
                <div class="loading-content">
                    <div class="loading-animation ${this.options.spinnerType}">
                        ${this.renderSpinner()}
                    </div>
                    <div class="loading-text" id="loadingText">${this.options.message}</div>
                    ${this.options.showProgress ? '<div class="loading-progress" id="loadingProgress"></div>' : ""}
                </div>
            </div>
        `;
  }
  renderSpinner() {
    switch (this.options.spinnerType) {
      case "dots":
        return `
                    <div class="dots-spinner">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                `;
      case "bars":
        return `
                    <div class="bars-spinner">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                `;
      case "spinner":
      default:
        return '<div class="circle-spinner"></div>';
    }
  }
  // Public API
  show(message = null) {
    if (message) {
      this.setMessage(message);
    }
    this.container.style.display = "block";
    this.isVisible = true;
    debugLog(`🔄 Loading: ${this.currentMessage}`);
  }
  hide() {
    this.container.style.display = "none";
    this.isVisible = false;
    this.progress = null;
    debugLog("✅ Loading hidden");
  }
  setMessage(message) {
    this.currentMessage = message;
    const textElement = this.findElement("#loadingText");
    if (textElement) {
      textElement.textContent = message;
    }
  }
  setProgress(percent, message = null) {
    if (!this.options.showProgress) return;
    this.progress = Math.max(0, Math.min(100, percent));
    if (message) {
      this.setMessage(message);
    }
    const progressElement = this.findElement("#loadingProgress");
    if (progressElement) {
      progressElement.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(this.progress)}%</div>
            `;
    }
  }
  // Async helper methods
  async showForPromise(promise, message = "Loading...") {
    this.show(message);
    try {
      const result = await promise;
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }
  // Progress tracking for multiple operations
  startProgressTracking(total, baseMessage = "Processing") {
    this.setProgress(0, `${baseMessage}... (0/${total})`);
    return {
      update: (completed) => {
        const percent = completed / total * 100;
        this.setProgress(percent, `${baseMessage}... (${completed}/${total})`);
      },
      finish: () => {
        this.setProgress(100, "Complete!");
        setTimeout(() => this.hide(), 500);
      }
    };
  }
  onDestroy() {
    this.hide();
  }
}
let globalLoadingInstance = null;
const GlobalLoading = {
  init(container, options = {}) {
    if (globalLoadingInstance) {
      globalLoadingInstance.destroy();
    }
    globalLoadingInstance = new LoadingSpinner(container, {
      overlay: true,
      showProgress: true,
      ...options
    }).init();
    return globalLoadingInstance;
  },
  show(message) {
    if (globalLoadingInstance) {
      globalLoadingInstance.show(message);
    }
  },
  hide() {
    if (globalLoadingInstance) {
      globalLoadingInstance.hide();
    }
  },
  setMessage(message) {
    if (globalLoadingInstance) {
      globalLoadingInstance.setMessage(message);
    }
  },
  setProgress(percent, message) {
    if (globalLoadingInstance) {
      globalLoadingInstance.setProgress(percent, message);
    }
  },
  async forPromise(promise, message) {
    if (globalLoadingInstance) {
      return globalLoadingInstance.showForPromise(promise, message);
    }
    return promise;
  },
  startProgressTracking(total, baseMessage) {
    if (globalLoadingInstance) {
      return globalLoadingInstance.startProgressTracking(total, baseMessage);
    }
    return {
      update: () => {
      },
      finish: () => {
      }
    };
  }
};
class MessagePanel extends BaseComponent {
  constructor(container, options = {}) {
    super(container, options);
    this.messages = /* @__PURE__ */ new Map();
    this.nextId = 1;
  }
  get defaultOptions() {
    return {
      autoHide: true,
      autoHideDelay: {
        error: 1e4,
        success: 5e3,
        warning: 8e3,
        info: 6e3
      },
      allowDismiss: true,
      maxMessages: 5,
      position: "top"
      // 'top', 'bottom'
    };
  }
  template() {
    return `
            <div class="message-panel ${this.options.position}">
                <div class="message-container" id="messageContainer"></div>
            </div>
        `;
  }
  onMount() {
    this.clearAll();
  }
  // Public API
  showError(message, persistent = false) {
    return this.addMessage("error", message, persistent);
  }
  showSuccess(message, persistent = false) {
    return this.addMessage("success", message, persistent);
  }
  showWarning(message, persistent = false) {
    return this.addMessage("warning", message, persistent);
  }
  showInfo(message, persistent = false) {
    return this.addMessage("info", message, persistent);
  }
  addMessage(type, message, persistent = false) {
    const id = this.nextId++;
    if (this.messages.size >= this.options.maxMessages) {
      const oldestId = this.messages.keys().next().value;
      this.removeMessage(oldestId);
    }
    const messageData = {
      id,
      type,
      text: message,
      persistent,
      timestamp: Date.now()
    };
    this.messages.set(id, messageData);
    this.renderMessage(messageData);
    if (!persistent && this.options.autoHide) {
      const delay = this.options.autoHideDelay[type] || 5e3;
      setTimeout(() => {
        this.removeMessage(id);
      }, delay);
    }
    debugLog(`📢 ${type.toUpperCase()}: ${message}`);
    return id;
  }
  removeMessage(id) {
    const messageData = this.messages.get(id);
    if (!messageData) return;
    const messageElement = this.findElement(`[data-message-id="${id}"]`);
    if (messageElement) {
      messageElement.classList.add("message-exit");
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
        this.messages.delete(id);
      }, 300);
    } else {
      this.messages.delete(id);
    }
  }
  clearAll() {
    this.messages.clear();
    const container = this.findElement("#messageContainer");
    if (container) {
      container.innerHTML = "";
    }
  }
  clearType(type) {
    const messagesToRemove = [];
    this.messages.forEach((messageData, id) => {
      if (messageData.type === type) {
        messagesToRemove.push(id);
      }
    });
    messagesToRemove.forEach((id) => this.removeMessage(id));
  }
  // Private Methods
  renderMessage(messageData) {
    const container = this.findElement("#messageContainer");
    if (!container) return;
    const messageElement = this.createMessageElement(messageData);
    if (this.options.position === "bottom") {
      container.appendChild(messageElement);
    } else {
      container.insertBefore(messageElement, container.firstChild);
    }
    setTimeout(() => {
      messageElement.classList.add("message-enter");
    }, 10);
  }
  createMessageElement(messageData) {
    const element = this.createElement("div", {
      className: `message message-${messageData.type}`,
      "data-message-id": messageData.id,
      role: "alert",
      "aria-live": messageData.type === "error" ? "assertive" : "polite"
    });
    const icon = this.createElement("span", {
      className: "message-icon",
      textContent: this.getMessageIcon(messageData.type)
    });
    element.appendChild(icon);
    const content = this.createElement("div", { className: "message-content" });
    const prefix = this.createElement("strong", {
      textContent: `${messageData.type.charAt(0).toUpperCase() + messageData.type.slice(1)}:`
    });
    content.appendChild(prefix);
    const textNode = document.createTextNode(` ${messageData.text}`);
    content.appendChild(textNode);
    element.appendChild(content);
    if (this.options.allowDismiss) {
      const closeBtn = this.createElement("button", {
        className: "message-close",
        textContent: "×",
        title: "Dismiss message",
        "aria-label": "Close message"
      });
      this.addListener(closeBtn, "click", () => {
        this.removeMessage(messageData.id);
      });
      element.appendChild(closeBtn);
    }
    return element;
  }
  getMessageIcon(type) {
    const icons = {
      error: "❌",
      success: "✅",
      warning: "⚠️",
      info: "ℹ️"
    };
    return icons[type] || "ℹ️";
  }
}
let globalMessageInstance = null;
const GlobalMessages = {
  init(container, options = {}) {
    if (globalMessageInstance) {
      globalMessageInstance.destroy();
    }
    globalMessageInstance = new MessagePanel(container, {
      position: "top",
      maxMessages: 3,
      ...options
    }).init();
    return globalMessageInstance;
  },
  error(message, persistent = false) {
    if (globalMessageInstance) {
      return globalMessageInstance.showError(message, persistent);
    }
    console.error("Error:", message);
    return null;
  },
  success(message, persistent = false) {
    if (globalMessageInstance) {
      return globalMessageInstance.showSuccess(message, persistent);
    }
    console.log("Success:", message);
    return null;
  },
  warning(message, persistent = false) {
    if (globalMessageInstance) {
      return globalMessageInstance.showWarning(message, persistent);
    }
    console.warn("Warning:", message);
    return null;
  },
  info(message, persistent = false) {
    if (globalMessageInstance) {
      return globalMessageInstance.showInfo(message, persistent);
    }
    console.info("Info:", message);
    return null;
  },
  clear() {
    if (globalMessageInstance) {
      globalMessageInstance.clearAll();
    }
  },
  clearType(type) {
    if (globalMessageInstance) {
      globalMessageInstance.clearType(type);
    }
  }
};
const CONFIG = {
  API: {
    BASE_URL: "https://www.googleapis.com/youtube/v3",
    BATCH_SIZE: 50,
    QUOTA_COSTS: {
      search: 100,
      channel: 1,
      playlistItems: 1,
      videos: 1
    }
  },
  AUTH: {
    GITHUB_OAUTH_ENABLED: false,
    // OAuth disabled for static hosting
    CLIENT_ID: "",
    // Will be set based on environment
    REDIRECT_URI: "",
    // Will be set based on environment
    SCOPES: "read:user",
    // Minimal GitHub scopes needed
    STORAGE_KEY: "yt_encrypted_key",
    SESSION_KEY: "yt_github_session",
    SESSION_TIMEOUT: 24 * 60 * 60 * 1e3
    // 24 hours
  },
  ENVIRONMENT: {
    DETECTED: null,
    // Will be set on initialization
    LOCAL_DOMAINS: ["localhost", "127.0.0.1"],
    SUPPORTED_ENVIRONMENTS: ["live", "demo", "local-file", "local-server"]
  },
  UI: {
    CHART_COLORS: {
      primary: "rgb(0, 120, 212)",
      secondary: "rgb(76, 175, 80)",
      background: "rgba(0, 120, 212, 0.1)"
    },
    ANIMATION_DURATION: 400
  },
  STORAGE: {
    MAX_SAVED_SEARCHES: 10,
    CACHE_EXPIRY_HOURS: 24
  },
  DEMO: {
    ENABLED: false,
    // Will be set by environment detection
    MAX_VIDEOS_PER_ANALYSIS: 50,
    // Reduced from 100 for demo
    MAX_ANALYSES_PER_IP_PER_DAY: 5,
    // Increased from 3 for better demo experience
    GLOBAL_DAILY_LIMIT: 200,
    // Increased from 100
    RATE_LIMIT_STORAGE_KEY: "yt_demo_usage",
    API_QUOTA_PER_ANALYSIS: 150
    // Estimate: channel(1) + search(100) + videos(50)
  }
};
let globalState = {
  videosData: [],
  filteredData: [],
  youtubeApiKey: null,
  currentView: "list",
  currentSort: { column: null, direction: "asc" },
  apiMode: null,
  // 'local', 'web', or 'demo'
  isDemoMode: false,
  // Authentication & environment state
  currentEnvironment: null,
  githubUser: null,
  githubSession: null,
  isAuthenticated: false
};
function updateGlobalState(key, value) {
  globalState[key] = value;
}
function getGlobalState(key) {
  return globalState[key];
}
class DemoRateLimiter {
  constructor(config) {
    this.config = config;
    this.isDemoMode = false;
  }
  /**
   * Enable or disable demo mode
   * @param {boolean} enabled - Whether demo mode is active
   */
  setDemoMode(enabled) {
    this.isDemoMode = enabled;
  }
  /**
   * Check if user has exceeded rate limits
   * @returns {object} Rate limit status with allowed boolean and remaining count
   */
  checkRateLimit() {
    if (!this.isDemoMode) return { allowed: true, remaining: Infinity };
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const usage = this.getUsage();
    const userToday = usage.perIP[this.getUserIP()] || {};
    const userTodayCount = userToday[today] || 0;
    if (userTodayCount >= this.config.DEMO.MAX_ANALYSES_PER_IP_PER_DAY) {
      return {
        allowed: false,
        reason: "daily_limit_per_ip",
        remaining: 0,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1e3).toLocaleString()
      };
    }
    const globalToday = usage.global[today] || 0;
    if (globalToday >= this.config.DEMO.GLOBAL_DAILY_LIMIT) {
      return {
        allowed: false,
        reason: "global_daily_limit",
        remaining: 0,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1e3).toLocaleString()
      };
    }
    return {
      allowed: true,
      remaining: this.config.DEMO.MAX_ANALYSES_PER_IP_PER_DAY - userTodayCount,
      globalRemaining: this.config.DEMO.GLOBAL_DAILY_LIMIT - globalToday
    };
  }
  /**
   * Increment usage counters after a successful analysis
   */
  incrementUsage() {
    if (!this.isDemoMode) return;
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const usage = this.getUsage();
    const userIP = this.getUserIP();
    if (!usage.perIP[userIP]) usage.perIP[userIP] = {};
    usage.perIP[userIP][today] = (usage.perIP[userIP][today] || 0) + 1;
    usage.global[today] = (usage.global[today] || 0) + 1;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    Object.keys(usage.global).forEach((date) => {
      if (new Date(date) < sevenDaysAgo) {
        delete usage.global[date];
      }
    });
    Object.keys(usage.perIP).forEach((ip) => {
      Object.keys(usage.perIP[ip]).forEach((date) => {
        if (new Date(date) < sevenDaysAgo) {
          delete usage.perIP[ip][date];
        }
      });
    });
    localStorage.setItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY, JSON.stringify(usage));
  }
  /**
   * Get current usage data from localStorage
   * @returns {object} Usage data with perIP and global counters
   */
  getUsage() {
    try {
      const stored = localStorage.getItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { perIP: {}, global: {} };
    } catch (error) {
      return { perIP: {}, global: {} };
    }
  }
  /**
   * Generate a simple user fingerprint for rate limiting
   * Not perfect but good enough for demo abuse prevention
   * @returns {string} User fingerprint hash
   */
  getUserIP() {
    const fingerprint = [
      screen.width,
      screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.userAgent.substr(0, 50)
    ].join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  /**
   * Reset all usage data (for testing or admin purposes)
   */
  resetUsage() {
    localStorage.removeItem(this.config.DEMO.RATE_LIMIT_STORAGE_KEY);
  }
  /**
   * Get detailed usage statistics
   * @returns {object} Detailed usage information
   */
  getUsageStats() {
    var _a;
    const usage = this.getUsage();
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const userIP = this.getUserIP();
    return {
      todayGlobal: usage.global[today] || 0,
      todayUser: ((_a = usage.perIP[userIP]) == null ? void 0 : _a[today]) || 0,
      totalDays: Object.keys(usage.global).length,
      userFingerprint: userIP
    };
  }
}
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      apiCalls: [],
      memoryUsage: [],
      userInteractions: []
    };
    const isBrowser = typeof window !== "undefined";
    this.startTime = isBrowser ? performance.now() : Date.now();
    this.isProduction = isBrowser ? !window.__DEV__ : true;
    this.isBrowser = isBrowser;
  }
  // Track component render performance
  trackRender(componentName, renderFn) {
    if (!this.shouldTrack()) return renderFn();
    const start = this.isBrowser ? performance.now() : Date.now();
    const result = renderFn();
    const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
    this.metrics.renderTimes.push({
      component: componentName,
      duration,
      timestamp: Date.now()
    });
    if (duration > 16.67) {
      console.warn(`🐌 Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
    return result;
  }
  // Track API call performance
  trackApiCall(endpoint, promise) {
    if (!this.shouldTrack()) return promise;
    const start = this.isBrowser ? performance.now() : Date.now();
    const callId = Math.random().toString(36).substr(2, 9);
    return promise.then((result) => {
      const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
      this.metrics.apiCalls.push({
        id: callId,
        endpoint,
        duration,
        success: true,
        timestamp: Date.now()
      });
      if (duration > 5e3) {
        console.warn(`🐌 Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      return result;
    }).catch((error) => {
      const duration = (this.isBrowser ? performance.now() : Date.now()) - start;
      this.metrics.apiCalls.push({
        id: callId,
        endpoint,
        duration,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    });
  }
  // Track memory usage (browser only)
  trackMemoryUsage() {
    if (!this.shouldTrack() || !this.isBrowser || !performance.memory) return;
    const memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };
    this.metrics.memoryUsage.push(memory);
    const usagePercent = memory.used / memory.limit * 100;
    if (usagePercent > 80) {
      console.warn(`🚨 High memory usage: ${usagePercent.toFixed(1)}%`);
    }
    return memory;
  }
  // Track user interactions
  trackUserInteraction(action, metadata = {}) {
    if (!this.shouldTrack()) return;
    this.metrics.userInteractions.push({
      action,
      metadata,
      timestamp: Date.now(),
      sessionTime: Date.now() - this.startTime
    });
  }
  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      sessionDuration: Date.now() - this.startTime,
      totalRenders: this.metrics.renderTimes.length,
      averageRenderTime: this.getAverageRenderTime(),
      slowRenders: this.getSlowRenders(),
      totalApiCalls: this.metrics.apiCalls.length,
      failedApiCalls: this.getFailedApiCalls(),
      averageApiTime: this.getAverageApiTime(),
      memoryPeakUsage: this.getPeakMemoryUsage(),
      userInteractions: this.metrics.userInteractions.length
    };
    return summary;
  }
  // Helper methods
  shouldTrack() {
    return !this.isProduction || Math.random() < 0.1;
  }
  getAverageRenderTime() {
    if (this.metrics.renderTimes.length === 0) return 0;
    const total = this.metrics.renderTimes.reduce((sum, r) => sum + r.duration, 0);
    return total / this.metrics.renderTimes.length;
  }
  getSlowRenders() {
    return this.metrics.renderTimes.filter((r) => r.duration > 16.67);
  }
  getFailedApiCalls() {
    return this.metrics.apiCalls.filter((call) => !call.success);
  }
  getAverageApiTime() {
    if (this.metrics.apiCalls.length === 0) return 0;
    const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return total / this.metrics.apiCalls.length;
  }
  getPeakMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return null;
    return Math.max(...this.metrics.memoryUsage.map((m) => m.used));
  }
  // Log performance report
  logPerformanceReport() {
    const summary = this.getPerformanceSummary();
    console.group("📊 Performance Report");
    console.log("Session Duration:", (summary.sessionDuration / 1e3).toFixed(2) + "s");
    console.log("Total Renders:", summary.totalRenders);
    console.log("Average Render Time:", summary.averageRenderTime.toFixed(2) + "ms");
    console.log("Slow Renders:", summary.slowRenders.length);
    console.log("Total API Calls:", summary.totalApiCalls);
    console.log("Failed API Calls:", summary.failedApiCalls.length);
    console.log("Average API Time:", summary.averageApiTime.toFixed(2) + "ms");
    console.log("Peak Memory Usage:", summary.memoryPeakUsage ? (summary.memoryPeakUsage / 1024 / 1024).toFixed(2) + "MB" : "N/A");
    console.log("User Interactions:", summary.userInteractions);
    console.groupEnd();
    return summary;
  }
  // Start periodic monitoring (browser only)
  startMonitoring() {
    if (!this.shouldTrack() || !this.isBrowser) return;
    this.memoryInterval = setInterval(() => {
      this.trackMemoryUsage();
    }, 3e4);
    this.reportInterval = setInterval(() => {
      this.logPerformanceReport();
    }, 3e5);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        this.trackUserInteraction("visibilityChange", {
          hidden: document.hidden
        });
      });
    }
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.logPerformanceReport();
      });
    }
  }
  // Stop monitoring
  stopMonitoring() {
    if (this.memoryInterval) clearInterval(this.memoryInterval);
    if (this.reportInterval) clearInterval(this.reportInterval);
  }
}
class MemoryManager {
  static cleanup() {
    if (window.gc) {
      window.gc();
    }
    if (window.youtubeVideosCache && window.youtubeVideosCache.size > 1e3) {
      window.youtubeVideosCache.clear();
      console.log("🧹 Cleared video cache for memory optimization");
    }
  }
  static getMemoryStatus() {
    if (!performance.memory) return null;
    const memory = performance.memory;
    return {
      used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
      total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
      limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + "MB",
      usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(1) + "%"
    };
  }
}
const globalPerformanceMonitor = new PerformanceMonitor();
if (typeof window !== "undefined") {
  window.performanceMonitor = globalPerformanceMonitor;
  globalPerformanceMonitor.startMonitoring();
  window.getMemoryStatus = MemoryManager.getMemoryStatus;
  window.cleanupMemory = MemoryManager.cleanup;
}
class YouTubeApiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isDemoMode = false;
    this.isInitialized = false;
    this.performanceMonitor = globalPerformanceMonitor;
    this.rateLimiter = new DemoRateLimiter(CONFIG);
  }
  /**
   * Set the API key
   * @param {string} apiKey - YouTube API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  /**
   * Enable or disable demo mode
   * @param {boolean} enabled - Whether demo mode is active
   */
  setDemoMode(enabled) {
    this.isDemoMode = enabled;
    this.rateLimiter.setDemoMode(enabled);
  }
  /**
   * Get channel ID from various input formats
   * @param {string} channelInput - Channel URL, handle, or ID
   * @returns {Promise<string>} Channel ID
   */
  async getChannelId(channelInput) {
    let channelId = "";
    try {
      if (channelInput.includes("youtube.com/channel/")) {
        const parts = channelInput.split("youtube.com/channel/");
        if (parts.length > 1) {
          channelId = parts[1].split("/")[0];
        }
      } else if (channelInput.includes("youtube.com/@")) {
        const parts = channelInput.split("youtube.com/@");
        if (parts.length > 1) {
          const handle = parts[1].split("/")[0];
          channelId = await this.getChannelIdFromHandle(handle);
        }
      } else if (channelInput.startsWith("@")) {
        const handle = channelInput.substring(1);
        channelId = await this.getChannelIdFromHandle(handle);
      } else {
        channelId = await this.getChannelIdFromHandle(channelInput);
      }
      if (!channelId) {
        throw new Error("Could not extract channel ID");
      }
      return channelId;
    } catch (error) {
      throw new Error(`Channel parsing failed: ${error.message}`);
    }
  }
  /**
   * Get channel ID from handle using YouTube API
   * @param {string} handle - Channel handle (without @)
   * @returns {Promise<string>} Channel ID
   */
  async getChannelIdFromHandle(handle) {
    var _a, _b;
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/channels?part=id&forHandle=${handle}&key=${this.apiKey}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
      const searchResponse = await fetch(`${CONFIG.API.BASE_URL}/search?part=snippet&type=channel&q=${handle}&key=${this.apiKey}&maxResults=1`);
      const searchData = await searchResponse.json();
      if (searchData.error) {
        throw new Error(searchData.error.message);
      }
      if (searchData.items && searchData.items.length > 0) {
        return ((_a = searchData.items[0].id) == null ? void 0 : _a.channelId) || ((_b = searchData.items[0].snippet) == null ? void 0 : _b.channelId);
      }
      throw new Error("Channel not found");
    } catch (error) {
      throw new Error(`Handle lookup failed: ${error.message}`);
    }
  }
  /**
   * Get channel data including uploads playlist ID
   * @param {string} channelInput - Channel URL, handle, or ID
   * @returns {Promise<object>} Channel data with channelId and uploadsPlaylistId
   */
  async getChannelData(channelInput) {
    const channelId = await this.getChannelId(channelInput);
    const response = await fetch(`${CONFIG.API.BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`);
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }
    const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
    return {
      channelId,
      uploadsPlaylistId
    };
  }
  /**
   * Get ALL videos from uploads playlist (comprehensive channel analysis)
   * @param {string} uploadsPlaylistId - Channel's uploads playlist ID
   * @param {function} progressCallback - Callback for progress updates
   * @returns {Promise<Array>} Array of video objects
   */
  async getAllChannelVideos(uploadsPlaylistId, progressCallback = null) {
    let allVideos = [];
    let nextPageToken = null;
    let pageCount = 0;
    const maxResults = CONFIG.API.BATCH_SIZE;
    const videoLimit = this.isDemoMode ? CONFIG.DEMO.MAX_VIDEOS_PER_ANALYSIS : Infinity;
    let videosCollected = 0;
    do {
      let playlistUrl = `${CONFIG.API.BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`;
      if (nextPageToken) {
        playlistUrl += `&pageToken=${nextPageToken}`;
      }
      debugLog(`Fetching uploads page ${pageCount + 1}`, { url: playlistUrl.replace(this.apiKey, "HIDDEN") });
      const response = await fetch(playlistUrl);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      if (data.items && data.items.length > 0) {
        const videos = data.items.map((item) => ({
          id: { videoId: item.snippet.resourceId.videoId },
          snippet: item.snippet
        }));
        const videosToAdd = videos.slice(0, Math.max(0, videoLimit - videosCollected));
        allVideos = allVideos.concat(videosToAdd);
        videosCollected += videosToAdd.length;
        debugLog(`Fetched ${data.items.length} videos, added ${videosToAdd.length}, total: ${allVideos.length}`);
        if (progressCallback) {
          if (this.isDemoMode) {
            progressCallback(`Demo Mode: Fetching videos... Found ${allVideos.length}/${videoLimit} (limited for cost control)`);
          } else {
            progressCallback(`Fetching complete video library... Found ${allVideos.length} so far`);
          }
        }
        if (this.isDemoMode && videosCollected >= videoLimit) {
          debugLog(`Demo mode: Reached video limit of ${videoLimit}`);
          break;
        }
      }
      nextPageToken = data.nextPageToken;
      pageCount++;
      if (pageCount >= 100) {
        debugLog("Reached maximum page limit (100 pages = ~5000 videos)");
        break;
      }
    } while (nextPageToken && (!this.isDemoMode || videosCollected < videoLimit));
    debugLog(`Total videos from uploads playlist: ${allVideos.length}${this.isDemoMode ? ` (demo limited to ${videoLimit})` : ""}`);
    return allVideos;
  }
  /**
   * Process videos in batches to get detailed information
   * @param {Array} items - Array of video items from playlist
   * @param {function} progressCallback - Callback for progress updates
   * @returns {Promise<Array>} Array of processed video objects with details
   */
  async processVideoDataBatched(items, progressCallback = null) {
    if (!items || items.length === 0) {
      throw new Error("No videos found");
    }
    let videosData = [];
    const batchSize = CONFIG.API.BATCH_SIZE;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const videoIds = batch.map((item) => {
        var _a;
        return (_a = item.id) == null ? void 0 : _a.videoId;
      }).filter(Boolean).join(",");
      if (!videoIds) continue;
      if (progressCallback) {
        progressCallback(`Processing video details... ${i + batch.length}/${items.length}`);
      }
      try {
        const detailsResponse = await fetch(`${CONFIG.API.BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`);
        const detailsData = await detailsResponse.json();
        if (detailsData.error) {
          throw new Error(detailsData.error.message);
        }
        if (detailsData.items) {
          const batchVideos = detailsData.items.map((video) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
            return {
              title: ((_a = video.snippet) == null ? void 0 : _a.title) || "No title",
              description: (((_b = video.snippet) == null ? void 0 : _b.description) || "").substring(0, 150) + "...",
              fullDescription: ((_c = video.snippet) == null ? void 0 : _c.description) || "",
              publishedAt: ((_d = video.snippet) == null ? void 0 : _d.publishedAt) ? new Date(video.snippet.publishedAt).toLocaleDateString() : "Unknown",
              publishedDate: ((_e = video.snippet) == null ? void 0 : _e.publishedAt) ? new Date(video.snippet.publishedAt) : /* @__PURE__ */ new Date(),
              channelTitle: ((_f = video.snippet) == null ? void 0 : _f.channelTitle) || "Unknown channel",
              viewCount: parseInt(((_g = video.statistics) == null ? void 0 : _g.viewCount) || 0),
              likeCount: parseInt(((_h = video.statistics) == null ? void 0 : _h.likeCount) || 0),
              commentCount: parseInt(((_i = video.statistics) == null ? void 0 : _i.commentCount) || 0),
              duration: formatDuration((_j = video.contentDetails) == null ? void 0 : _j.duration),
              videoId: video.id,
              url: `https://youtube.com/watch?v=${video.id}`,
              thumbnail: ((_m = (_l = (_k = video.snippet) == null ? void 0 : _k.thumbnails) == null ? void 0 : _l.medium) == null ? void 0 : _m.url) || ((_p = (_o = (_n = video.snippet) == null ? void 0 : _n.thumbnails) == null ? void 0 : _o.default) == null ? void 0 : _p.url) || "",
              tags: ((_q = video.snippet) == null ? void 0 : _q.tags) || []
            };
          });
          videosData = videosData.concat(batchVideos);
        }
      } catch (error) {
        debugLog(`Batch processing error for batch starting at ${i}`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return videosData;
  }
  /**
   * Validate YouTube API key
   * @param {string} apiKey - API key to validate
   * @returns {Promise<object>} Validation result with valid boolean and error message
   */
  async validateApiKey(apiKey) {
    if (!apiKey || !apiKey.startsWith("AIza") || apiKey.length < 35) {
      return {
        valid: false,
        error: 'Invalid API key format. YouTube API keys start with "AIza" and are 39+ characters.'
      };
    }
    try {
      const testUrl = `${CONFIG.API.BASE_URL}/search?part=snippet&type=channel&q=test&maxResults=1&key=${apiKey}`;
      const response = await fetch(testUrl);
      const data = await response.json();
      if (data.error) {
        if (data.error.code === 403) {
          return {
            valid: false,
            error: "API key access denied. Check your key restrictions and quotas."
          };
        } else if (data.error.code === 400) {
          return {
            valid: false,
            error: "Invalid API key. Please check your key and try again."
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
        error: "Network error. Please check your connection and try again."
      };
    }
  }
  /**
   * Get comprehensive channel statistics and branding information
   * @param {string} channelId - Channel ID
   * @returns {Promise<object>} Complete channel analytics data
   */
  async getChannelAnalytics(channelId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/channels?part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}&key=${this.apiKey}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      if (!data.items || data.items.length === 0) {
        throw new Error("Channel not found");
      }
      const channel = data.items[0];
      return {
        // Basic info
        title: ((_a = channel.snippet) == null ? void 0 : _a.title) || "Unknown",
        description: ((_b = channel.snippet) == null ? void 0 : _b.description) || "",
        customUrl: ((_c = channel.snippet) == null ? void 0 : _c.customUrl) || "",
        publishedAt: (_d = channel.snippet) == null ? void 0 : _d.publishedAt,
        // Statistics  
        subscriberCount: parseInt(((_e = channel.statistics) == null ? void 0 : _e.subscriberCount) || 0),
        videoCount: parseInt(((_f = channel.statistics) == null ? void 0 : _f.videoCount) || 0),
        totalViewCount: parseInt(((_g = channel.statistics) == null ? void 0 : _g.viewCount) || 0),
        // Branding insights
        keywords: ((_i = (_h = channel.brandingSettings) == null ? void 0 : _h.channel) == null ? void 0 : _i.keywords) || "",
        defaultLanguage: ((_k = (_j = channel.brandingSettings) == null ? void 0 : _j.channel) == null ? void 0 : _k.defaultLanguage) || "",
        bannerImageUrl: ((_m = (_l = channel.brandingSettings) == null ? void 0 : _l.image) == null ? void 0 : _m.bannerExternalUrl) || "",
        // Upload patterns
        uploadsPlaylistId: (_o = (_n = channel.contentDetails) == null ? void 0 : _n.relatedPlaylists) == null ? void 0 : _o.uploads,
        // Calculated metrics
        avgViewsPerVideo: Math.round(parseInt(((_p = channel.statistics) == null ? void 0 : _p.viewCount) || 0) / Math.max(1, parseInt(((_q = channel.statistics) == null ? void 0 : _q.videoCount) || 1))),
        channelAgeYears: ((_r = channel.snippet) == null ? void 0 : _r.publishedAt) ? Math.round((Date.now() - new Date(channel.snippet.publishedAt).getTime()) / (365.25 * 24 * 60 * 60 * 1e3) * 10) / 10 : 0
      };
    } catch (error) {
      throw new Error(`Channel analytics failed: ${error.message}`);
    }
  }
  /**
   * Detect video content types and formats
   * @param {object} video - Video object from API
   * @returns {object} Content classification
   */
  classifyVideoContent(video) {
    var _a, _b, _c, _d, _e;
    const duration = ((_a = video.contentDetails) == null ? void 0 : _a.duration) || "";
    const title = ((_b = video.snippet) == null ? void 0 : _b.title) || "";
    const isLive = ((_c = video.snippet) == null ? void 0 : _c.liveBroadcastContent) === "live";
    const wasLive = ((_d = video.snippet) == null ? void 0 : _d.liveBroadcastContent) === "none" && ((_e = video.contentDetails) == null ? void 0 : _e.duration) && video.contentDetails.duration.includes("H");
    const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt((durationMatch == null ? void 0 : durationMatch[1]) || 0);
    const minutes = parseInt((durationMatch == null ? void 0 : durationMatch[2]) || 0);
    const seconds = parseInt((durationMatch == null ? void 0 : durationMatch[3]) || 0);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return {
      isShort: totalSeconds <= 60 && totalSeconds > 0,
      isLong: totalSeconds > 1800,
      // 30+ minutes
      isLive,
      wasLivestream: wasLive,
      contentType: totalSeconds <= 60 ? "short" : totalSeconds > 1800 ? "long-form" : "standard",
      durationSeconds: totalSeconds,
      liveIndicators: {
        hasLiveInTitle: /\b(live|stream|streaming)\b/i.test(title),
        hasQAInTitle: /\b(q&a|questions|qa)\b/i.test(title)
      }
    };
  }
  async makeApiCall(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error("API key not set");
    }
    const allParams = {
      key: this.apiKey,
      ...params
    };
    const url = `${CONFIG.API.BASE_URL}/${endpoint}?${new URLSearchParams(allParams)}`;
    const fetchPromise = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      return response.json();
    });
    return this.performanceMonitor ? this.performanceMonitor.trackApiCall(endpoint, fetchPromise) : fetchPromise;
  }
}
class StorageService {
  constructor() {
    this.isAvailable = this.checkLocalStorageAvailability();
  }
  // Check if localStorage is available
  checkLocalStorageAvailability() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      debugLog("localStorage not available", error);
      return false;
    }
  }
  /* ===== ANALYSIS CACHING ===== */
  /**
   * Save channel analysis to localStorage with metadata
   * @param {string} channelId - Channel identifier
   * @param {Array} data - Video data array
   */
  saveAnalysis(channelId, data) {
    if (!this.isAvailable) return false;
    try {
      const analysis = {
        channelId,
        data,
        timestamp: Date.now(),
        date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        videoCount: data.length
      };
      localStorage.setItem(`analysis_${channelId}`, JSON.stringify(analysis));
      debugLog("Analysis saved to localStorage", {
        channelId,
        videoCount: data.length,
        size: Math.round(JSON.stringify(analysis).length / 1024) + "KB"
      });
      return true;
    } catch (error) {
      debugLog("Failed to save analysis", error);
      return false;
    }
  }
  /**
   * Load channel analysis from localStorage
   * @param {string} channelId - Channel identifier
   * @returns {Array|null} Video data or null if not found
   */
  loadAnalysis(channelId) {
    var _a;
    if (!this.isAvailable) return null;
    try {
      const saved = localStorage.getItem(`analysis_${channelId}`);
      if (saved) {
        const analysis = JSON.parse(saved);
        const ageHours = Math.round((Date.now() - analysis.timestamp) / (1e3 * 60 * 60));
        debugLog("Loaded analysis from cache", {
          channelId,
          ageHours,
          videoCount: ((_a = analysis.data) == null ? void 0 : _a.length) || 0
        });
        return analysis.data;
      }
    } catch (error) {
      debugLog("Failed to load analysis", error);
    }
    return null;
  }
  /**
   * Clear cached analysis for a specific channel
   * @param {string} channelId - Channel identifier
   */
  clearAnalysis(channelId) {
    if (!this.isAvailable) return false;
    try {
      localStorage.removeItem(`analysis_${channelId}`);
      debugLog("Analysis cache cleared", { channelId });
      return true;
    } catch (error) {
      debugLog("Failed to clear analysis cache", error);
      return false;
    }
  }
  /* ===== SAVED SEARCHES ===== */
  /**
   * Get all saved searches
   * @returns {Array} Array of saved search objects
   */
  getSavedSearches() {
    if (!this.isAvailable) return [];
    try {
      const saved = localStorage.getItem("youtubeSearches");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      debugLog("Failed to load saved searches", error);
      return [];
    }
  }
  /**
   * Save a new search to the saved searches list
   * @param {Object} searchData - Search configuration object
   */
  saveSearch(searchData) {
    var _a;
    if (!this.isAvailable) return false;
    try {
      const search = {
        id: Date.now(),
        name: searchData.name || `${searchData.channel}${searchData.keywords ? ` (${searchData.keywords})` : ""}`,
        channel: searchData.channel,
        keywords: searchData.keywords || "",
        logic: searchData.logic || "OR",
        order: searchData.order || "date",
        date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        videoCount: searchData.videoCount || 0,
        timestamp: Date.now()
      };
      const savedSearches = this.getSavedSearches();
      savedSearches.unshift(search);
      const maxSearches = ((_a = CONFIG.STORAGE) == null ? void 0 : _a.MAX_SAVED_SEARCHES) || 50;
      if (savedSearches.length > maxSearches) {
        savedSearches.splice(maxSearches);
      }
      localStorage.setItem("youtubeSearches", JSON.stringify(savedSearches));
      debugLog("Search saved", { searchId: search.id, name: search.name });
      return search;
    } catch (error) {
      debugLog("Failed to save search", error);
      return false;
    }
  }
  /**
   * Delete a saved search by ID
   * @param {number} searchId - Search ID to delete
   */
  deleteSavedSearch(searchId) {
    if (!this.isAvailable) return false;
    try {
      const savedSearches = this.getSavedSearches();
      const filtered = savedSearches.filter((s) => s.id !== searchId);
      localStorage.setItem("youtubeSearches", JSON.stringify(filtered));
      debugLog("Search deleted", { searchId });
      return true;
    } catch (error) {
      debugLog("Failed to delete search", error);
      return false;
    }
  }
  /**
   * Find a saved search by ID
   * @param {number} searchId - Search ID to find
   * @returns {Object|null} Search object or null if not found
   */
  getSavedSearch(searchId) {
    const savedSearches = this.getSavedSearches();
    return savedSearches.find((s) => s.id === searchId) || null;
  }
  /**
   * Clear all saved searches
   */
  clearAllSavedSearches() {
    if (!this.isAvailable) return false;
    try {
      localStorage.removeItem("youtubeSearches");
      debugLog("All saved searches cleared");
      return true;
    } catch (error) {
      debugLog("Failed to clear saved searches", error);
      return false;
    }
  }
  /* ===== API KEY STORAGE ===== */
  /**
   * Save API key to localStorage
   * @param {string} apiKey - YouTube API key
   */
  saveApiKey(apiKey) {
    if (!this.isAvailable) return false;
    try {
      if (apiKey && apiKey.startsWith("AIza")) {
        localStorage.setItem("youtubeApiKey", apiKey);
        debugLog("✅ API key saved to localStorage");
        return true;
      }
      return false;
    } catch (error) {
      debugLog("Failed to save API key", error);
      return false;
    }
  }
  /**
   * Load saved API key from localStorage
   * @returns {string|null} API key or null if not found
   */
  loadSavedApiKey() {
    if (!this.isAvailable) return null;
    try {
      const savedKey = localStorage.getItem("youtubeApiKey");
      if (savedKey && savedKey.startsWith("AIza")) {
        debugLog("✅ Client API key loaded from localStorage");
        return savedKey;
      }
    } catch (error) {
      debugLog("Error loading saved API key", error);
    }
    return null;
  }
  /**
   * Clear saved API key
   */
  clearApiKey() {
    if (!this.isAvailable) return false;
    try {
      localStorage.removeItem("youtubeApiKey");
      debugLog("API key cleared from localStorage");
      return true;
    } catch (error) {
      debugLog("Failed to clear API key", error);
      return false;
    }
  }
  /* ===== GENERAL UTILITIES ===== */
  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }
    try {
      let totalSize = 0;
      let itemCount = 0;
      const items = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          itemCount++;
          if (key.startsWith("analysis_")) {
            items.analyses = (items.analyses || 0) + 1;
          } else if (key === "youtubeSearches") {
            items.savedSearches = JSON.parse(value).length;
          } else if (key === "youtubeApiKey") {
            items.apiKey = true;
          }
        }
      }
      return {
        available: true,
        totalSizeKB: Math.round(totalSize / 1024),
        itemCount,
        items,
        quotaUsedPercent: Math.round(totalSize / (5 * 1024 * 1024) * 100)
        // Assume 5MB quota
      };
    } catch (error) {
      debugLog("Failed to get storage info", error);
      return { available: false, error: error.message };
    }
  }
  /**
   * Clear all YouTube Research Hub data from localStorage
   */
  clearAllData() {
    if (!this.isAvailable) return false;
    try {
      const keysToRemove = [];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          if (key.startsWith("analysis_") || key === "youtubeSearches" || key === "youtubeApiKey" || key.startsWith("demo_usage_")) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      debugLog("All YouTube Research Hub data cleared", {
        keysRemoved: keysToRemove.length
      });
      return true;
    } catch (error) {
      debugLog("Failed to clear all data", error);
      return false;
    }
  }
}
function createStorageService() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    return new StorageService();
  } else {
    return {
      isAvailable: false,
      checkLocalStorageAvailability: () => false,
      saveAnalysis: () => false,
      loadAnalysis: () => null,
      clearAnalysis: () => false,
      getSavedSearches: () => [],
      saveSearch: () => false,
      deleteSavedSearch: () => false,
      getSavedSearch: () => null,
      clearAllSavedSearches: () => false,
      saveApiKey: () => false,
      loadSavedApiKey: () => null,
      clearApiKey: () => false,
      getStorageInfo: () => ({ available: false }),
      clearAllData: () => false
    };
  }
}
const storageService = createStorageService();
class AnalyticsService {
  constructor() {
    this.videosData = [];
    this.chartInstance = null;
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
    var _a, _b;
    if (this.videosData.length === 0) {
      return null;
    }
    debugLog("Generating content analysis for", this.videosData.length);
    const totalViews = this.videosData.reduce((sum, video) => sum + video.viewCount, 0);
    const avgViews = Math.round(totalViews / this.videosData.length);
    const topVideo = this.videosData.reduce(
      (max, video) => video.viewCount > max.viewCount ? video : max
    );
    const totalVideos = this.videosData.length;
    const sortedByDate = [...this.videosData].sort((a, b) => b.publishedDate - a.publishedDate);
    const oldestDate = (_a = sortedByDate[sortedByDate.length - 1]) == null ? void 0 : _a.publishedDate;
    const newestDate = (_b = sortedByDate[0]) == null ? void 0 : _b.publishedDate;
    const monthsDiff = oldestDate ? (newestDate - oldestDate) / (1e3 * 60 * 60 * 24 * 30) : 1;
    const videosPerMonth = Math.round(totalVideos / monthsDiff);
    const avgTitleLength = Math.round(
      this.videosData.reduce((sum, video) => sum + video.title.length, 0) / this.videosData.length
    );
    const avgEngagement = this.videosData.length > 0 ? (this.videosData.reduce((sum, video) => {
      return sum + (video.viewCount > 0 ? (video.likeCount + video.commentCount) / video.viewCount : 0);
    }, 0) / this.videosData.length * 100).toFixed(2) : "0.00";
    return {
      totalVideos,
      totalViews,
      avgViews,
      videosPerMonth,
      avgTitleLength,
      avgEngagement,
      topVideo: {
        title: topVideo.title,
        views: topVideo.viewCount,
        viewsFormatted: formatViewCount(topVideo.viewCount)
      }
    };
  }
  /**
   * Generate content analysis HTML panel
   * @returns {string} HTML string for analysis panel
   */
  generateContentAnalysisHTML() {
    const analysis = this.generateContentAnalysis();
    if (!analysis) return "";
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
                        <h4>${(analysis.topVideo.views / 1e6).toFixed(1)}M</h4>
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
    const avgViews = this.videosData.reduce((sum, v) => sum + v.viewCount, 0) / this.videosData.length;
    const viralThreshold = avgViews * 3;
    const viralVideos = this.videosData.filter((video) => video.viewCount >= viralThreshold).sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    debugLog("Viral content analysis", {
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
    const titles = this.videosData.map((v) => v.title);
    const avgLength = Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length);
    const stopWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should"
    ];
    const allWords = titles.join(" ").toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 2 && !stopWords.includes(word));
    const wordCounts = {};
    allWords.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    const commonWords = Object.entries(wordCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([word]) => word);
    const questionTitles = titles.filter((title) => title.includes("?")).length;
    const questionPercent = Math.round(questionTitles / titles.length * 100);
    return { avgLength, commonWords, questionPercent };
  }
  /**
   * Analyze upload schedule for optimal timing
   * @returns {Object} Upload schedule analysis
   */
  analyzeUploadSchedule() {
    var _a;
    if (this.videosData.length === 0) {
      return { bestDay: "Unknown", mostActiveDay: "Unknown", consistency: "Unknown" };
    }
    const dayViews = {};
    const dayCounts = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.videosData.forEach((video) => {
      const day = dayNames[video.publishedDate.getDay()];
      dayViews[day] = (dayViews[day] || 0) + video.viewCount;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    let bestDay = "Monday";
    let bestAvgViews = 0;
    Object.keys(dayViews).forEach((day) => {
      const avgViews = dayViews[day] / dayCounts[day];
      if (avgViews > bestAvgViews) {
        bestAvgViews = avgViews;
        bestDay = day;
      }
    });
    const mostActiveDay = ((_a = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]) == null ? void 0 : _a[0]) || "Monday";
    const uploadDays = Object.keys(dayCounts).length;
    const consistency = uploadDays >= 5 ? "High" : uploadDays >= 3 ? "Medium" : "Low";
    return { bestDay, mostActiveDay, consistency };
  }
  /**
   * Generate advanced analysis HTML panel
   * @returns {string} HTML string for advanced analysis
   */
  generateAdvancedAnalysisHTML() {
    if (this.videosData.length === 0) return "";
    const viralVideos = this.identifyViralContent();
    const titlePatterns = this.analyzeTitlePatterns();
    const uploadSchedule = this.analyzeUploadSchedule();
    return `
            <div class="analysis-panel" data-title="🔬 Advanced Content Insights">
                <h3>🔬 Advanced Content Insights</h3>
                
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--xp-blue-start); margin-bottom: 8px;">🚀 Viral Content (3x+ avg performance)</h4>
                    <div style="background: white; padding: 12px; border: 1px inset var(--xp-button-face); border-radius: 4px; font-size: 12px;">
                        ${viralVideos.length > 0 ? viralVideos.map((v) => `• <strong>${v.title}</strong> (${formatViewCount(v.viewCount)} views)`).join("<br>") : "No viral content detected (3x+ average performance)"}
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--xp-blue-start); margin-bottom: 8px;">📝 Title Patterns</h4>
                    <div style="background: white; padding: 12px; border: 1px inset var(--xp-button-face); border-radius: 4px; font-size: 12px;">
                        • Average title length: <strong>${titlePatterns.avgLength} characters</strong><br>
                        • Common words: <strong>${titlePatterns.commonWords.join(", ")}</strong><br>
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
    const monthlyData = {};
    this.videosData.forEach((video) => {
      const date = new Date(video.publishedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      return new Date(year, monthNum - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      });
    });
    const data = sortedMonths.map((month) => monthlyData[month]);
    return {
      labels,
      datasets: [{
        label: "Videos Uploaded",
        data,
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
  createUploadTimelineChart(canvasId = "uploadChart") {
    const chartData = this.prepareUploadTimelineData();
    if (!chartData) return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      debugLog("Canvas element not found:", canvasId);
      return;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    const ctx = canvas.getContext("2d");
    try {
      this.chartInstance = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                font: { family: "Tahoma", size: 11 },
                color: "#000000"
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { family: "Tahoma", size: 10 },
                color: "#000000"
              },
              grid: { color: "rgba(0,0,0,0.1)" }
            },
            x: {
              ticks: {
                font: { family: "Tahoma", size: 10 },
                color: "#000000"
              },
              grid: { color: "rgba(0,0,0,0.1)" }
            }
          }
        }
      });
      debugLog("Upload timeline chart created successfully");
    } catch (error) {
      debugLog("Failed to create chart", error);
    }
  }
  /**
   * Generate chart panel HTML
   * @returns {string} HTML string for chart panel
   */
  generateChartPanelHTML(canvasId = "uploadChart") {
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
   * Clear analytics data and destroy chart
   */
  clearAnalytics() {
    this.videosData = [];
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    debugLog("Analytics cleared");
  }
}
const analyticsService = new AnalyticsService();
function detectEnvironment() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("demo") || searchParams.get("mode") === "demo") {
    return "demo";
  }
  if (protocol === "file:") {
    return "local-file";
  }
  if (CONFIG.ENVIRONMENT.LOCAL_DOMAINS.includes(hostname)) {
    return "local-server";
  }
  return "live";
}
function initializeEnvironment() {
  const currentEnvironment = detectEnvironment();
  CONFIG.ENVIRONMENT.DETECTED = currentEnvironment;
  updateGlobalState("currentEnvironment", currentEnvironment);
  debugLog(`Environment detected: ${currentEnvironment}`);
  switch (currentEnvironment) {
    case "demo":
      initializeDemoEnvironment();
      break;
    case "live":
      initializeLiveEnvironment();
      break;
    case "local-server":
      initializeLocalServer();
      break;
    case "local-file":
      initializeLocalFile();
      break;
    default:
      console.warn("Unknown environment, defaulting to live mode");
      initializeLiveEnvironment();
  }
}
function initializeDemoEnvironment() {
  CONFIG.DEMO.ENABLED = true;
  CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
  {
    console.warn("⚠️ Demo mode enabled but no API key found");
  }
  showEnvironmentBanner("🎭 Demo Mode - Limited functionality with built-in API key");
}
function initializeLiveEnvironment() {
  CONFIG.DEMO.ENABLED = false;
  CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
  updateGlobalState("apiMode", "live");
  showEnvironmentBanner("🌐 Live Version - Enter your YouTube API key to get started");
  debugLog("✅ Live environment initialized");
}
function initializeLocalServer() {
  CONFIG.DEMO.ENABLED = false;
  CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
  updateGlobalState("apiMode", "local");
  showEnvironmentBanner("🔧 Local Server - Development Mode");
  debugLog("Local server mode initialized");
}
function initializeLocalFile() {
  CONFIG.AUTH.GITHUB_OAUTH_ENABLED = false;
  showEnvironmentBanner("🏠 Local Development - Direct File Access");
  debugLog("Local file mode initialized");
}
function showEnvironmentBanner(message) {
  console.log(`🏷️ Environment Banner: ${message}`);
}
class App extends BaseComponent {
  constructor(container, options = {}) {
    super(container, options);
    this.appState = {
      currentEnvironment: null,
      apiKey: null,
      channelData: null,
      videos: [],
      filteredVideos: [],
      currentView: "list",
      isLoading: false,
      lastAnalysis: null,
      savedSearches: []
    };
    this.components = {
      videoList: null,
      loadingSpinner: null,
      messagePanel: null
    };
    this.services = {
      youtube: null,
      // Will be created when API key is set
      storage: storageService,
      analytics: analyticsService
    };
    this.servicesReady = {
      youtube: false,
      storage: false,
      analytics: false
    };
    this.performanceMonitor = this.options.enablePerformanceMonitoring ? globalPerformanceMonitor : null;
  }
  get defaultOptions() {
    return {
      autoInit: true,
      enableDemoMode: true,
      enableAnalytics: true,
      enablePerformanceMonitoring: true
    };
  }
  async onCreate() {
    debugLog("🚀 Initializing YouTube Research Hub App");
    this.appState.currentEnvironment = detectEnvironment();
    updateGlobalState("currentEnvironment", this.appState.currentEnvironment);
    await this.initializeServices();
    this.initializeComponents();
    await this.loadSavedState();
    debugLog(`✅ App initialized in ${this.appState.currentEnvironment} environment`);
  }
  template() {
    return `
            <div class="app-main">
                <!-- Header Section -->
                <div class="app-header">
                    <h1>📺 YouTube Channel Research Hub</h1>
                    <p>Comprehensive analysis • Content insights • Strategic planning</p>
                    <div class="environment-badge">
                        ${this.renderEnvironmentBadge()}
                    </div>
                </div>
                
                <!-- Control Panel -->
                <div class="control-panel">
                    ${this.renderApiKeySection()}
                    ${this.renderSearchSection()}
                </div>
                
                <!-- Global Messages Container -->
                <div id="globalMessages" class="global-messages"></div>
                
                <!-- Main Content Area -->
                <div class="main-content">
                    <!-- Videos Section -->
                    <div class="videos-section">
                        <div id="videoListContainer" class="video-list-container"></div>
                    </div>
                    
                    <!-- Analytics Section -->
                    <div class="analytics-section" id="analyticsSection">
                        <div class="analytics-placeholder">
                            Select a channel to view analytics
                        </div>
                    </div>
                </div>
                
                <!-- Global Loading Overlay -->
                <div id="globalLoading" class="global-loading"></div>
            </div>
        `;
  }
  onMount() {
    this.components.messagePanel = GlobalMessages.init(
      this.findElement("#globalMessages"),
      { position: "top", maxMessages: 3 }
    );
    this.components.loadingSpinner = GlobalLoading.init(
      this.findElement("#globalLoading"),
      { overlay: true, showProgress: true }
    );
    this.components.videoList = new VideoList(
      this.findElement("#videoListContainer"),
      { enableViewSwitch: true, defaultView: "list" }
    ).init();
    this.setupEventListeners();
    this.handleEnvironmentSpecificInit();
  }
  // Service Management
  async initializeServices() {
    try {
      storageService.initialize();
      this.servicesReady.storage = true;
      debugLog("📦 Storage service ready");
      this.services.analytics.initialize();
      this.servicesReady.analytics = true;
      debugLog("📊 Analytics service ready");
      debugLog("🔌 Services initialization complete");
    } catch (error) {
      debugLog("❌ Service initialization error:", error);
      this.showError("Failed to initialize application services");
    }
  }
  initializeComponents() {
    debugLog("🏗️ Components ready for initialization");
  }
  async loadSavedState() {
    try {
      this.appState.savedSearches = storageService.getSavedSearches();
      const savedApiKey = storageService.getApiKey();
      if (savedApiKey) {
        this.setApiKey(savedApiKey);
      }
      const lastChannel = storageService.getLastAnalyzedChannel();
      if (lastChannel) {
        const analysis = storageService.loadAnalysis(lastChannel);
        if (analysis) {
          this.appState.lastAnalysis = analysis;
          debugLog(`📂 Loaded previous analysis for ${lastChannel}`);
        }
      }
    } catch (error) {
      debugLog("⚠️ Error loading saved state:", error);
    }
  }
  // Environment-specific methods
  renderEnvironmentBadge() {
    const env = this.appState.currentEnvironment;
    const badges = {
      demo: '<span class="env-badge demo">🎭 Demo Mode</span>',
      live: '<span class="env-badge live">🌐 Live Version</span>',
      local: '<span class="env-badge local">💻 Local Development</span>'
    };
    return badges[env] || '<span class="env-badge unknown">❓ Unknown</span>';
  }
  renderApiKeySection() {
    if (this.appState.currentEnvironment === "demo") {
      return `
                <div class="demo-banner">
                    <div class="demo-icon">🎭</div>
                    <div class="demo-content">
                        <h3>Demo Mode Active</h3>
                        <p>Using encrypted demo API key • Limited to 100 videos per analysis</p>
                        <a href="#" class="upgrade-link">Upgrade to full version →</a>
                    </div>
                </div>
            `;
    }
    if (this.appState.currentEnvironment === "local") {
      return `
                <div class="local-banner">
                    <div class="local-icon">💻</div>
                    <div class="local-content">
                        <h3>Local Development Mode</h3>
                        <p>API key loaded from environment • Full functionality enabled</p>
                    </div>
                </div>
            `;
    }
    return `
            <div class="api-key-section">
                <div class="api-key-header">
                    <span class="key-icon">🔐</span>
                    <strong>YouTube API Key Required</strong>
                    <a href="https://console.cloud.google.com/" target="_blank" class="get-key-link">
                        Get Free API Key →
                    </a>
                </div>
                <div class="api-key-input-group">
                    <input 
                        type="password" 
                        id="apiKeyInput" 
                        placeholder="AIza... (paste your YouTube Data API v3 key)"
                        class="api-key-input"
                    >
                    <button id="saveApiKeyBtn" class="save-key-btn">Save Key</button>
                </div>
                <div class="api-key-notice">
                    <strong>🔒 Secure:</strong> Stored locally only • Not sent to our servers
                </div>
            </div>
        `;
  }
  renderSearchSection() {
    return `
            <div class="search-section">
                <div class="search-header">
                    <h3>🔍 Channel Analysis</h3>
                </div>
                <div class="search-input-group">
                    <input 
                        type="text" 
                        id="channelInput" 
                        placeholder="@channel, channel URL, or channel ID"
                        class="channel-input"
                    >
                    <button id="analyzeBtn" class="analyze-btn" disabled>
                        Analyze Channel
                    </button>
                </div>
                <div class="search-options">
                    <label>
                        <input type="checkbox" id="includeShorts"> Include YouTube Shorts
                    </label>
                    <label>
                        <input type="checkbox" id="includeLiveStreams"> Include Live Streams
                    </label>
                </div>
            </div>
        `;
  }
  // Event Management
  setupEventListeners() {
    if (this.appState.currentEnvironment === "live") {
      const apiKeyInput = this.findElement("#apiKeyInput");
      const saveKeyBtn = this.findElement("#saveApiKeyBtn");
      if (apiKeyInput) {
        this.addListener(apiKeyInput, "input", this.handleApiKeyInput.bind(this));
        this.addListener(apiKeyInput, "keydown", (e) => {
          if (e.key === "Enter") this.handleSaveApiKey();
        });
      }
      if (saveKeyBtn) {
        this.addListener(saveKeyBtn, "click", this.handleSaveApiKey.bind(this));
      }
    }
    const channelInput = this.findElement("#channelInput");
    const analyzeBtn = this.findElement("#analyzeBtn");
    if (channelInput) {
      this.addListener(channelInput, "input", this.handleChannelInput.bind(this));
      this.addListener(channelInput, "keydown", (e) => {
        if (e.key === "Enter" && !analyzeBtn.disabled) {
          this.handleAnalyzeChannel();
        }
      });
    }
    if (analyzeBtn) {
      this.addListener(analyzeBtn, "click", this.handleAnalyzeChannel.bind(this));
    }
  }
  handleEnvironmentSpecificInit() {
    if (this.appState.currentEnvironment === "demo") {
      this.initializeDemoMode();
    } else if (this.appState.currentEnvironment === "local") {
      this.initializeLocalMode();
    }
  }
  // Event Handlers
  handleApiKeyInput(event) {
    if (this.performanceMonitor) {
      this.performanceMonitor.trackUserInteraction("apiKeyInput", {
        hasValue: !!event.target.value,
        isValid: validateApiKey(event.target.value)
      });
    }
    const apiKey = event.target.value.trim();
    const saveBtn = this.findElement("#saveApiKeyBtn");
    if (validateApiKey(apiKey)) {
      this.appState.apiKey = apiKey;
      saveBtn == null ? void 0 : saveBtn.removeAttribute("disabled");
      saveBtn == null ? void 0 : saveBtn.classList.add("valid");
    } else {
      this.appState.apiKey = null;
      saveBtn == null ? void 0 : saveBtn.setAttribute("disabled", "true");
      saveBtn == null ? void 0 : saveBtn.classList.remove("valid");
    }
    this.updateAnalyzeButtonState();
  }
  handleSaveApiKey() {
    if (this.appState.apiKey && validateApiKey(this.appState.apiKey)) {
      this.setApiKey(this.appState.apiKey);
      storageService.saveApiKey(this.appState.apiKey);
      this.showSuccess("API key saved successfully");
    }
  }
  handleChannelInput(event) {
    this.updateAnalyzeButtonState();
  }
  async handleAnalyzeChannel() {
    if (this.performanceMonitor) {
      this.performanceMonitor.trackUserInteraction("channelAnalysis", {
        environment: this.appState.currentEnvironment,
        hasApiKey: !!this.appState.apiKey
      });
    }
    const channelInput = this.findElement("#channelInput");
    if (!channelInput) return;
    const channelQuery = channelInput.value.trim();
    if (!channelQuery) {
      this.showError("Please enter a channel URL or handle");
      return;
    }
    if (!this.services.youtube) {
      this.showError("Please save your API key first");
      return;
    }
    this.setLoadingState(true, "Analyzing channel...");
    try {
      await this.analyzeChannel(channelQuery);
    } catch (error) {
    } finally {
      this.setLoadingState(false);
    }
  }
  // Core Functionality
  setApiKey(apiKey) {
    this.appState.apiKey = apiKey;
    updateGlobalState("apiKey", apiKey);
    this.services.youtube = new YouTubeApiService(apiKey);
    if (this.appState.currentEnvironment === "demo") {
      this.services.youtube.setDemoMode(true);
    }
    this.servicesReady.youtube = true;
    debugLog("🔑 YouTube API service ready with new key");
    this.updateAnalyzeButtonState();
  }
  async analyzeChannel(channelQuery) {
    if (!this.services.youtube) {
      throw new Error("YouTube API service not initialized");
    }
    try {
      debugLog("🔍 Starting channel analysis", { query: channelQuery });
      this.showProgress(20, "Getting channel information...");
      const channelData = await this.services.youtube.getChannelData(channelQuery);
      this.appState.channelData = channelData;
      this.showProgress(40, "Fetching video library...");
      const videos = await this.services.youtube.getAllChannelVideos(
        channelData.uploadsPlaylistId,
        (message) => this.showProgress(60, message)
      );
      this.appState.videos = videos;
      this.appState.filteredVideos = videos;
      this.showProgress(80, "Processing analytics...");
      this.services.analytics.setVideosData(videos);
      this.showProgress(90, "Updating display...");
      this.components.videoList.setVideos(videos);
      this.renderAnalytics();
      this.showProgress(100, "Complete!");
      storageService.saveAnalysis(channelData.channelId, {
        channelData,
        videos,
        timestamp: Date.now()
      });
      this.showSuccess(`Analysis complete! Found ${videos.length} videos.`);
      debugLog("✅ Channel analysis complete", { videoCount: videos.length });
    } catch (error) {
      debugLog("❌ Analysis error:", error);
      this.showError(`Analysis failed: ${error.message}`);
      throw error;
    }
  }
  renderAnalytics() {
    const analyticsSection = this.findElement("#analyticsSection");
    if (!analyticsSection || !this.appState.videos.length) return;
    const analysisHTML = this.services.analytics.generateContentAnalysisHTML();
    analyticsSection.innerHTML = analysisHTML;
    debugLog("📊 Analytics rendered");
  }
  // UI State Management
  updateAnalyzeButtonState() {
    const analyzeBtn = this.findElement("#analyzeBtn");
    const channelInput = this.findElement("#channelInput");
    if (!analyzeBtn) return;
    const hasApiKey = !!this.appState.apiKey;
    const hasChannel = channelInput && channelInput.value.trim().length > 0;
    analyzeBtn.disabled = !hasApiKey || !hasChannel || this.appState.isLoading;
  }
  setLoadingState(isLoading, message = "Loading...") {
    this.appState.isLoading = isLoading;
    if (isLoading) {
      GlobalLoading.show(message);
    } else {
      GlobalLoading.hide();
    }
    this.updateAnalyzeButtonState();
  }
  showProgress(percent, message) {
    GlobalLoading.setProgress(percent, message);
  }
  // Message Methods
  showError(message, persistent = false) {
    GlobalMessages.error(message, persistent);
  }
  showSuccess(message, persistent = false) {
    GlobalMessages.success(message, persistent);
  }
  showWarning(message, persistent = false) {
    GlobalMessages.warning(message, persistent);
  }
  showInfo(message, persistent = false) {
    GlobalMessages.info(message, persistent);
  }
  // Environment-specific initialization
  async initializeDemoMode() {
    try {
      this.showInfo("Demo mode initialized - 100 video limit active");
      debugLog("🎭 Demo mode initialized");
    } catch (error) {
      this.showError("Failed to initialize demo mode");
    }
  }
  async initializeLocalMode() {
    try {
      this.showInfo("Local development mode - full functionality enabled");
      debugLog("💻 Local mode initialized");
    } catch (error) {
      this.showError("Failed to initialize local mode");
    }
  }
  // Cleanup
  onDestroy() {
    Object.values(this.components).forEach((component) => {
      if (component && typeof component.destroy === "function") {
        component.destroy();
      }
    });
    this.appState = null;
    if (this.performanceMonitor) {
      this.performanceMonitor.logPerformanceReport();
    }
    debugLog("🗑️ App component destroyed");
  }
}
initializeEnvironment();
debugLog("🚀 YouTube Research Hub - Modular version starting...");
function initializeApp() {
  const appContainer = document.getElementById("app");
  if (!appContainer) {
    console.error("❌ App container not found");
    return;
  }
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get("test") === "true";
    if (isTestMode) {
      debugLog("🧪 Test mode detected - running integration tests");
      runIntegrationTests();
      return;
    }
    const app = new App(appContainer, {
      autoInit: true,
      enableDemoMode: true,
      enableAnalytics: true
    });
    app.init();
    window.debugApp = app;
    debugLog("✅ Application initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    appContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Tahoma, sans-serif;">
                <h2 style="color: #d32f2f; margin-bottom: 16px;">⚠️ Application Error</h2>
                <p style="margin-bottom: 16px;">Failed to load the YouTube Research Hub.</p>
                <p style="font-size: 12px; color: #666;">
                    Please refresh the page or check the console for details.
                </p>
                <button onclick="location.reload()" 
                        style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
  }
}
async function runIntegrationTests() {
  try {
    const { default: IntegrationTest } = await __vitePreload(async () => {
      const { default: IntegrationTest2 } = await import("./integration-test-BVgvCKfY.js");
      return { default: IntegrationTest2 };
    }, true ? [] : void 0);
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = `
            <div style="padding: 20px; font-family: monospace; background: #f5f5f5; min-height: 100vh;">
                <h2>🧪 Integration Test Mode</h2>
                <p>Running comprehensive system tests...</p>
                <div id="testResults" style="margin-top: 20px; background: white; padding: 16px; border-radius: 4px; border: 1px solid #ddd;">
                    <div>Starting tests...</div>
                </div>
                <button onclick="location.href=location.pathname" 
                        style="margin-top: 16px; padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Exit Test Mode
                </button>
            </div>
        `;
    const tester = new IntegrationTest();
    const results = await tester.runAllTests();
    await tester.testBridgeCompatibility();
    const resultsDiv = document.getElementById("testResults");
    const successRate = Math.round(results.passedTests / results.totalTests * 100);
    const isSuccess = successRate === 100;
    resultsDiv.innerHTML = `
            <h3 style="color: ${isSuccess ? "green" : "red"};">
                ${isSuccess ? "✅" : "❌"} Test Results: ${successRate}% Success Rate
            </h3>
            <div style="margin: 12px 0;">
                <strong>Total Tests:</strong> ${results.totalTests}<br>
                <strong>Passed:</strong> <span style="color: green;">${results.passedTests}</span><br>
                <strong>Failed:</strong> <span style="color: red;">${results.failedTests}</span>
            </div>
            ${results.errors.length > 0 ? `
                <div style="margin-top: 16px;">
                    <h4 style="color: red;">Failed Tests:</h4>
                    <ul style="color: red;">
                        ${results.errors.map((error) => `<li>${error}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}
            <div style="margin-top: 16px; padding: 12px; background: ${isSuccess ? "#e8f5e8" : "#ffeaea"}; border-radius: 4px;">
                ${isSuccess ? "🎉 <strong>ALL TESTS PASSED!</strong> The modular system is working perfectly." : "⚠️ <strong>Some tests failed.</strong> Please review the errors above."}
            </div>
        `;
    window.integrationTestResults = results;
  } catch (error) {
    console.error("❌ Failed to run integration tests:", error);
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Tahoma, sans-serif;">
                <h2 style="color: #d32f2f;">❌ Test Mode Error</h2>
                <p>Failed to load integration tests: ${error.message}</p>
                <button onclick="location.href=location.pathname" 
                        style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Exit Test Mode
                </button>
            </div>
        `;
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
debugLog("📦 Main module loaded, waiting for DOM...");
export {
  App as A,
  BaseComponent as B,
  CONFIG as C,
  GlobalLoading as G,
  LoadingSpinner as L,
  MessagePanel as M,
  VideoList as V,
  YouTubeApiService as Y,
  analyticsService as a,
  formatDuration as b,
  sanitizeURL as c,
  detectEnvironment as d,
  debugLog as e,
  formatViewCount as f,
  getGlobalState as g,
  storageService as s,
  updateGlobalState as u,
  validateApiKey as v
};
