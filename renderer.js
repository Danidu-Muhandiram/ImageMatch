// Cache UI elements for event wiring and updates.
const image = document.getElementById("image");
const placeholder = document.getElementById("placeholder");
const dropZone = document.getElementById("dropZone");
const openButton = document.getElementById("openButton");
const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
const opacitySlider = document.getElementById("opacitySlider");
const resetZoom = document.getElementById("resetZoom");
const minimizeButton = document.getElementById("minimizeButton");
const closeButton = document.getElementById("closeButton");

// Zoom state with min/max guardrails.
let zoom = 1;
const minZoom = 0.2;
const maxZoom = 6;

const setImage = (filePath) => {
  // Load the image from disk and reset zoom to the default scale.
  if (!filePath) return;
  image.src = `file://${filePath.replace(/\\/g, "/")}`;
  placeholder.style.display = "none";
  zoom = 1;
  applyZoom();
};

const applyZoom = () => {
  // Apply zoom via CSS transform for smooth scaling.
  image.style.transform = `scale(${zoom})`;
};

openButton.addEventListener("click", async () => {
  // Trigger native file picker through the preload bridge.
  const filePath = await window.imageTool.openImage();
  setImage(filePath);
});

alwaysOnTopToggle.addEventListener("change", async (event) => {
  // Toggle always-on-top using the main process API.
  const value = await window.imageTool.setAlwaysOnTop(event.target.checked);
  alwaysOnTopToggle.checked = value;
});

opacitySlider.addEventListener("input", async (event) => {
  // Adjust window opacity using the main process API.
  const value = await window.imageTool.setOpacity(event.target.value);
  opacitySlider.value = value;
});

resetZoom.addEventListener("click", () => {
  // Reset zoom to default scale.
  zoom = 1;
  applyZoom();
});

minimizeButton.addEventListener("click", () => {
  // Minimize the window.
  window.imageTool.minimize();
});

closeButton.addEventListener("click", () => {
  // Close the window.
  window.imageTool.close();
});

dropZone.addEventListener("wheel", (event) => {
  // Zoom with the mouse wheel while the cursor is over the viewport.
  if (!image.src) return;
  event.preventDefault();
  const delta = Math.sign(event.deltaY) * -0.1;
  zoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
  applyZoom();
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  // Handle a dropped image file from the OS.
  const file = event.dataTransfer.files[0];
  if (file) {
    setImage(file.path);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  // Initialize UI state when the app loads.
  const opacity = await window.imageTool.getOpacity();
  opacitySlider.value = opacity;
  alwaysOnTopToggle.checked = true;
});
