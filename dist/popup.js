/******/ (() => { // webpackBootstrap
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('extensionToggle');

  // Load saved state
  chrome.storage.sync.get(['enabled'], function(result) {
    toggle.checked = result.enabled !== false; // Default to true if not set
  });

  // Save state when changed
  toggle.addEventListener('change', function() {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });
});

/******/ })()
;