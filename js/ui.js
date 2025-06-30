// This file contains UI-related helper functions.

import * as DOM from './dom-elements.js';
import { aiModels, saveApiKey, callAI as callAIApi } from './api.js';
import { loadModels, analyzeFaces } from './face-analysis.js';

let uploadedFile = null;
let chats = [];
let currentChatId = null;
let currentEditingModel = null;

// --- UI Helper Functions ---

function updateTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    DOM.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function showUploadedFile(file) {
    DOM.fileName.textContent = `파일명: ${file.name}`;
    DOM.fileSize.textContent = `파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    DOM.fileInfo.style.display = 'block';
    DOM.uploadContainer.style.display = 'none';
    DOM.videoPreviewSection.style.display = 'block';
}

function createVideoPlayer(file) {
    const videoPlayer = document.createElement('video');
    videoPlayer.src = URL.createObjectURL(file);
    videoPlayer.controls = false;
    DOM.originalVideoContainer.innerHTML = '';
    DOM.originalVideoContainer.appendChild(videoPlayer);
    return videoPlayer;
}

function updateVideoControls(enabled) {
    DOM.playBtn.disabled = !enabled;
    DOM.pauseBtn.disabled = !enabled;
    DOM.rewindBtn.disabled = !enabled;
    DOM.processBtn.disabled = !enabled;
    DOM.sendChatBtn.disabled = !enabled;
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
        DOM.chatHistory.appendChild(messageEl);
    } else {
        const thinkingMessage = DOM.chatHistory.querySelector('.thinking');
        if (thinkingMessage) {
            thinkingMessage.parentElement.parentElement.replaceWith(messageEl);
        } else {
            DOM.chatHistory.appendChild(messageEl);
        }
    }
    DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
}

function renderChatListUI(chats, currentChatId) {
    DOM.chatList.innerHTML = '';
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
        DOM.chatList.appendChild(item);
    });
}

function renderActiveChatUI(chat) {
    DOM.chatHistory.innerHTML = '';
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
    DOM.apiKeyModalTitle.textContent = `${modelData.name} API 키 설정`;
    DOM.apiKeyInput.value = modelData.apiKey || '';
    DOM.apiKeyLink.href = modelData.apiKeyUrl;
    DOM.apiKeyModal.style.display = 'block';
}

function closeApiKeyModalUI() {
    DOM.apiKeyModal.style.display = 'none';
}

function updateFolderStatusUI(isSelected, folderName = '') {
    if (isSelected && folderName) {
        DOM.outputFolder.className = 'setting-input folder-selected';
        DOM.selectFolderBtn.className = 'control-btn folder-selected';
        DOM.selectFolderBtn.innerHTML = '✅';
        DOM.selectFolderBtn.title = `현재 폴더: ${folderName}`;
        DOM.outputFolder.placeholder = `현재 선택: ${folderName}`;
    } else {
        DOM.outputFolder.className = 'setting-input folder-not-selected';
        DOM.selectFolderBtn.className = 'control-btn folder-not-selected';
        DOM.selectFolderBtn.innerHTML = '📁';
        DOM.selectFolderBtn.title = '저장 폴더를 선택하세요 (필수)';
        DOM.outputFolder.placeholder = '📁 저장 폴더를 먼저 선택해주세요';
    }
}

function addShortToCarouselUI(videoSrc, index) {
    const shortItem = document.createElement('div');
    shortItem.className = 'short-item';
    shortItem.style.flex = `0 0 ${DOM.shortsTrack.parentElement.offsetWidth}px`;
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
    
    DOM.shortsTrack.appendChild(shortItem);
    updateCarouselUI();
}

function updateCarouselUI(currentIndex, total) {
    const track = DOM.shortsTrack;
    const viewportWidth = track.parentElement.offsetWidth;
    
    if (total === 0) {
        DOM.resultsContainer.style.display = 'none';
        return;
    }

    DOM.resultsContainer.style.display = 'block';
    DOM.prevShortBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    DOM.nextShortBtn.style.display = currentIndex < total - 1 ? 'block' : 'none';
    
    const offset = -currentIndex * viewportWidth;
    track.style.transform = `translateX(${offset}px)`;
    
    DOM.shortsCounter.textContent = `${currentIndex + 1} / ${total}`;
}

// --- Theme Logic ---
function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    DOM.themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// --- File Handling Logic ---
function handleFile(file) {
    uploadedFile = file;
    DOM.fileName.textContent = file.name;
    DOM.fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    DOM.fileInfo.style.display = 'block';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.videoPreview.src = e.target.result;
        DOM.videoPlaceholder.style.display = 'none';
        DOM.videoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    DOM.uploadContainer.style.display = 'none';
    DOM.videoPreviewSection.style.display = 'block';
    
    DOM.playBtn.disabled = false;
    DOM.pauseBtn.disabled = false;
    DOM.rewindBtn.disabled = false;
    DOM.fastForwardBtn.disabled = false;
    DOM.playbackSpeedSelect.disabled = false;

    updateProcessButtonState();
}

function updateSendButtonState() {
    DOM.sendChatBtn.disabled = DOM.chatInput.value.trim() === '';
}

// --- State Update & UI Logic ---
function updateProcessButtonState() {
    const platformsSelected = Array.from(DOM.platformCards).some(c => c.classList.contains('selected'));
    DOM.processBtn.disabled = !uploadedFile || !platformsSelected;
}

// --- Chat Logic (Simplified) ---
function addMessage(sender, text) {
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if(currentChat) {
        currentChat.messages.push({ sender, text });
        renderChatHistory();
    }
}

function renderChatHistory() {
    DOM.chatHistory.innerHTML = '';
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;
    currentChat.messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${msg.sender}-message`);
        messageElement.innerHTML = `<div class="avatar">${msg.sender === 'ai' ? '🤖' : '👤'}</div><div class="message-content">${msg.text.replace(/\n/g, '<br>')}</div>`;
        DOM.chatHistory.appendChild(messageElement);
    });
    DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
}

