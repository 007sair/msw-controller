// MSW Controller DevTools Panel Script

class MSWControllerPanel {
  constructor() {
    this.isConnected = false;
    this.currentTab = 'handlers';
    this.handlers = [];
    this.requests = [];
    this.searchKeywords = {
      handlers: '',
      requests: ''
    };
    this.autoRefreshInterval = null;
    this.lastUserAction = 0; // Track last user interaction
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.checkConnection();
    this.startAutoRefresh();
    this.switchTab('requests'); // 默认显示请求记录tab
  }
  
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        // Use currentTarget to ensure we get the button element, not child elements
        const tabName = e.currentTarget.dataset.tab;
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
    
    // Search inputs
    const handlerSearch = document.getElementById('handlerSearch');
    if (handlerSearch) {
      handlerSearch.addEventListener('input', (e) => {
        this.searchKeywords.handlers = e.target.value;
        this.renderHandlers();
      });
    }
    
    const requestSearch = document.getElementById('requestSearch');
    if (requestSearch) {
      requestSearch.addEventListener('input', (e) => {
        this.searchKeywords.requests = e.target.value;
        this.renderRequests();
      });
    }
    
    // Buttons
    const clearRequestsBtn = document.getElementById('clearRequests');
    if (clearRequestsBtn) {
      clearRequestsBtn.addEventListener('click', () => {
        this.clearRequests();
      });
    }
    
