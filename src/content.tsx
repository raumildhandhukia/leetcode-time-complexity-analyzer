import React from 'react';
import { createRoot } from 'react-dom/client';
import Analyzer from './components/Analyzer';

const LEETCODE_EDITOR_SELECTOR = '.monaco-editor';
const CONTAINER_ID = 'leetcode-time-analyzer-root';

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

function mountComponent() {
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '99999';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    root = createRoot(container);
  }
  root?.render(<Analyzer />);
}

function unmountComponent() {
  if (root) {
    root.unmount();
  }
  if (container) {
    container.remove();
    container = null;
  }
  root = null;
}

function injectAnalyzer() {
  mountComponent();
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

// Listen for changes to the enabled state
chrome.storage.sync.onChanged.addListener((changes) => {
  if (changes.enabled) {
    if (changes.enabled.newValue) {
      // Start watching for editor as soon as possible
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForEditor);
      } else {
        waitForEditor();
      }
    } else {
      unmountComponent();
    }
  }
});

// Check initial state
chrome.storage.sync.get(['enabled'], function(result) {
  const enabled = result.enabled !== false; // Default to true if not set
  if (enabled) {
    // Start watching for editor as soon as possible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForEditor);
    } else {
      waitForEditor();
    }
  }
});

// Keep connection with background script
let port = chrome.runtime.connect({ name: 'keepAlive' });
port.onDisconnect.addListener(() => {
  console.log('Reconnecting to service worker...');
  port = chrome.runtime.connect({ name: 'keepAlive' });
});
