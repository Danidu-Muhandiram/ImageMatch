// Main process: creates the window and services native dialogs and IPC calls.
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;

const createWindow = () => {
  // Window configuration: borderless, resizable, and always-on-top for comparison.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 320,
    minHeight: 240,
    frame: false,
    resizable: true,
    transparent: false,
    alwaysOnTop: true,
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On Windows/Linux, exit when all windows are closed.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("open-image", async () => {
  // Open a native file picker and return the selected image path (if any).
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select an image",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("set-always-on-top", (_event, value) => {
  // Toggle always on top based on the renderer checkbox.
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(Boolean(value), "floating");
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle("set-opacity", (_event, value) => {
  // Set window opacity to allow visual overlay comparisons.
  if (!mainWindow) return 1;
  const clamped = Math.min(1, Math.max(0.2, Number(value)));
  mainWindow.setOpacity(clamped);
  return mainWindow.getOpacity();
});

ipcMain.handle("get-opacity", () => {
  // Return current opacity
  if (!mainWindow) return 1;
  return mainWindow.getOpacity();
});

ipcMain.handle("minimize", () => {
  // Minimize the window.
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle("close", () => {
  // Close the window.
  if (mainWindow) mainWindow.close();
});
