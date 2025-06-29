// This file will handle the interactions for opening and closing the face analysis modal.

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const openModalBtn = document.querySelector('[data-action="analyze-faces"]');
    const closeModalBtn = document.getElementById('face-modal-close-btn');
    const faceModal = document.getElementById('face-analysis-modal');
    const mainVideo = document.getElementById('videoPlayer'); // The main video player
    const modalVideo = document.getElementById('face-video'); // The video player inside the modal

    if (!openModalBtn || !closeModalBtn || !faceModal || !mainVideo || !modalVideo) {
        console.warn('UI interaction elements for modal not found. Modal functionality will be disabled.');
        return;
    }
    
    // --- Event Listeners ---

    // Open the modal
    openModalBtn.addEventListener('click', () => {
        if (!mainVideo.src || mainVideo.src === window.location.href) {
            alert('먼저 메인 비디오를 업로드해주세요.');
            return;
        }

        console.log('Opening face analysis modal.');
        // Pass the video source from the main player to the modal player
        modalVideo.src = mainVideo.src;
        
        faceModal.style.display = 'flex'; // Use flex to center the modal content
        
        // Dispatch a custom event to notify that the modal is open and the video source is set.
        // The face-analysis-modal.js script will listen for this.
        modalVideo.dispatchEvent(new CustomEvent('modalopened'));
    });

    // Close the modal
    closeModalBtn.addEventListener('click', () => {
        console.log('Closing face analysis modal.');
        faceModal.style.display = 'none';
        
        // Stop and clear the modal video to free up resources
        modalVideo.pause();
        modalVideo.removeAttribute('src'); 
        modalVideo.load();
    });

    // Also close the modal if the user clicks on the background overlay
    window.addEventListener('click', (event) => {
        if (event.target === faceModal) {
            closeModalBtn.click();
        }
    });

    // --- Face Analysis ---
    domElements.faceAnalysisCheckbox.addEventListener('change', (e) => {
        domElements.faceGalleryContainer.style.display = e.target.checked ? 'block' : 'none';
    });

    domElements.analyzeFacesBtn.addEventListener('click', () => {
        if (!state.uploadedFile) {
            alert('얼굴 분석을 시작하기 전에 먼저 영상을 업로드해주세요.');
            return;
        }
        // This function will be defined in face-analysis-modal.js
        startFaceAnalysis();
    });

    // Initialize the application
    initializeApp();
}); 