    const selectAllCheckbox = document.getElementById('selectAllHandlers');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.selectAllHandlers(e.target.checked);
      });
    }
  }
  
  startAutoRefresh() {
    this.stopAutoRefresh();
    this.autoRefreshInterval = setInterval(() => {
      // Skip auto-refresh for 500ms after user action to prevent interference
      const timeSinceLastAction = Date.now() - this.lastUserAction;
      if (timeSinceLastAction < 500) {
        return;
      }
      
      if (this.currentTab === 'handlers') {
        this.refreshHandlers();
      } else if (this.currentTab === 'requests') {
        this.refreshRequests();
      }
    }, 1000);
  }
  
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }
  
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeTabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabButton) {
      activeTabButton.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    const activeTabPane = document.getElementById(`${tabName}-tab`);
    if (activeTabPane) {
      activeTabPane.classList.add('active');
    }
    
    this.currentTab = tabName;
    
    // Load data for the active tab
    if (tabName === 'handlers') {
      this.refreshHandlers();
    } else if (tabName === 'requests') {
      this.refreshRequests();
    }
  }
  
  async checkConnection() {
    try {
      const result = await this.executeScript(`
        (function() {
          return typeof window.mswController !== 'undefined' || typeof window.__MSW_CONTROLLER_INSTANCE__ !== 'undefined';
        })()
      `);
      
      this.updateConnectionStatus(result);
      return result;
    } catch (error) {
      console.error('Failed to check connection:', error);
      this.updateConnectionStatus(false);
      return false;
    }
  }
  
  updateConnectionStatus(connected) {
    this.isConnected = connected;
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    
    if (connected) {
      indicator.className = 'status-indicator connected';
      text.textContent = '已连接';
    } else {
      indicator.className = 'status-indicator disconnected';
      text.textContent = '未连接';
    }
  }
  
  async refreshHandlers() {
    if (!this.isConnected) {
      await this.checkConnection();
      if (!this.isConnected) {
        await this.renderHandlersEmpty();
        return;
      }
    }
    
    try {
      const handlers = await this.executeScript(`
        (function() {
          const controller = window.mswController || window.__MSW_CONTROLLER_INSTANCE__;
          if (!controller) return [];
          return controller.getHandlers().map(handler => {
            const info = handler.handler.info;
            return {
              id: handler.id,
              enabled: handler.enabled,
              method: info.method || 'ALL',
              path: info.path || '/*'
            };
          });
        })()
      `);
      
      this.handlers = handlers || [];
      await this.renderHandlers();
    } catch (error) {
      console.error('Failed to refresh handlers:', error);
      await this.renderHandlersEmpty();
    }
  }
  
  async refreshRequests() {
    if (!this.isConnected) {
      await this.checkConnection();
      if (!this.isConnected) {
        return;
      }
    }
    
    try {
      const requests = await this.executeScript(`
        (function() {
          const controller = window.mswController || window.__MSW_CONTROLLER_INSTANCE__;
          if (!controller) return [];
          return controller.getRequestRecords()
        })()
      `);
      
      this.requests = requests || [];
      this.renderRequests();
    } catch (error) {
      console.error('Failed to refresh requests:', error);
    }
  }
  
  async clearRequests() {
    if (!this.isConnected) return;
    
    try {
      await this.executeScript(`
        (function() {
          const controller = window.mswController || window.__MSW_CONTROLLER_INSTANCE__;
          if (controller && controller.clearRequestRecords) {
            controller.clearRequestRecords();
          }
        })()
      `);
      
      this.requests = [];
      this.renderRequests();
    } catch (error) {
      console.error('Failed to clear requests:', error);
    }
  }
  
  updateHandlerCount() {
    const enabledCount = this.handlers.filter(h => this.getHandlerEnabled(h.id)).length;
    const totalCount = this.handlers.length;
    const countElement = document.getElementById('handlerCount');
    if (countElement) {
      countElement.textContent = `(${enabledCount}/${totalCount})`;
    }
  }


  
  async toggleHandler(handlerId, enabled) {
    if (!this.isConnected) return;
    
    // Record user action timestamp to prevent auto-refresh interference
    this.lastUserAction = Date.now();
    
    try {
      await this.executeScript(`
        (function() {
          const controller = window.mswController || window.__MSW_CONTROLLER_INSTANCE__;
          if (controller && controller.toggleHandler) {
            controller.toggleHandler('${handlerId}', ${enabled});
          }
        })()
      `);
      
      // Update local state
      const handler = this.handlers.find(h => h.id === handlerId);
      if (handler) {
        handler.enabled = enabled;
        await this.renderHandlers();
      }
      
      // Immediately update requests display to reflect the change
      this.renderRequests();
    } catch (error) {
      console.error('Failed to toggle handler:', error);
    }
  }
  
  async selectAllHandlers(targetState) {
    if (!this.isConnected || this.handlers.length === 0) return;
    
    // Record user action timestamp to prevent auto-refresh interference
    this.lastUserAction = Date.now();
    
    try {
      // 批量切换所有handlers
      for (const handler of this.handlers) {
        await this.executeScript(`
          (function() {
            const controller = window.mswController || window.__MSW_CONTROLLER_INSTANCE__;
            if (controller && controller.toggleHandler) {
              controller.toggleHandler('${handler.id}', ${targetState});
            }
          })()
        `);
        
        // Update local state
        handler.enabled = targetState;
      }
      
      // 重新渲染handlers和requests
      await this.renderHandlers();
      this.renderRequests();
    } catch (error) {
      console.error('Failed to select all handlers:', error);
    }
  }
  
  async renderHandlers() {
    const container = document.getElementById('handlersList');
    const filtered = this.handlers.filter(handler => {
      const keyword = this.searchKeywords.handlers.toLowerCase();
      return !keyword || 
        (handler.path && handler.path.toLowerCase().includes(keyword)) ||
        (handler.method && handler.method.toLowerCase().includes(keyword));
    });
    
    // 更新handler统计
    this.updateHandlerCount();
    
    if (filtered.length === 0) {
      if (this.handlers.length === 0) {
        await this.renderHandlersEmpty();
      } else {
        container.innerHTML = '<div class="empty-state"><p>没有匹配的处理器</p></div>';
      }
      return;
    }
    
    // Smart DOM update - only update changed items
    const existingItems = container.querySelectorAll('.handler-item');
    const existingIds = Array.from(existingItems).map(item => item.dataset.handlerId);
    const newIds = filtered.map(handler => handler.id);
    
    // Check if we need to rebuild completely (different items or order)
    const needsRebuild = existingIds.length !== newIds.length || 
                        !existingIds.every((id, index) => id === newIds[index]);
    
    if (needsRebuild) {
      // Complete rebuild needed
      container.innerHTML = filtered.map(handler => {
        const isEnabled = this.getHandlerEnabled(handler.id);
        const method = handler.method || 'ALL';
        const path = handler.path || '/*';
        
        return `
          <div class="handler-item" data-handler-id="${handler.id}" style="display: flex; align-items: center; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 10px; background: white; cursor: pointer;">
            <input type="checkbox" ${isEnabled ? 'checked' : ''} style="margin-right: 8px; cursor: pointer;">
            <span style="flex: 1; font-size: 14px; color: #333; font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;">${method} ${this.escapeHtml(path)}</span>
          </div>
        `;
      }).join('');
      
      // Add event listeners
      container.querySelectorAll('.handler-item').forEach(item => {
        const handlerId = item.dataset.handlerId;
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        // Handler item click
        item.addEventListener('click', (e) => {
          if (e.target === checkbox) return; // Don't handle if clicking checkbox directly
          const currentEnabled = this.getHandlerEnabled(handlerId);
          this.toggleHandler(handlerId, !currentEnabled);
        });
        
        // Checkbox change
        checkbox.addEventListener('change', (e) => {
          this.toggleHandler(handlerId, e.target.checked);
        });
      });
    } else {
      // Only update checkbox states for existing items
      existingItems.forEach(item => {
        const handlerId = item.dataset.handlerId;
        const handler = filtered.find(h => h.id === handlerId);
        if (handler) {
          const checkbox = item.querySelector('input[type="checkbox"]');
          const isEnabled = this.getHandlerEnabled(handler.id);
          if (checkbox.checked !== isEnabled) {
            checkbox.checked = isEnabled;
          }
        }
      });
    }
    
    // 更新全选复选框状态
    this.updateSelectAllCheckbox();
  }
  
  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllHandlers');
    if (!selectAllCheckbox) return;
    
    if (this.handlers.length === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
      return;
    }
    
    const enabledCount = this.handlers.filter(handler => this.getHandlerEnabled(handler.id)).length;
    const totalCount = this.handlers.length;
    
    if (enabledCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (enabledCount === totalCount) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }
  
  async renderHandlersEmpty() {
    const container = document.getElementById('handlersList');
    
    // Check if controller instance exists
    let hasController = false;
    try {
      hasController = await this.executeScript(`
        (function() {
          return typeof window.mswController !== 'undefined' || typeof window.__MSW_CONTROLLER_INSTANCE__ !== 'undefined';
        })()
      `);
    } catch (error) {
      console.error('Failed to check controller:', error);
    }
    
    if (!hasController) {
      // No controller detected - suggest installing core package
      container.innerHTML = `
        <div class="empty-state" id="handlersEmpty">
          <p>未检测到MSW Controller实例</p>
          <p class="hint">请安装并配置 @msw-controller/core 包</p>
        </div>
      `;
    } else {
      // Controller exists but no handlers - suggest configuring handlers
      container.innerHTML = `
        <div class="empty-state" id="handlersEmpty">
          <p>未检测到任何Handlers</p>
          <p class="hint">请在MSW中配置Handler来拦截请求</p>
        </div>
      `;
    }
  }
  
  renderRequests() {
    const container = document.getElementById('requestsList');
    const filtered = this.requests.filter(request => {
      const keyword = this.searchKeywords.requests.toLowerCase();
      return !keyword || 
        request.url.toLowerCase().includes(keyword) ||
        request.method.toLowerCase().includes(keyword);
    });
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>暂无请求记录</p></div>';
      return;
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    // Smart DOM update - only update changed items
    const existingItems = container.querySelectorAll('.request-item');
    const existingIds = Array.from(existingItems).map(item => {
      const handlerId = item.dataset.handlerId;
      const url = item.querySelector('[data-url]')?.dataset.url;
      const timestamp = item.querySelector('[data-timestamp]')?.dataset.timestamp;
      return `${handlerId}-${url}-${timestamp}`;
    });
    
    const newIds = filtered.map(request => 
      `${request.handlerId || ''}-${request.url}-${request.timestamp}`
    );
    
    // Check if we need to rebuild completely
    const needsRebuild = existingIds.length !== newIds.length || 
                        !existingIds.every((id, index) => id === newIds[index]);
    
    if (needsRebuild) {
      // Complete rebuild needed
      container.innerHTML = filtered.map(request => {
        const time = new Date(request.timestamp).toLocaleTimeString();
        const isEnabled = request.handlerId ? this.getHandlerEnabled(request.handlerId) : false;
        const methodColor = this.getMethodColor(request.method);
        
        return `
          <div class="request-item" data-handler-id="${request.handlerId || ''}" style="border: 1px solid ${isEnabled ? '#52c41a' : '#f0f0f0'}; border-radius: 8px; margin-bottom: 8px; padding: 12px; background: ${isEnabled ? 'rgba(82, 196, 26, 0.05)' : '#fff'}; transition: all 0.2s; cursor: ${request.handlerId ? 'pointer' : 'default'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  ${request.handlerId ? `<div class="enable-icon" style="width: 20px; height: 20px; border-radius: 50%; background: ${isEnabled ? '#52c41a' : '#d9d9d9'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s;">${isEnabled ? '✓' : ''}</div>` : ''}
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; min-width: 40px; text-align: center; color: white; background: ${methodColor}; height: 20px; display: flex; align-items: center; justify-content: center;">${request.method}</span>
                  ${request.handlerId && isEnabled ? '<span class="matched-badge" style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #1890ff; color: white; height: 20px; display: flex; align-items: center; justify-content: center;">已匹配</span>' : ''}
                </div>
                <div data-url="${request.url}" data-timestamp="${request.timestamp}" style="font-size: 13px; font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace; color: #333; word-break: break-all; white-space: normal; line-height: 1.4; margin-left: ${request.handlerId ? '28px' : '0px'};">${this.escapeHtml(request.url)}</div>
              </div>
              <div style="font-size: 11px; color: #999; margin-left: 12px; flex-shrink: 0;">${time}</div>
            </div>
          </div>
        `;
      }).join('');
      
      // Add click event listeners for requests with handlerId
      container.querySelectorAll('.request-item').forEach(item => {
        const handlerId = item.dataset.handlerId;
        if (handlerId) {
          item.addEventListener('click', () => {
            const currentEnabled = this.getHandlerEnabled(handlerId);
            this.toggleHandler(handlerId, !currentEnabled);
          });
        }
      });
    } else {
      // Only update status-related elements for existing items
      existingItems.forEach((item, index) => {
        const request = filtered[index];
        if (request && request.handlerId) {
          const isEnabled = this.getHandlerEnabled(request.handlerId);
          
          // Update enable icon
          const enableIcon = item.querySelector('.enable-icon');
          if (enableIcon) {
            const newBg = isEnabled ? '#52c41a' : '#d9d9d9';
            const newContent = isEnabled ? '✓' : '';
            if (enableIcon.style.background !== newBg) {
              enableIcon.style.background = newBg;
              enableIcon.textContent = newContent;
            }
          }
          
          // Update matched badge
          const matchedBadge = item.querySelector('.matched-badge');
          if (isEnabled && !matchedBadge && request.handlerId) {
            // Need to add matched badge
            const badgeContainer = item.querySelector('div[style*="display: flex; gap: 8px; align-items: center;"]');
            if (badgeContainer) {
              badgeContainer.insertAdjacentHTML('beforeend', '<span class="matched-badge" style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #1890ff; color: white; height: 20px; display: flex; align-items: center; justify-content: center;">已匹配</span>');
            }
          } else if (!isEnabled && matchedBadge) {
            // Need to remove matched badge
            matchedBadge.remove();
          }
          
          // Update border and background
          const newBorderColor = isEnabled ? '#52c41a' : '#f0f0f0';
          const newBg = isEnabled ? 'rgba(82, 196, 26, 0.05)' : '#fff';
          if (item.style.borderColor !== newBorderColor) {
            item.style.borderColor = newBorderColor;
            item.style.background = newBg;
          }
        }
      });
    }
  }
  
  getMethodColor(method) {
    const colors = {
      'GET': '#10b981',
      'POST': '#3b82f6', 
      'PUT': '#f59e0b',
      'DELETE': '#ef4444',
      'PATCH': '#8b5cf6'
    };
    return colors[method.toUpperCase()] || '#6b7280';
  }

  getHandlerEnabled(handlerId) {
    const handler = this.handlers.find(h => h.id === handlerId);
    return handler ? handler.enabled : false;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  async executeScript(code) {
    return new Promise((resolve, reject) => {
      try {
        if (!chrome || !chrome.devtools || !chrome.devtools.inspectedWindow) {
          reject(new Error('Chrome DevTools API not available'));
          return;
        }
        
        chrome.devtools.inspectedWindow.eval(code, (result, isException) => {
          if (chrome.runtime.lastError) {
            reject(new Error('Extension context invalidated: ' + chrome.runtime.lastError.message));
          } else if (isException) {
            reject(new Error(isException.value));
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(new Error('Chrome DevTools API error: ' + error.message));
      }
    });
  }
  

}

// Initialize panel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mswPanel = new MSWControllerPanel();
  });
} else {
  window.mswPanel = new MSWControllerPanel();
}

// Global function for devtools.js to call
window.initializePanel = function() {
  if (window.mswPanel) {
    window.mswPanel.checkConnection();
    window.mswPanel.refreshHandlers();
  }
};