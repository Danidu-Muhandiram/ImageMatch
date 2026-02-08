
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("imageTool", {
  // Open an image
  openImage: () => ipcRenderer.invoke("open-image"),
  // Window controls and settings used by the toolbar ui
  setAlwaysOnTop: (value) => ipcRenderer.invoke("set-always-on-top", value),
  minimize: () => ipcRenderer.invoke("minimize"),
  close: () => ipcRenderer.invoke("close")
});