function startNewChat() {
    currentChatId = `chat_${Date.now()}`;
    chats.push({
        id: currentChatId,
        title: `새 대화 ${new Date().toLocaleString()}`,
        messages: [{ sender: 'ai', text: `안녕하세요! 영상 처리를 도와드릴 AI 어시스턴트입니다.` }]
    });
    renderAll();
}

function renderChatList() {
    DOM.chatList.innerHTML = '';
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-list-item' + (chat.id === currentChatId ? ' active' : '');
        item.innerHTML = `<span>${chat.title}</span>`;
        item.addEventListener('click', () => { currentChatId = chat.id; renderAll(); });
        DOM.chatList.appendChild(item);
    });
}

function renderAll() {
    renderChatList();
    renderChatHistory();
}

async function handleSendMessage() {
    const text = DOM.chatInput.value.trim();
    if (!text) return;

    const modelKey = DOM.mainModelSelect.value;
    const subModel = DOM.subModelSelect.value;
    addMessageToHistory('user', text);
    DOM.chatInput.value = '';
    updateSendButtonState();
    DOM.chatInput.disabled = true;
    addMessageToHistory('ai', '', true); // Show thinking indicator

    try {
        const systemPrompt = "You are a helpful assistant for video editing.";
        const aiResponse = await callAIApi(modelKey, subModel, systemPrompt, text);
        addMessageToHistory('ai', aiResponse);

    } catch (error) {
        addMessageToHistory('ai', `오류가 발생했습니다: ${error.message}`);
    } finally {
        DOM.chatInput.disabled = false;
        DOM.chatInput.focus();
        updateSendButtonState();
    }
}

function initializeModelSelects() {
    DOM.mainModelSelect.innerHTML = '';
    for (const key in aiModels) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = aiModels[key].name;
        DOM.mainModelSelect.appendChild(option);
    }
    updateSubModels();
}

function updateSubModels() {
    const selectedModelKey = DOM.mainModelSelect.value;
    DOM.subModelSelect.innerHTML = '';
    if (aiModels[selectedModelKey] && aiModels[selectedModelKey].subModels) {
        aiModels[selectedModelKey].subModels.forEach(modelName => {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            DOM.subModelSelect.appendChild(option);
        });
    }
}

