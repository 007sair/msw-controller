// Background service worker for MSW Controller extension

// Extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('MSW Controller extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('MSW Controller extension installed for the first time');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('MSW Controller extension updated');
  }
});

// Handle messages from content scripts and devtools
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'PAGE_NAVIGATED':
      // Handle page navigation
      console.log('Page navigated to:', message.url);
      break;
      
    case 'MSW_CONTROLLER_DETECTED':
      // MSW Controller instance detected on page
      console.log('MSW Controller detected on page');
      break;
      
    case 'MSW_CONTROLLER_ERROR':
      // Error occurred in MSW Controller
      console.error('MSW Controller error:', message.error);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
  
  // Send response if needed
  sendResponse({ received: true });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    
    // Inject content script if needed
    if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: checkMSWController
      }).catch(error => {
        // Ignore errors for tabs we can't access
        console.log('Could not inject script into tab:', error.message);
      });
    }
  }
});

// Function to inject into pages to check for MSW Controller
function checkMSWController() {
  // Check if MSW Controller is available
  if (typeof window.mswController !== 'undefined' || typeof window.__MSW_CONTROLLER_INSTANCE__ !== 'undefined') {
    console.log('MSW Controller detected on page');
    
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'MSW_CONTROLLER_DETECTED',
      timestamp: Date.now()
    }).catch(error => {
      console.log('Could not send message to background:', error);
    });
  }
}

// Handle extension icon click (if we add browser action later)
chrome.action?.onClicked?.addListener((tab) => {
  console.log('Extension icon clicked for tab:', tab.url);
  
  // Open DevTools programmatically (if possible)
  // Note: This requires additional permissions and may not work in all contexts
});

// Cleanup on extension shutdown
chrome.runtime.onSuspend?.addListener(() => {
  console.log('MSW Controller extension suspending');
});

// Handle external connections (if needed for advanced features)
chrome.runtime.onConnectExternal?.addListener((port) => {
  console.log('External connection established:', port.name);
  
  port.onMessage.addListener((message) => {
    console.log('External message received:', message);
  });
  
  port.onDisconnect.addListener(() => {
    console.log('External connection disconnected');
  });
});