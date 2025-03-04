/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// Listen for extension installation
const extensionId = chrome.runtime.id;
chrome.runtime.onInstalled.addListener(() => {
    console.log(`LeetCode Time Analyzer (${extensionId}) installed`);
});
// Keep service worker alive
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "keepAlive") {
        port.onDisconnect.addListener(function () {
            // Reconnection will be handled by content script
        });
    }
});

})();

/******/ })()
;