function openApiKeyModal() {
    const selectedModelKey = DOM.mainModelSelect.value;
    currentEditingModel = selectedModelKey;
    const modelData = aiModels[selectedModelKey];
    
    DOM.apiKeyModalTitle.textContent = `${modelData.name} API 키 설정`;
    DOM.apiKeyInput.value = modelData.apiKey || '';
    DOM.apiKeyLink.href = modelData.apiKeyUrl;
    DOM.apiKeyModal.style.display = 'block';
}

function closeApiKeyModal() {
    DOM.apiKeyModal.style.display = 'none';
}

function setupEventListeners() {
    // Theme
    DOM.themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        DOM.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // File Handling
    DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
    DOM.uploadContainer.addEventListener('click', () => DOM.fileInput.click());
    DOM.uploadContainer.addEventListener('dragover', (e) => e.preventDefault());
    DOM.uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    DOM.loadNewVideoButton.addEventListener('click', () => DOM.fileInput.click());

    // Video Controls
    DOM.playBtn.addEventListener('click', () => DOM.videoPreview.play());
    DOM.pauseBtn.addEventListener('click', () => DOM.videoPreview.pause());
    DOM.rewindBtn.addEventListener('click', () => DOM.videoPreview.currentTime -= 10);
    DOM.fastForwardBtn.addEventListener('click', () => DOM.videoPreview.currentTime += 10);
    DOM.playbackSpeedSelect.addEventListener('change', (e) => {
        DOM.videoPreview.playbackRate = parseFloat(e.target.value);
    });

    // Platform Cards
    DOM.platformCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            updateProcessButtonState();
        });
    });

    // Chat
    DOM.newChatBtn.addEventListener('click', startNewChat);
    DOM.sendChatBtn.addEventListener('click', handleSendMessage);
    DOM.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    DOM.chatInput.addEventListener('input', updateSendButtonState);

    // Other Buttons
    DOM.processBtn.addEventListener('click', () => {
        addMessage('ai', '영상 처리 기능은 다음 단계에서 구현될 예정입니다.');
    });

    DOM.faceAnalysisCheckbox.addEventListener('change', () => {
        DOM.faceGalleryContainer.style.display = DOM.faceAnalysisCheckbox.checked ? 'block' : 'none';
    });

    // API Modal & Model Selection
    DOM.mainModelSelect.addEventListener('change', updateSubModels);
    DOM.apiSettingsBtn.addEventListener('click', openApiKeyModal);
    DOM.saveApiKeyBtn.addEventListener('click', () => {
        if (currentEditingModel) {
            saveApiKey(currentEditingModel, DOM.apiKeyInput.value);
            alert(`${aiModels[currentEditingModel].name} API 키가 저장되었습니다.`);
            closeApiKeyModal();
        }
    });
    DOM.cancelApiKeyBtn.addEventListener('click', closeApiKeyModal);
    DOM.closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);

    // Face Analysis Button
    DOM.analyzeFacesBtn.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert("먼저 영상 파일을 업로드해주세요.");
            return;
        }
        console.log("얼굴 분석 버튼 클릭됨");
        DOM.analyzeFacesBtn.disabled = true;
        DOM.analyzeFacesBtn.textContent = "분석 중...";
        
        const videoElement = DOM.videoPreview;
        // Ensure video is ready
        if (videoElement.readyState < 2) {
             videoElement.addEventListener('loadeddata', async () => {
                await analyzeFaces(videoElement);
             }, { once: true });
        } else {
             await analyzeFaces(videoElement);
        }

        DOM.analyzeFacesBtn.disabled = false;
        DOM.analyzeFacesBtn.textContent = "얼굴 분석 시작";
    });
}

export function initializeUI() {
    applyInitialTheme();
    initializeModelSelects();
    loadModels(); // Load face-api models at startup
    setupEventListeners();
    updateProcessButtonState();
    startNewChat();
}