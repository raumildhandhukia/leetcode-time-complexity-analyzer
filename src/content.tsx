import React from 'react';
import { createRoot } from 'react-dom/client';
import Analyzer from './components/Analyzer';

const LEETCODE_EDITOR_SELECTOR = '.monaco-editor';
const CONTAINER_ID = 'leetcode-time-analyzer-root';

function injectAnalyzer() {
  // Remove any existing container
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create new container
  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '99999';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  // Create React root and render component
  const root = createRoot(container);
  root.render(<Analyzer />);
  
  console.log('LeetCode Time Analyzer injected successfully');
}

function waitForEditor() {
  console.log('Waiting for Monaco editor...');
  
  // Check immediately
  if (document.querySelector(LEETCODE_EDITOR_SELECTOR)) {
    console.log('Monaco editor found immediately');
    injectAnalyzer();
    return;
  }

  // Set up mutation observer to watch for editor
  const observer = new MutationObserver((mutations, obs) => {
    const editor = document.querySelector(LEETCODE_EDITOR_SELECTOR);
    if (editor) {
      console.log('Monaco editor found via observer');
      obs.disconnect();
      
      // Wait a brief moment for the editor to fully initialize
      setTimeout(injectAnalyzer, 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Start watching for editor as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForEditor);
} else {
  waitForEditor();
}

// Keep connection with background script
let port = chrome.runtime.connect({ name: 'keepAlive' });
port.onDisconnect.addListener(() => {
  console.log('Reconnecting to service worker...');
  port = chrome.runtime.connect({ name: 'keepAlive' });
});
