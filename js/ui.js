// This file contains UI-related helper functions.

function updateTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

function addMessage(sender, text) {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender === 'user' ? 'user-message' : 'ai-message');

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = sender === 'user' ? '🧑' : '🤖';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    const p = document.createElement('p');
    p.textContent = text;
    messageContent.appendChild(p);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


function updateFolderStatus(isSelected, folderName = '') {
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const outputFolder = document.getElementById('outputFolder');
    
    if (!selectFolderBtn || !outputFolder) return;

    if (isSelected && folderName) {
        outputFolder.className = 'setting-input folder-selected';
        selectFolderBtn.className = 'control-btn folder-selected';
        selectFolderBtn.innerHTML = '✅';
        selectFolderBtn.title = `현재 폴더: ${folderName}`;
        outputFolder.placeholder = `현재 선택: ${folderName}`;
    } else {
        outputFolder.className = 'setting-input folder-not-selected';
        selectFolderBtn.className = 'control-btn folder-not-selected';
        selectFolderBtn.innerHTML = '📁';
        selectFolderBtn.title = '저장 폴더를 선택하세요 (필수)';
        outputFolder.placeholder = '📁 저장 폴더를 먼저 선택해주세요';
    }
}

function updateShortsCarousel(shorts) {
    const shortsTrack = document.getElementById('shortsTrack');
    const shortsCounter = document.getElementById('shorts-counter');
    const prevShortBtn = document.getElementById('prevShortBtn');
    const nextShortBtn = document.getElementById('nextShortBtn');
    
    if (!shortsTrack || !shortsCounter || !prevShortBtn || !nextShortBtn) return;

    shortsTrack.innerHTML = ''; // Clear previous shorts
    
    if (shorts.length === 0) {
        shortsCounter.textContent = '완성된 숏츠 영상이 없습니다.';
        prevShortBtn.style.display = 'none';
        nextShortBtn.style.display = 'none';
        return;
    }

    shorts.forEach((shortData, index) => {
        const shortItem = document.createElement('div');
        shortItem.className = 'short-item';
        shortItem.style.flex = '0 0 100%'; // Each item takes full width of viewport
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        const video = document.createElement('video');
        video.src = shortData.src;
        video.loop = true;
        
        const shortControls = document.createElement('div');
        shortControls.className = 'short-controls';
        
        // Add more controls here if needed, e.g., play/pause, volume
        
        videoContainer.appendChild(video);
        shortItem.appendChild(videoContainer);
        shortItem.appendChild(shortControls);
        
        shortsTrack.appendChild(shortItem);
    });

    updateCarouselView(0, shorts.length);
}

function updateCarouselView(currentIndex, total) {
    const shortsTrack = document.getElementById('shortsTrack');
    const shortsCounter = document.getElementById('shorts-counter');
    const prevShortBtn = document.getElementById('prevShortBtn');
    const nextShortBtn = document.getElementById('nextShortBtn');

    if (!shortsTrack || !shortsCounter || !prevShortBtn || !nextShortBtn) return;
    
    const offset = -currentIndex * 100;
    shortsTrack.style.transform = `translateX(${offset}%)`;
    
    shortsCounter.textContent = `${currentIndex + 1} / ${total}`;
    
    prevShortBtn.style.display = total > 1 ? 'block' : 'none';
    nextShortBtn.style.display = total > 1 ? 'block' : 'none';

    prevShortBtn.disabled = currentIndex === 0;
    nextShortBtn.disabled = currentIndex === total - 1;

    // Autoplay current video
    const videos = shortsTrack.querySelectorAll('video');
    videos.forEach((v, i) => {
        if (i === currentIndex) {
            v.play().catch(e => console.log("Autoplay prevented"));
        } else {
            v.pause();
            v.currentTime = 0;
        }
    });
} 