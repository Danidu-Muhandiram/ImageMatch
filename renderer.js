// Cache UI elements for event wiring and updates.
const image = document.getElementById("image");
const placeholder = document.getElementById("placeholder");
const dropZone = document.getElementById("dropZone");
const openButton = document.getElementById("openButton");
const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
const resetZoom = document.getElementById("resetZoom");
const minimizeButton = document.getElementById("minimizeButton");
const closeButton = document.getElementById("closeButton");
const prevImageButton = document.getElementById("prevImage");
const nextImageButton = document.getElementById("nextImage");
const thumbImage = document.getElementById("thumbImage");
const imageName = document.getElementById("imageName");
const imageCount = document.getElementById("imageCount");

// Zoom state with min/max guardrails.
let zoom = 1;
const minZoom = 0.2;
const maxZoom = 6;

// Multi-image state
let images = [];
let currentIndex = -1;

const isImageFile = (filePath) => {
  return /\.(png|jpe?g|gif|bmp|webp|tiff)$/i.test(filePath);
};

const setImage = (filePath) => {
  // Load the image from disk and reset zoom to the default scale.
  if (!filePath) return;
  image.src = `file://${filePath.replace(/\\/g, "/")}`;
  thumbImage.src = image.src;
  thumbImage.style.display = "block";
  zoom = 1;
  applyZoom();
};

const applyZoom = () => {
  // Apply zoom via CSS transform for smooth scaling.
  image.style.transform = `scale(${zoom})`;
};

const showPlaceholder = (show) => {
  placeholder.style.display = show ? "block" : "none";
  image.style.display = show ? "none" : "block";
  if (show) {
    thumbImage.style.display = "none";
  }
};

const updateMeta = () => {
  if (currentIndex === -1 || images.length === 0) {
    imageName.textContent = "No image loaded";
    imageCount.textContent = "0 / 0";
  } else {
    const filePath = images[currentIndex];
    imageName.textContent = filePath.split(/[\\/]/).pop();
    imageCount.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  prevImageButton.disabled = images.length <= 1;
  nextImageButton.disabled = images.length <= 1;
};

const setCurrentIndex = (index) => {
  if (images.length === 0) {
    currentIndex = -1;
    showPlaceholder(true);
    updateMeta();
    return;
  }

  currentIndex = Math.max(0, Math.min(index, images.length - 1));
  setImage(images[currentIndex]);
  showPlaceholder(false);
  updateMeta();
};

const addImages = (filePaths) => {
  const filtered = (filePaths || []).filter(isImageFile);
  if (filtered.length === 0) return;

  const startIndex = images.length;
  images = images.concat(filtered);
  setCurrentIndex(startIndex);
};

openButton.addEventListener("click", async () => {
  // Trigger native file picker through the preload bridge.
  const filePaths = await window.imageTool.openImage();
  if (!filePaths) return;
  addImages(Array.isArray(filePaths) ? filePaths : [filePaths]);
});

alwaysOnTopToggle.addEventListener("change", async (event) => {
  // Toggle always-on-top using the main process API.
  const value = await window.imageTool.setAlwaysOnTop(event.target.checked);
  alwaysOnTopToggle.checked = value;
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

prevImageButton.addEventListener("click", () => {
  if (images.length === 0) return;
  const nextIndex = (currentIndex - 1 + images.length) % images.length;
  setCurrentIndex(nextIndex);
});

nextImageButton.addEventListener("click", () => {
  if (images.length === 0) return;
  const nextIndex = (currentIndex + 1) % images.length;
  setCurrentIndex(nextIndex);
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
  const files = Array.from(event.dataTransfer.files).map((file) => file.path);
  addImages(files);
});

image.addEventListener("load", () => {
  showPlaceholder(false);
});

image.addEventListener("error", () => {
  showPlaceholder(true);
});

window.addEventListener("DOMContentLoaded", async () => {
  // Initialize UI state when the app loads.
  alwaysOnTopToggle.checked = true;
  showPlaceholder(true);
  updateMeta();
});
