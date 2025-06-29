// This file contains UI-related helper functions.

// --- DOM Element Selectors ---
const domElements = {
    themeToggle: document.getElementById('theme-toggle'),
    uploadContainer: document.getElementById('uploadContainer'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    videoPreviewSection: document.getElementById('videoPreviewSection'),
    originalVideoContainer: document.getElementById('originalVideoContainer'),
    originalVideoPlaceholder: document.querySelector('#originalVideoContainer .video-placeholder'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    rewindBtn: document.getElementById('rewindBtn'),
    processBtn: document.getElementById('processBtn'),
    platformCards: document.querySelectorAll('.platform-card'),
    loadNewVideoButton: document.getElementById('loadNewVideoButton'),
    selectFolderBtn: document.getElementById('selectFolderBtn'),
    outputFolder: document.getElementById('outputFolder'),
    autoSave: document.getElementById('autoSave'),
    fileNaming: document.getElementById('fileNaming'),
    customName: document.getElementById('customName'),
    customNameContainer: document.getElementById('customNameContainer'),
    resultsContainer: document.getElementById('resultsContainer'),
    shortsTrack: document.getElementById('shortsTrack'),
    prevShortBtn: document.getElementById('prevShortBtn'),
    nextShortBtn: document.getElementById('nextShortBtn'),
    shortsCounter: document.getElementById('shorts-counter'),
    chatHistory: document.getElementById('chatHistory'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    chatList: document.getElementById('chatList'),
    selectAllChats: document.getElementById('selectAllChats'),
    saveChatsBtn: document.getElementById('saveChatsBtn'),
    loadChatsBtn: document.getElementById('loadChatsBtn'),
    loadChatsInput: document.getElementById('loadChatsInput'),
    deleteChatsBtn: document.getElementById('deleteChatsBtn'),
    faceAnalysisCheckbox: document.getElementById('faceAnalysis'),
    faceGalleryContainer: document.getElementById('faceGalleryContainer'),
    analyzeFacesBtn: document.getElementById('analyzeFacesBtn'),
    analysisProgress: document.getElementById('analysisProgress'),
    faceProgressFill: document.getElementById('faceProgressFill'),
    faceProgressText: document.getElementById('faceProgressText'),
    faceResults: document.getElementById('faceResults'),
    mainModelSelect: document.getElementById('mainModelSelect'),
    subModelSelect: document.getElementById('subModelSelect'),
    apiSettingsBtn: document.getElementById('apiSettingsBtn'),
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyModalTitle: document.getElementById('apiKeyModalTitle'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeyLink: document.getElementById('apiKeyLink'),
    saveApiKeyBtn: document.getElementById('saveApiKey'),
    cancelApiKeyBtn: document.getElementById('cancelApiKey'),
    closeApiKeyModalBtn: document.querySelector('#apiKeyModal .close-button')
};

// --- UI Helper Functions ---

function updateTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    domElements.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function showUploadedFile(file) {
    domElements.fileName.textContent = `파일명: ${file.name}`;
    domElements.fileSize.textContent = `파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    domElements.fileInfo.style.display = 'block';
    domElements.uploadContainer.style.display = 'none';
    domElements.videoPreviewSection.style.display = 'block';
}

function createVideoPlayer(file) {
    const videoPlayer = document.createElement('video');
    videoPlayer.src = URL.createObjectURL(file);
    videoPlayer.controls = false;
    domElements.originalVideoContainer.innerHTML = '';
    domElements.originalVideoContainer.appendChild(videoPlayer);
    return videoPlayer;
}

function updateVideoControls(enabled) {
    domElements.playBtn.disabled = !enabled;
    domElements.pauseBtn.disabled = !enabled;
    domElements.rewindBtn.disabled = !enabled;
    domElements.processBtn.disabled = !enabled;
    domElements.sendChatBtn.disabled = !enabled;
}

function addMessageToHistory(role, content, isThinking = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}-message`;

    let contentHTML = '';
    if (isThinking) {
        contentHTML = `<p class="thinking">● ● ●</p>`;
    } else {
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre><code>${p1.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        contentHTML = `<p>${formattedContent}</p>`;
    }

    messageEl.innerHTML = `
        <div class="avatar">${role === 'ai' ? '🤖' : '👤'}</div>
        <div class="message-content">${contentHTML}</div>
    `;

    if (isThinking) {
        domElements.chatHistory.appendChild(messageEl);
    } else {
        const thinkingMessage = domElements.chatHistory.querySelector('.thinking');
        if (thinkingMessage) {
            thinkingMessage.parentElement.parentElement.replaceWith(messageEl);
        } else {
            domElements.chatHistory.appendChild(messageEl);
        }
    }
    domElements.chatHistory.scrollTop = domElements.chatHistory.scrollHeight;
}

function renderChatListUI(chats, currentChatId) {
    domElements.chatList.innerHTML = '';
    chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.dataset.id = chat.id;
        item.innerHTML = `
            <input type="checkbox" class="chat-checkbox">
            <span class="chat-list-item-title">${chat.title}</span>
        `;
        if (chat.id === currentChatId) {
            item.classList.add('active');
        }
        domElements.chatList.appendChild(item);
    });
}

function renderActiveChatUI(chat) {
    domElements.chatHistory.innerHTML = '';
    if (chat) {
        chat.messages.forEach(msg => {
            addMessageToHistory(msg.role, msg.content, msg.isThinking);
        });
    }
    document.querySelectorAll('.chat-list-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === chat?.id);
    });
}

function openApiKeyModalUI(modelData) {
    domElements.apiKeyModalTitle.textContent = `${modelData.name} API 키 설정`;
    domElements.apiKeyInput.value = modelData.apiKey || '';
    domElements.apiKeyLink.href = modelData.apiKeyUrl;
    domElements.apiKeyModal.style.display = 'block';
}

function closeApiKeyModalUI() {
    domElements.apiKeyModal.style.display = 'none';
}

function updateFolderStatusUI(isSelected, folderName = '') {
    if (isSelected && folderName) {
        domElements.outputFolder.className = 'setting-input folder-selected';
        domElements.selectFolderBtn.className = 'control-btn folder-selected';
        domElements.selectFolderBtn.innerHTML = '✅';
        domElements.selectFolderBtn.title = `현재 폴더: ${folderName}`;
        domElements.outputFolder.placeholder = `현재 선택: ${folderName}`;
    } else {
        domElements.outputFolder.className = 'setting-input folder-not-selected';
        domElements.selectFolderBtn.className = 'control-btn folder-not-selected';
        domElements.selectFolderBtn.innerHTML = '📁';
        domElements.selectFolderBtn.title = '저장 폴더를 선택하세요 (필수)';
        domElements.outputFolder.placeholder = '📁 저장 폴더를 먼저 선택해주세요';
    }
}

function addShortToCarouselUI(videoSrc, index) {
    const shortItem = document.createElement('div');
    shortItem.className = 'short-item';
    shortItem.style.flex = `0 0 ${domElements.shortsTrack.parentElement.offsetWidth}px`;
    shortItem.dataset.index = index;

    shortItem.innerHTML = `
        <div class="video-container">
            <video src="${videoSrc}" loop muted></video>
            <div class="video-overlay"><i class="fas fa-play"></i></div>
            <button class="volume-btn"><i class="fas fa-volume-mute"></i></button>
        </div>
        <div class="progress-bar-container"><div class="progress-bar-fill"></div></div>
        <div class="short-controls">
            <button class="control-rewind"><i class="fas fa-undo"></i></button>
            <button class="control-playpause active"><i class="fas fa-play"></i></button>
            <button class="control-delete"><i class="fas fa-trash"></i></button>
        </div>
        <div class="short-info">
            <span>Short #${index + 1}</span>
            <button class="download-btn" onclick="downloadSingleShort(this, ${index})">💾 다운로드</button>
        </div>
    `;
    
    domElements.shortsTrack.appendChild(shortItem);
    updateCarouselUI();
}

function updateCarouselUI(currentIndex, total) {
    const track = domElements.shortsTrack;
    const viewportWidth = track.parentElement.offsetWidth;
    
    if (total === 0) {
        domElements.resultsContainer.style.display = 'none';
        return;
    }

    domElements.resultsContainer.style.display = 'block';
    domElements.prevShortBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    domElements.nextShortBtn.style.display = currentIndex < total - 1 ? 'block' : 'none';
    
    const offset = -currentIndex * viewportWidth;
    track.style.transform = `translateX(${offset}px)`;
    
    domElements.shortsCounter.textContent = `${currentIndex + 1} / ${total}`;
} 