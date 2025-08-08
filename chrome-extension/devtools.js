// DevTools script - creates the MSW Controller panel

// Create the MSW Controller panel in DevTools
chrome.devtools.panels.create(
  'MSW Controller',
  'icons/icon16.png',
  'panel.html',
  function(panel) {
    console.log('MSW Controller panel created');
    
    // Panel event listeners
    panel.onShown.addListener(function(panelWindow) {
      console.log('MSW Controller panel shown');
      // Initialize panel when shown
      if (panelWindow && panelWindow.initializePanel) {
        panelWindow.initializePanel();
      }
    });
    
    panel.onHidden.addListener(function() {
      console.log('MSW Controller panel hidden');
    });
  }
);

// Listen for navigation events to refresh panel data
chrome.devtools.network.onNavigated.addListener(function(url) {
  console.log('Page navigated to:', url);
  // Notify panel about navigation
  chrome.runtime.sendMessage({
    type: 'PAGE_NAVIGATED',
    url: url
  });
});