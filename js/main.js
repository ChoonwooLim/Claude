// This file will be rebuilt from scratch.

document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js loaded and running.");

    // --- Initialize Modules ---
    initializeTheme(); // Set theme on page load

    // --- DOM Elements ---
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('fileInfo');
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');
    const videoPreviewSection = document.getElementById('videoPreviewSection');
    const originalVideoContainer = document.getElementById('originalVideoContainer');
    const themeToggle = document.getElementById('theme-toggle');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');

    // --- Event Listeners ---
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (uploadContainer) {
        uploadContainer.addEventListener('click', () => fileInput.click());
        
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    if (playBtn) playBtn.addEventListener('click', playVideo);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseVideo);
    if (rewindBtn) rewindBtn.addEventListener('click', rewindVideo);

    // --- Core Functions ---
    function handleFileUpload(file) {
        console.log("File selected:", file.name);

        // Use helper functions from ui.js
        showUploadedFile(file);
        const videoPlayer = createVideoPlayer(file);
        state.videoPlayer = videoPlayer; // Store player in the shared state
        
        updateVideoControls(true); // Enable video controls

        console.log("Video preview created and controls enabled.");
    }
});
