const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onScreenshotTaken: (callback) => ipcRenderer.on('screenshot-taken', (event, buffer) => callback(buffer)),
  onScreenshotSaved: (callback) => ipcRenderer.on('screenshot-saved', (event, screenshotInfo) => callback(screenshotInfo)),
  onShortcutRegistered: (callback) => ipcRenderer.on('shortcut-registered', (event, shortcut) => callback(shortcut)),
  getRecentScreenshots: () => ipcRenderer.invoke('get-recent-screenshots'),
  loadScreenshot: (screenshotPath) => ipcRenderer.invoke('load-screenshot', screenshotPath),
  deleteScreenshot: (screenshotId) => ipcRenderer.invoke('delete-screenshot', screenshotId)
}); 