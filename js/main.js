document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---

    // Theme
    const themeToggle = document.getElementById('theme-toggle');

    // Upload
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('fileInfo');
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');

    // Video Preview
    const videoPreviewSection = document.getElementById('videoPreviewSection');
    const originalVideoContainer = document.getElementById('originalVideoContainer');
    const originalVideoPlaceholder = originalVideoContainer.querySelector('.video-placeholder');
    let videoPlayer = null; // Will be created dynamically

    // Controls
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const processBtn = document.getElementById('processBtn');
    const platformCards = document.querySelectorAll('.platform-card');
    const loadNewVideoButton = document.getElementById('loadNewVideoButton');

    // Storage and Naming
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const outputFolder = document.getElementById('outputFolder');
    const autoSaveCheckbox = document.getElementById('autoSave');
    const fileNamingSelect = document.getElementById('fileNaming');
    const customNameContainer = document.getElementById('customNameContainer');
    const customNameInput = document.getElementById('customName');

    // Results Carousel
    const resultsContainer = document.getElementById('resultsContainer');
    const shortsTrack = document.getElementById('shortsTrack');
    const prevShortBtn = document.getElementById('prevShortBtn');
    const nextShortBtn = document.getElementById('nextShortBtn');
    const shortsCounter = document.getElementById('shorts-counter');

    // Chat
    const chatHistory = document.getElementById('chatHistory');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const newChatBtn = document.getElementById('newChatBtn');

    // Chat List
    const chatList = document.getElementById('chatList');
    const selectAllChats = document.getElementById('selectAllChats');
    const saveChatsBtn = document.getElementById('saveChatsBtn');
    const loadChatsBtn = document.getElementById('loadChatsBtn');
    const loadChatsInput = document.getElementById('loadChatsInput');
    const deleteChatsBtn = document.getElementById('deleteChatsBtn');
    
    // Face Analysis (Main Page)
    const faceAnalysisCheckbox = document.getElementById('faceAnalysis');
    const faceGalleryContainer = document.getElementById('faceGalleryContainer');
    const analyzeFacesBtn = document.getElementById('analyzeFacesBtn');
    const analysisProgress = document.getElementById('analysisProgress');
    const faceProgressFill = document.getElementById('faceProgressFill');
    const faceProgressText = document.getElementById('faceProgressText');
    const faceResults = document.getElementById('faceResults');

    // LLM & API
    const mainModelSelect = document.getElementById('mainModelSelect');
    const subModelSelect = document.getElementById('subModelSelect');
    const apiSettingsBtn = document.getElementById('apiSettingsBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const closeApiKeyModalBtn = apiKeyModal.querySelector('.close-button');
    const apiKeyModalTitle = document.getElementById('apiKeyModalTitle');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyLink = document.getElementById('apiKeyLink');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const cancelApiKeyBtn = document.getElementById('cancelApiKey');


    // --- State Variables ---
    let uploadedFile = null;
    let chats = [];
    let currentChatId = null;
    let selectedPlatforms = [];
    let outputFolderHandle = null;
    let shortsCarouselIndex = 0;
    let llmModels = {};
    let currentProvider = '';

    // --- Initialization ---

    initializeTheme();
    loadModelsAndSettings();
    loadChatsFromLocalStorage();
    renderChatList();
    displayActiveChat();


    // --- Event Listeners ---

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // File Upload
    uploadContainer.addEventListener('click', () => fileInput.click());
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
    });
    uploadContainer.addEventListener('dragleave', () => uploadContainer.classList.remove('dragover'));
    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    loadNewVideoButton.addEventListener('click', () => fileInput.click());


    // Video Controls
    playBtn.addEventListener('click', () => videoPlayer?.play());
    pauseBtn.addEventListener('click', () => videoPlayer?.pause());
    rewindBtn.addEventListener('click', () => {
        if (videoPlayer) videoPlayer.currentTime = 0;
    });

    // Options & Processing
    platformCards.forEach(card => card.addEventListener('click', () => togglePlatformSelection(card)));
    processBtn.addEventListener('click', startProcessing);
    fileNamingSelect.addEventListener('change', handleFileNamingChange);
    
    // Face Analysis Checkbox
    faceAnalysisCheckbox.addEventListener('change', () => {
        faceGalleryContainer.style.display = faceAnalysisCheckbox.checked ? 'block' : 'none';
    });

    // Storage
    selectFolderBtn.addEventListener('click', selectOutputFolder);

    // Results Carousel
    prevShortBtn.addEventListener('click', () => moveCarousel(-1));
    nextShortBtn.addEventListener('click', () => moveCarousel(1));

    // Chat
    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    newChatBtn.addEventListener('click', createNewChat);

    // Chat List
    chatList.addEventListener('click', handleChatListClick);
    selectAllChats.addEventListener('change', toggleSelectAllChats);
    saveChatsBtn.addEventListener('click', saveChatsToFile);
    loadChatsBtn.addEventListener('click', () => loadChatsInput.click());
    loadChatsInput.addEventListener('change', loadChatsFromFile);
    deleteChatsBtn.addEventListener('click', deleteSelectedChats);

    // API & LLM
    apiSettingsBtn.addEventListener('click', openApiKeyModal);
    closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);
    cancelApiKeyBtn.addEventListener('click', closeApiKeyModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    mainModelSelect.addEventListener('change', handleProviderChange);
    window.addEventListener('click', (event) => {
        if (event.target == apiKeyModal) {
            closeApiKeyModal();
        }
    });


    // --- Functions ---

    // Theme
    function initializeTheme() {
        if (localStorage.getItem('theme') === 'dark-mode') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }

    // File Handling
    function handleFileUpload(file) {
        uploadedFile = file;
        fileNameElement.textContent = `파일명: ${file.name}`;
        fileSizeElement.textContent = `파일 크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        fileInfo.style.display = 'block';
        uploadContainer.style.display = 'none';
        videoPreviewSection.style.display = 'block';

        if (videoPlayer) {
            videoPlayer.remove();
        }
        videoPlayer = document.createElement('video');
        videoPlayer.src = URL.createObjectURL(file);
        videoPlayer.controls = false; // Hide default controls
        originalVideoContainer.innerHTML = ''; // Clear placeholder
        originalVideoContainer.appendChild(videoPlayer);
        
        updateControlsState(true);
        processBtn.disabled = false;
        sendChatBtn.disabled = false;
    }

    function updateControlsState(enabled) {
        playBtn.disabled = !enabled;
        pauseBtn.disabled = !enabled;
        rewindBtn.disabled = !enabled;
    }

    // Processing
    function togglePlatformSelection(card) {
        const platform = card.dataset.platform;
        card.classList.toggle('selected');
        if (selectedPlatforms.includes(platform)) {
            selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
        } else {
            selectedPlatforms.push(platform);
        }
    }

    function startProcessing() {
        if (!uploadedFile) {
            alert("영상을 먼저 업로드해주세요.");
            return;
        }
        // Placeholder for processing logic
        console.log("Processing started for:", uploadedFile.name);
        console.log("Selected platforms:", selectedPlatforms);
        // This is where you would call your backend or video processing library.
        // For demonstration, we'll just simulate a result.
        setTimeout(() => addShortToCarousel('https://via.placeholder.com/270x480.mp4/000000/FFFFFF?text=Short+1'), 1000);
        setTimeout(() => addShortToCarousel('https://via.placeholder.com/270x480.mp4/000000/FFFFFF?text=Short+2'), 2000);
    }
    
    function handleFileNamingChange() {
        customNameContainer.style.display = fileNamingSelect.value === 'custom' ? 'block' : 'none';
    }

    // Storage
    async function selectOutputFolder() {
        try {
            outputFolderHandle = await window.showDirectoryPicker();
            const folderName = outputFolderHandle.name;
            outputFolder.value = folderName;
            outputFolder.classList.add('folder-selected');
            outputFolder.classList.remove('folder-not-selected');
            selectFolderBtn.classList.add('folder-selected');
            selectFolderBtn.classList.remove('folder-not-selected');
        } catch (err) {
            console.error("폴더 선택이 취소되었거나 오류가 발생했습니다.", err);
        }
    }
    
    // Results Carousel
    function addShortToCarousel(videoSrc) {
        const shortItem = document.createElement('div');
        shortItem.className = 'short-item';
        shortItem.style.flex = `0 0 ${shortsTrack.parentElement.offsetWidth}px`;

        shortItem.innerHTML = `
            <div class="video-container">
                <video src="${videoSrc}" loop muted></video>
                <div class="video-overlay"><i class="fas fa-play"></i></div>
                <button class="volume-btn"><i class="fas fa-volume-mute"></i></button>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill"></div>
            </div>
            <div class="short-controls">
                <button class="control-rewind"><i class="fas fa-undo"></i></button>
                <button class="control-playpause active"><i class="fas fa-play"></i></button>
                <button class="control-delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        const video = shortItem.querySelector('video');
        const playPauseBtn = shortItem.querySelector('.control-playpause');
        
        // Auto-play when it comes into view
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                video.play().catch(e => console.error("Autoplay failed", e));
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }, { threshold: 0.7 });
        observer.observe(shortItem);
        
        shortsTrack.appendChild(shortItem);
        updateCarousel();
    }

    function updateCarousel() {
        const itemCount = shortsTrack.children.length;
        if (itemCount === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        resultsContainer.style.display = 'block';
        prevShortBtn.style.display = shortsCarouselIndex > 0 ? 'block' : 'none';
        nextShortBtn.style.display = shortsCarouselIndex < itemCount - 1 ? 'block' : 'none';
        
        const offset = -shortsCarouselIndex * shortsTrack.parentElement.offsetWidth;
        shortsTrack.style.transform = `translateX(${offset}px)`;
        
        shortsCounter.textContent = `${shortsCarouselIndex + 1} / ${itemCount}`;
    }

    function moveCarousel(direction) {
        const itemCount = shortsTrack.children.length;
        const newIndex = shortsCarouselIndex + direction;
        if (newIndex >= 0 && newIndex < itemCount) {
            shortsCarouselIndex = newIndex;
            updateCarousel();
        }
    }
    
    // Chat & LLM
    function generateUUID() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    
    function createNewChat() {
        const newChat = {
            id: generateUUID(),
            title: "새로운 대화",
            messages: [{
                role: 'ai',
                content: '안녕하세요! 무엇을 도와드릴까요?'
            }],
            createdAt: new Date().toISOString()
        };
        chats.unshift(newChat);
        currentChatId = newChat.id;
        saveChatsToLocalStorage();
        renderChatList();
        displayActiveChat();
    }

    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessageToChat('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Show thinking indicator
        addMessageToChat('ai', '...', true); // true for thinking
        sendChatToAI(message);
    }

    function addMessageToChat(role, content, isThinking = false) {
        const activeChat = chats.find(c => c.id === currentChatId);
        if (!activeChat) return;

        if (isThinking) {
            const thinkingMessage = { role: 'ai', content: '...', isThinking: true };
            activeChat.messages.push(thinkingMessage);
        } else {
            // Remove previous thinking message if it exists
            const lastMessage = activeChat.messages[activeChat.messages.length - 1];
            if (lastMessage && lastMessage.isThinking) {
                activeChat.messages.pop();
            }
            activeChat.messages.push({ role, content });
        }
        
        if (role === 'user' && activeChat.messages.length === 2 && activeChat.title === "새로운 대화") {
            activeChat.title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
            renderChatList(); // Update list with new title
        }
        
        saveChatsToLocalStorage();
        displayActiveChat();
    }

    function displayActiveChat() {
        const activeChat = chats.find(c => c.id === currentChatId);
        chatHistory.innerHTML = '';
        if (activeChat) {
            activeChat.messages.forEach(msg => {
                const messageEl = document.createElement('div');
                messageEl.className = `chat-message ${msg.role}-message`;
                
                let contentHTML = '';
                if (msg.isThinking) {
                    contentHTML = `<p class="thinking">● ● ●</p>`;
                } else {
                    // Basic Markdown-like formatting for bold and code
                    let formattedContent = msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                        .replace(/`(.*?)`/g, '<code>$1</code>');
                    contentHTML = `<p>${formattedContent}</p>`;
                }

                messageEl.innerHTML = `
                    <div class="avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                    <div class="message-content">${contentHTML}</div>
                `;
                chatHistory.appendChild(messageEl);
            });
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        
        // Highlight active chat in the list
        document.querySelectorAll('.chat-list-item').forEach(item => item.classList.remove('active'));
        const chatListItem = document.querySelector(`.chat-list-item[data-id="${currentChatId}"]`);
        if (chatListItem) {
            chatListItem.classList.add('active');
        }
    }

    function renderChatList() {
        chatList.innerHTML = '';
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
            chatList.appendChild(item);
        });
    }

    function handleChatListClick(e) {
        const target = e.target;
        const chatItem = target.closest('.chat-list-item');
        if (!chatItem) return;

        if (target.type === 'checkbox') {
            return; // Checkbox click is handled separately or by parent logic
        }

        const chatId = chatItem.dataset.id;
        currentChatId = chatId;
        saveChatsToLocalStorage();
        displayActiveChat();
    }

    // Chat Data Management
    function saveChatsToLocalStorage() {
        localStorage.setItem('chats', JSON.stringify(chats));
        localStorage.setItem('currentChatId', currentChatId);
    }

    function loadChatsFromLocalStorage() {
        chats = JSON.parse(localStorage.getItem('chats')) || [];
        currentChatId = localStorage.getItem('currentChatId');
        if (!currentChatId && chats.length > 0) {
            currentChatId = chats[0].id;
        }
        if (chats.length === 0) {
            createNewChat();
        }
    }

    function toggleSelectAllChats() {
        const checkboxes = chatList.querySelectorAll('.chat-checkbox');
        checkboxes.forEach(cb => cb.checked = selectAllChats.checked);
    }

    function saveChatsToFile() {
        const dataStr = JSON.stringify(chats, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chats.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function loadChatsFromFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedChats = JSON.parse(event.target.result);
                // Basic validation
                if (Array.isArray(loadedChats)) {
                    chats = loadedChats;
                    currentChatId = chats.length > 0 ? chats[0].id : null;
                    saveChatsToLocalStorage();
                    renderChatList();
                    displayActiveChat();
                } else {
                    alert("잘못된 파일 형식입니다.");
                }
            } catch (error) {
                alert("파일을 읽는 중 오류가 발생했습니다.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    function deleteSelectedChats() {
        const selectedIds = [];
        const checkboxes = chatList.querySelectorAll('.chat-checkbox:checked');
        checkboxes.forEach(cb => {
            selectedIds.push(cb.closest('.chat-list-item').dataset.id);
        });

        if (selectedIds.length === 0) {
            alert("삭제할 대화를 선택해주세요.");
            return;
        }

        chats = chats.filter(c => !selectedIds.includes(c.id));
        if (selectedIds.includes(currentChatId)) {
            currentChatId = chats.length > 0 ? chats[0].id : null;
        }
        
        saveChatsToLocalStorage();
        renderChatList();
        displayActiveChat();
    }
    
    // API Key Modal
    function loadModelsAndSettings() {
        // This would typically be fetched from a config file or server
        llmModels = {
            'OpenAI': {
                name: 'OpenAI',
                models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                link: 'https://platform.openai.com/api-keys',
                endpoint: 'https://api.openai.com/v1/chat/completions'
            },
            'Anthropic': {
                name: 'Anthropic',
                models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
                link: 'https://console.anthropic.com/settings/keys',
                endpoint: "https://api.anthropic.com/v1/messages"
            },
            'Google': {
                name: 'Google',
                models: ['gemini-1.5-pro-latest', 'gemini-pro'],
                link: 'https://aistudio.google.com/app/apikey',
                endpoint: "https://generativelanguage.googleapis.com/v1beta/models"
            },
            'Groq': {
                name: 'Groq',
                models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
                link: 'https://console.groq.com/keys',
                endpoint: 'https://api.groq.com/openai/v1/chat/completions'
            }
        };

        mainModelSelect.innerHTML = Object.keys(llmModels).map(p => `<option value="${p}">${llmModels[p].name}</option>`).join('');
        
        const savedProvider = localStorage.getItem('llmProvider') || 'OpenAI';
        mainModelSelect.value = savedProvider;
        
        handleProviderChange();
    }
    
    function handleProviderChange() {
        currentProvider = mainModelSelect.value;
        const providerData = llmModels[currentProvider];
        subModelSelect.innerHTML = providerData.models.map(m => `<option value="${m}">${m}</option>`).join('');
        localStorage.setItem('llmProvider', currentProvider);
    }

    function openApiKeyModal() {
        const providerData = llmModels[currentProvider];
        apiKeyModalTitle.textContent = `${providerData.name} API 키 설정`;
        apiKeyLink.href = providerData.link;
        const savedKey = localStorage.getItem(`${currentProvider}_apiKey`);
        apiKeyInput.value = savedKey || '';
        apiKeyModal.style.display = 'block';
    }

    function closeApiKeyModal() {
        apiKeyModal.style.display = 'none';
    }

    function saveApiKey() {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem(`${currentProvider}_apiKey`, key);
            alert(`${llmModels[currentProvider].name} API 키가 저장되었습니다.`);
            closeApiKeyModal();
        } else {
            alert('API 키를 입력해주세요.');
        }
    }

    async function sendChatToAI(message) {
        const activeChat = chats.find(c => c.id === currentChatId);
        if (!activeChat) return;
        
        try {
            const currentOptions = getCurrentOptions();
            const optionsText = formatOptionsForAI(currentOptions);
            const fullPrompt = `${message}\n\n${optionsText}`;

            const responseText = await callLlmApi(fullPrompt, activeChat.messages);
            addMessageToChat('ai', responseText);

        } catch (error) {
            console.error('LLM API Error:', error);
            addMessageToChat('ai', `오류가 발생했습니다: ${error.message}`);
        }
    }

    function getCurrentOptions() {
        const selectedPlatforms = Array.from(document.querySelectorAll('.platform-card.selected'))
            .map(card => card.innerText.trim());

        return {
            platforms: selectedPlatforms,
            settings: {
                shortsLength: document.getElementById('shortsLength').value,
                shortsCount: document.getElementById('shortsCount').value
            },
            aiModel: {
                provider: mainModelSelect.options[mainModelSelect.selectedIndex].text,
                model: subModelSelect.value
            },
        };
    }

    function formatOptionsForAI(options) {
        let text = "--- 현재 설정 ---\n";
        text += `플랫폼: ${options.platforms.join(', ') || '선택 안됨'}\n`;
        text += `숏츠 길이: ${options.settings.shortsLength}초, 생성 개수: ${options.settings.shortsCount}개\n`;
        text += `AI 모델: ${options.aiModel.provider} (${options.aiModel.model})\n`;
        text += "------------------";
        return text;
    }

    async function callLlmApi(prompt, history) {
        const provider = mainModelSelect.value;
        const model = subModelSelect.value;
        const apiKey = localStorage.getItem(`${provider}_apiKey`);

        if (!apiKey) {
            openApiKeyModal();
            throw new Error(`${llmModels[provider].name} API 키가 설정되지 않았습니다. 설정 후 다시 시도해주세요.`);
        }

        const endpoint = llmModels[provider].endpoint;
        const headers = {
            'Content-Type': 'application/json'
        };
        let body;

        const messagesForApi = history.filter(m => !m.isThinking).map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
        }));
        // Add the current prompt as the last message
        messagesForApi.push({ role: 'user', content: prompt });


        switch (provider) {
            case 'OpenAI':
            case 'Groq':
                 headers.Authorization = `Bearer ${apiKey}`;
                 body = JSON.stringify({
                     model: model,
                     messages: messagesForApi,
                 });
                 break;
            case 'Anthropic':
                headers['x-api-key'] = apiKey;
                headers['anthropic-version'] = '2023-06-01';
                body = JSON.stringify({
                    model: model,
                    max_tokens: 4096,
                    messages: messagesForApi.filter(m => m.content !== '...'),
                });
                break;
            case 'Google':
                // The Gemini API format is a bit different
                const geminiEndpoint = `${endpoint}/${model}:generateContent?key=${apiKey}`;
                const contents = messagesForApi.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user', 
                    parts: [{ text: m.content }]
                }));
                
                const res = await fetch(geminiEndpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ contents })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Google API Error: ${errorData.error.message}`);
                }
                const data = await res.json();
                return data.candidates[0].content.parts[0].text;

            default:
                throw new Error('지원하지 않는 AI 제공자입니다.');
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API 오류: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const responseData = await response.json();
        
        if (provider === 'Anthropic') {
            return responseData.content[0].text;
        }
        return responseData.choices[0].message.content;
    }
});
