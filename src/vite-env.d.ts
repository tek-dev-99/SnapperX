/// <reference types="vite/client" />

interface ElectronAPI {
  onScreenshotTaken: (callback: (buffer: ArrayBuffer) => void) => void;
  onScreenshotSaved: (callback: (screenshotInfo: any) => void) => void;
  getRecentScreenshots: () => Promise<any[]>;
  loadScreenshot: (path: string) => Promise<ArrayBuffer>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
