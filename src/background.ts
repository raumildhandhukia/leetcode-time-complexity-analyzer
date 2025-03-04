// Listen for extension installation
const extensionId = chrome.runtime.id;

chrome.runtime.onInstalled.addListener(() => {
  console.log(`LeetCode Time Analyzer (${extensionId}) installed`);
});

// Keep service worker alive
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "keepAlive") {
    port.onDisconnect.addListener(function() {
      // Reconnection will be handled by content script
    });
  }
});

// Service worker needs to export an empty module to work with Manifest V3
export {};
