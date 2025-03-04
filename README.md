# LeetCode Time Analyzer Chrome Extension

A Chrome extension that adds a draggable and collapsible time complexity analyzer to LeetCode's coding interface.

## Features

- Automatically detects Monaco editor on LeetCode
- Draggable component that can be positioned anywhere on the screen
- Collapsible interface for better space management
- Persists position between page loads

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder in this project

4. For development with hot reload:
   ```bash
   npm run watch
   ```

## Usage

1. Visit any LeetCode problem page
2. The analyzer will automatically appear when the Monaco editor is detected
3. Drag the analyzer using the header bar
4. Collapse/expand using the button on the right edge
