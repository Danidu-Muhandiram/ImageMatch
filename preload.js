
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("imageTool", {
  // Open an image
  openImage: () => ipcRenderer.invoke("open-image"),
  // Window controls and settings used by the toolbar ui
  setAlwaysOnTop: (value) => ipcRenderer.invoke("set-always-on-top", value),
  setOpacity: (value) => ipcRenderer.invoke("set-opacity", value),
  getOpacity: () => ipcRenderer.invoke("get-opacity"),
  minimize: () => ipcRenderer.invoke("minimize"),
  close: () => ipcRenderer.invoke("close")
});
