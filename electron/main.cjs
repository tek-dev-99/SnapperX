const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const chokidar = require('chokidar');

let mainWindow;
let watcher;
let recentScreenshots = [];
const MAX_RECENT_SCREENSHOTS = 5;

// Create app data directory for storing screenshots
const appDataPath = path.join(app.getPath('userData'), 'screenshots');
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

function getScreenshotFolder() {
  const platform = process.platform;
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Desktop');
  } else if (platform === 'win32') {
    return path.join(os.homedir(), 'Pictures', 'Screenshots');
  } else {
    // Linux: try Pictures or fallback to home
    const pics = path.join(os.homedir(), 'Pictures');
    if (fs.existsSync(pics)) return pics;
    return os.homedir();
  }
}

function getLatestScreenshot(folder) {
  const files = fs.readdirSync(folder)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => ({ file: f, time: fs.statSync(path.join(folder, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
  return files.length > 0 ? path.join(folder, files[0].file) : null;
}

function saveScreenshotToAppData(originalPath) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `screenshot_${timestamp}.png`;
    const destinationPath = path.join(appDataPath, fileName);

    // Copy the screenshot to app data directory
    fs.copyFileSync(originalPath, destinationPath);

    // Add to recent screenshots list
    const screenshotInfo = {
      id: timestamp,
      path: destinationPath,
      originalPath: originalPath,
      timestamp: new Date().toISOString()
    };

    recentScreenshots.unshift(screenshotInfo);

    // Keep only the last MAX_RECENT_SCREENSHOTS
    if (recentScreenshots.length > MAX_RECENT_SCREENSHOTS) {
      const removed = recentScreenshots.pop();
      // Delete the old file
      if (fs.existsSync(removed.path)) {
        fs.unlinkSync(removed.path);
      }
    }

    // Save recent screenshots list to file
    saveRecentScreenshotsList();

    return screenshotInfo;
  } catch (error) {
    console.error('Error saving screenshot to app data:', error);
    return null;
  }
}

function saveRecentScreenshotsList() {
  try {
    const listPath = path.join(appDataPath, 'recent_screenshots.json');
    fs.writeFileSync(listPath, JSON.stringify(recentScreenshots, null, 2));
  } catch (error) {
    console.error('Error saving recent screenshots list:', error);
  }
}

function loadRecentScreenshotsList() {
  try {
    const listPath = path.join(appDataPath, 'recent_screenshots.json');
    if (fs.existsSync(listPath)) {
      const data = fs.readFileSync(listPath, 'utf8');
      recentScreenshots = JSON.parse(data);

      // Verify files still exist and clean up if not
      recentScreenshots = recentScreenshots.filter(screenshot => {
        if (fs.existsSync(screenshot.path)) {
          return true;
        } else {
          console.log(`Screenshot file not found: ${screenshot.path}`);
          return false;
        }
      });

      saveRecentScreenshotsList();
    }
  } catch (error) {
    console.error('Error loading recent screenshots list:', error);
    recentScreenshots = [];
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });
  mainWindow.loadURL('http://localhost:5173');
  // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function openEditorWithImage(imagePath) {
  fs.readFile(imagePath, (err, data) => {
    if (err) return;

    // Save screenshot to app data
    const savedScreenshot = saveScreenshotToAppData(imagePath);

    if (!mainWindow) {
      createWindow();
      mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.send('screenshot-taken', data);
        if (savedScreenshot) {
          mainWindow.webContents.send('screenshot-saved', savedScreenshot);
        }
        mainWindow.show();
        mainWindow.focus();
      });
    } else {
      mainWindow.webContents.send('screenshot-taken', data);
      if (savedScreenshot) {
        mainWindow.webContents.send('screenshot-saved', savedScreenshot);
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function watchForScreenshots(folder) {
  if (watcher) watcher.close();
  watcher = chokidar.watch(folder, { ignoreInitial: true, depth: 0 });
  watcher.on('add', filePath => {
    if (/\.(png|jpg|jpeg)$/i.test(filePath)) {
      setTimeout(() => {
        openEditorWithImage(filePath);
      }, 300); // Wait a bit for file to finish writing
    }
  });
}

function triggerScreenshotTool() {
  const platform = process.platform;
  if (platform === 'darwin') {
    exec('screencapture -i ~/Desktop', (err) => {
      if (err) console.error('Screenshot tool error:', err);
    });
  } else if (platform === 'win32') {
    exec('start ms-screenclip:', (err) => {
      if (err) console.error('Screenshot tool error:', err);
    }); // Windows 10+ (Snip & Sketch)
  } else {
    // Try gnome-screenshot, spectacle, or xfce4-screenshooter
    exec('gnome-screenshot -a || spectacle -r || xfce4-screenshooter -r', (err) => {
      if (err) console.error('Screenshot tool error:', err);
    });
  }
}

function checkLinuxShortcutConflicts() {
  console.log('=== LINUX SHORTCUT CONFLICT CHECK ===');

  // Common Linux desktop environment shortcuts that might conflict
  const commonShortcuts = [
    'Control+Shift+4',
    'Control+Shift+5',
    'Control+Alt+S',
    'Control+Shift+S',
    'Control+Alt+4',
    'Control+Alt+5'
  ];

  console.log('Checking for conflicts with common shortcuts:');
  commonShortcuts.forEach(shortcut => {
    if (globalShortcut.isRegistered(shortcut)) {
      console.log(`⚠️  CONFLICT: ${shortcut} is already registered`);
    } else {
      console.log(`✅ ${shortcut} is available`);
    }
  });

  // Check desktop environment
  const desktop = process.env.XDG_CURRENT_DESKTOP || process.env.DESKTOP_SESSION || 'unknown';
  console.log('Desktop environment:', desktop);

  // Check if running under Wayland or X11
  const displayServer = process.env.WAYLAND_DISPLAY ? 'Wayland' : 'X11';
  console.log('Display server:', displayServer);

  // Check for common screenshot tools
  const { execSync } = require('child_process');
  const screenshotTools = ['gnome-screenshot', 'spectacle', 'xfce4-screenshooter', 'flameshot'];

  console.log('Available screenshot tools:');
  screenshotTools.forEach(tool => {
    try {
      execSync(`which ${tool}`, { stdio: 'ignore' });
      console.log(`✅ ${tool} is available`);
    } catch {
      console.log(`❌ ${tool} not found`);
    }
  });
}

app.whenReady().then(() => {
  const screenshotFolder = getScreenshotFolder();
  watchForScreenshots(screenshotFolder);

  // Load recent screenshots on app start
  loadRecentScreenshotsList();

  console.log('=== SHORTCUT REGISTRATION DEBUG ===');
  console.log('Platform:', process.platform);
  console.log('Node version:', process.version);
  console.log('Electron version:', process.versions.electron);

  // Check for Linux-specific conflicts
  if (process.platform === 'linux') {
    checkLinuxShortcutConflicts();
  }

  // Try different shortcuts if the default one fails
  const shortcuts = [
    'Control+Shift+4',        // Linux specific
    'CommandOrControl+Shift+4', // Cross-platform
    'Control+Shift+5',        // Alternative
    'Control+Alt+S',          // Another alternative
    'Control+Shift+S',        // Another alternative
  ];

  let shortcutRegistered = false;

  for (const shortcut of shortcuts) {
    console.log(`Attempting to register: ${shortcut}`);
    const success = globalShortcut.register(shortcut, () => {
      console.log(`✅ Screenshot shortcut triggered: ${shortcut}`);
      triggerScreenshotTool();
    });

    if (success) {
      console.log(`✅ Successfully registered shortcut: ${shortcut}`);
      shortcutRegistered = true;

      // Send the registered shortcut to renderer
      if (mainWindow) {
        mainWindow.webContents.send('shortcut-registered', shortcut);
      }
      break;
    } else {
      console.log(`❌ Failed to register shortcut: ${shortcut}`);

      // Check if shortcut is already registered by another app
      if (globalShortcut.isRegistered(shortcut)) {
        console.log(`⚠️  Shortcut ${shortcut} is already registered by another application`);
      }
    }
  }

  if (!shortcutRegistered) {
    console.error('❌ No screenshot shortcuts could be registered!');
    console.error('This might be due to:');
    console.error('1. Another application using the same shortcuts');
    console.error('2. Desktop environment restrictions');
    console.error('3. Permission issues');
    console.error('4. X11/Wayland compatibility issues');
  } else {
    console.log('✅ Screenshot functionality is ready!');
  }

  app.on('activate', function () {
    if (!mainWindow) createWindow();
  });
});

// IPC handlers for recent screenshots
ipcMain.handle('get-recent-screenshots', () => {
  return recentScreenshots;
});

ipcMain.handle('load-screenshot', async (event, screenshotPath) => {
  try {
    const data = fs.readFileSync(screenshotPath);
    return data;
  } catch (error) {
    console.error('Error loading screenshot:', error);
    throw error;
  }
});

ipcMain.handle('delete-screenshot', async (event, screenshotId) => {
  try {
    const screenshotIndex = recentScreenshots.findIndex(s => s.id === screenshotId);
    if (screenshotIndex !== -1) {
      const screenshot = recentScreenshots[screenshotIndex];

      // Delete the file
      if (fs.existsSync(screenshot.path)) {
        fs.unlinkSync(screenshot.path);
      }

      // Remove from list
      recentScreenshots.splice(screenshotIndex, 1);
      saveRecentScreenshotsList();

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    throw error;
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
  mainWindow = null;
  if (watcher) watcher.close();
}); 