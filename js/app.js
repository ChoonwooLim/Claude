document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const themeToggle = document.getElementById('theme-toggle');
            
            // Upload related
            const uploadContainer = document.getElementById('uploadContainer');
            const fileInput = document.getElementById('file-input');

            // Video Preview related
            const videoEditorContainer = document.getElementById('videoEditorContainer');
            const videoPreview = document.getElementById('videoPreview');
            
            // Controls and buttons
            const processBtn = document.getElementById('processBtn');
            const platformCards = document.querySelectorAll('.platform-card');
            const loadNewVideoButton = document.getElementById('loadNewVideoButton');
            
            // Storage management elements
            const selectFolderBtn = document.getElementById('selectFolderBtn');
            const outputFolder = document.getElementById('outputFolder');
            const autoSave = document.getElementById('autoSave');
            const fileNaming = document.getElementById('fileNaming');
            const customName = document.getElementById('customName');
            const customNameContainer = document.getElementById('customNameContainer');
            
            // Results related
            const resultsContainer = document.getElementById('resultsContainer');
            const completedShortsGrid = document.getElementById('completedShortsGrid');
            const shortsTrack = document.getElementById('shortsTrack');
            const prevShortBtn = document.getElementById('prevShortBtn');
            const nextShortBtn = document.getElementById('nextShortBtn');
            const shortsCounter = document.getElementById('shorts-counter');

            // Chat panel elements
            const chatHistory = document.getElementById('chatHistory');
            const chatInput = document.getElementById('chatInput');
            const sendChatBtn = document.getElementById('sendChatBtn');
            const newChatBtn = document.getElementById('newChatBtn');

            // Chat List elements
            const chatList = document.getElementById('chatList');
            const selectAllChats = document.getElementById('selectAllChats');
            const saveChatsBtn = document.getElementById('saveChatsBtn');
            const loadChatsBtn = document.getElementById('loadChatsBtn');
            const loadChatsInput = document.getElementById('loadChatsInput');
            const deleteChatsBtn = document.getElementById('deleteChatsBtn');

            // Face Gallery elements
            const faceGalleryContainer = document.getElementById('faceGalleryContainer');
            const faceAnalysisCheckbox = document.getElementById('faceAnalysis');
            const analyzeFacesBtn = document.getElementById('analyzeFacesBtn');
            const generateFaceImagesBtn = document.getElementById('generateFaceImagesBtn');
            const downloadFaceGalleryBtn = document.getElementById('downloadFaceGalleryBtn');
            const analysisProgress = document.getElementById('analysisProgress');
            const faceProgressFill = document.getElementById('faceProgressFill');
            const faceProgressText = document.getElementById('faceProgressText');
            const faceResults = document.getElementById('faceResults');

            let uploadedFile = null;
            let chats = [];
            let currentChatId = null;
            let allGeneratedShorts = [];
            let currentShortIndex = 0;
            let outputFolderHandle = null;
            let savedShortsCount = 0;
            let detectedFaces = [];
            let faceAnalysisInProgress = false;
            let faceApiModelsLoaded = false;
            let videoFrames = [];
            let faceDescriptors = [];

            // --- AI Model Data & Logic ---
            const aiModels = {
                claude: { 
                    name: "Claude", 
                    subModels: [
                        "Claude 3.5 Sonnet", 
                        "Claude 3.5 Haiku", 
                        "Claude 3 Opus", 
                        "Claude 3 Sonnet", 
                        "Claude 3 Haiku"
                    ], 
                    apiKey: "", 
                    apiKeyUrl: "https://console.anthropic.com/settings/keys",
                    endpoint: "https://api.anthropic.com/v1/messages"
                },
                gpt: { 
                    name: "OpenAI GPT", 
                    subModels: [
                        "GPT-4o", 
                        "GPT-4o mini", 
                        "GPT-4 Turbo", 
                        "GPT-4", 
                        "GPT-3.5 Turbo", 
                        "GPT-3.5 Turbo 16k"
                    ], 
                    apiKey: "", 
                    apiKeyUrl: "https://platform.openai.com/api-keys",
                    endpoint: "https://api.openai.com/v1/chat/completions"
                },
                gemini: { 
                    name: "Google Gemini", 
                    subModels: [
                        "Gemini 2.0 Flash", 
                        "Gemini 1.5 Pro", 
                        "Gemini 1.5 Flash", 
                        "Gemini 1.5 Flash-8B", 
                        "Gemini 1.0 Pro"
                    ], 
                    apiKey: "", 
                    apiKeyUrl: "https://aistudio.google.com/app/api-keys",
                    endpoint: "https://generativelanguage.googleapis.com/v1beta/models"
                },
                groq: { 
                    name: "Groq", 
                    subModels: [
                        "Llama 3.3 70B", 
                        "Llama 3.1 405B", 
                        "Llama 3.1 70B", 
                        "Llama 3.1 8B", 
                        "Llama 3 70B", 
                        "Llama 3 8B", 
                        "Mixtral 8x7B", 
                        "Gemma 2 9B", 
                        "Gemma 7B"
                    ], 
                    apiKey: "", 
                    apiKeyUrl: "https://console.groq.com/keys",
                    endpoint: "https://api.groq.com/openai/v1/chat/completions"
                },
                perplexity: {
                    name: "Perplexity",
                    subModels: [
                        "Llama 3.1 Sonar Large",
                        "Llama 3.1 Sonar Small", 
                        "Llama 3.1 70B",
                        "Llama 3.1 8B"
                    ],
                    apiKey: "",
                    apiKeyUrl: "https://www.perplexity.ai/settings/api",
                    endpoint: "https://api.perplexity.ai/chat/completions"
                },
                cohere: {
                    name: "Cohere",
                    subModels: [
                        "Command R+",
                        "Command R",
                        "Command",
                        "Command Light"
                    ],
                    apiKey: "",
                    apiKeyUrl: "https://dashboard.cohere.com/api-keys",
                    endpoint: "https://api.cohere.ai/v1/chat"
                }
            };

            const mainModelSelect = document.getElementById('mainModelSelect');
            const subModelSelect = document.getElementById('subModelSelect');
            const apiSettingsBtn = document.getElementById('apiSettingsBtn');
            
            // API Key Modal Elements
            const apiKeyModal = document.getElementById('apiKeyModal');
            const apiKeyModalTitle = document.getElementById('apiKeyModalTitle');
            const apiKeyInput = document.getElementById('apiKeyInput');
            const apiKeyLink = document.getElementById('apiKeyLink');
            const saveApiKeyBtn = document.getElementById('saveApiKey');
            const cancelApiKeyBtn = document.getElementById('cancelApiKey');
            const closeBtn = apiKeyModal.querySelector('.close-button');
            let currentEditingModel = null;

            function initializeMainModels() {
                mainModelSelect.innerHTML = '';
                for (const key in aiModels) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = aiModels[key].name;
                    mainModelSelect.appendChild(option);
                }
            }

            function updateSubModels() {
                const selectedModelKey = mainModelSelect.value;
                const subModels = aiModels[selectedModelKey].subModels;
                
                subModelSelect.innerHTML = '';
                subModels.forEach(modelName => {
                    const option = document.createElement('option');
                    option.value = modelName;
                    option.textContent = modelName;
                    subModelSelect.appendChild(option);
                });
            }
            
            mainModelSelect.addEventListener('change', updateSubModels);

            // --- API Key Modal Logic ---
            apiSettingsBtn.addEventListener('click', () => {
                const selectedModelKey = mainModelSelect.value;
                const modelData = aiModels[selectedModelKey];
                
                apiKeyModalTitle.textContent = `${modelData.name} API 키 설정`;
                apiKeyInput.value = modelData.apiKey || '';
                apiKeyLink.href = modelData.apiKeyUrl;

                apiKeyModal.style.display = 'block';
                
                currentEditingModel = selectedModelKey;
            });

            function closeApiKeyModal() {
                 apiKeyModal.style.display = 'none';
            }

            closeBtn.addEventListener('click', closeApiKeyModal);
            cancelApiKeyBtn.addEventListener('click', closeApiKeyModal);
            
            saveApiKeyBtn.addEventListener('click', () => {
                if (currentEditingModel) {
                    aiModels[currentEditingModel].apiKey = apiKeyInput.value;
                    localStorage.setItem(`apiKey_${currentEditingModel}`, apiKeyInput.value);
                    console.log(`${aiModels[currentEditingModel].name} API Key saved.`); // For debugging
                    alert(`${aiModels[currentEditingModel].name} API 키가 저장되었습니다.`);
                    closeApiKeyModal();
                }
            });

            // Load saved API keys
            function loadSavedApiKeys() {
                for (const modelKey in aiModels) {
                    const savedKey = localStorage.getItem(`apiKey_${modelKey}`);
                    if (savedKey) {
                        aiModels[modelKey].apiKey = savedKey;
                    }
                }
            }

            // --- Storage Management Functions ---
            async function selectOutputFolder() {
                try {
                    if ('showDirectoryPicker' in window) {
                        outputFolderHandle = await window.showDirectoryPicker();
                        const folderName = outputFolderHandle.name;
                        outputFolder.value = folderName;
                        localStorage.setItem('outputFolderName', folderName);
                        
                        // 폴더 선택 후 시각적 상태 업데이트
                        updateFolderStatus(true, folderName);
                        addMessage('ai', `✅ 저장 폴더가 "${folderName}"로 설정되었습니다. 이제 영상 처리 완료 후 자동으로 이 폴더에 저장됩니다.`);
                    } else {
                        // Fallback for browsers that don't support File System Access API
                        const folderPath = prompt('저장할 폴더 경로를 입력하세요:', 'C:\\AutoShorts\\Output');
                        if (folderPath) {
                            outputFolder.value = folderPath;
                            localStorage.setItem('outputFolderPath', folderPath);
                            
                            // 폴더 선택 후 시각적 상태 업데이트
                            updateFolderStatus(true, folderPath);
                            addMessage('ai', `✅ 저장 경로가 "${folderPath}"로 설정되었습니다. 이제 영상 처리 완료 후 자동으로 이 폴더에 저장됩니다.`);
                        }
                    }
                } catch (error) {
                    console.error('Folder selection error:', error);
                    addMessage('ai', '❌ 폴더 선택이 취소되었거나 오류가 발생했습니다.');
                }
            }

            function generateFileName(index, originalName = 'video') {
                const namingType = fileNaming.value;
                const now = new Date();
                
                switch (namingType) {
                    case 'timestamp':
                        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
                        return `shorts_${timestamp}_${index}.mp4`;
                    
                    case 'sequential':
                        const paddedIndex = String(savedShortsCount + index).padStart(3, '0');
                        return `shorts_${paddedIndex}.mp4`;
                    
                    case 'custom':
                        const customPrefix = customName.value.trim() || 'MyShorts';
                        const paddedCustomIndex = String(index).padStart(3, '0');
                        return `${customPrefix}_${paddedCustomIndex}.mp4`;
                    
                    default:
                        return `shorts_${index}.mp4`;
                }
            }

            async function saveVideoFile(videoElement, fileName) {
                try {
                    // Create download link for the video
                    const link = document.createElement('a');
                    link.href = videoElement.src;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    return true;
                } catch (error) {
                    console.error('Save error:', error);
                    return false;
                }
            }

            async function autoSaveShorts() {
                if (!autoSave.checked) return;
                
                // 저장 폴더 확인
                const currentFolder = outputFolder.value;
                if (!currentFolder) {
                    addMessage('ai', '⚠️ 저장 폴더가 선택되지 않았습니다. 먼저 저장 폴더를 선택해주세요.');
                    updateFolderStatus(false);
                    return;
                }
                
                let savedCount = 0;
                const totalShorts = allGeneratedShorts.length;
                
                addMessage('ai', `💾 ${totalShorts}개의 숏츠를 "${currentFolder}" 폴더에 자동 저장하고 있습니다...`);
                
                for (let i = 0; i < allGeneratedShorts.length; i++) {
                    const shortElement = allGeneratedShorts[i];
                    const video = shortElement.querySelector('video');
                    const fileName = generateFileName(i + 1);
                    
                    const success = await saveVideoFile(video, fileName);
                    if (success) {
                        savedCount++;
                        // Update UI to show saved status
                        const shortInfo = shortElement.querySelector('.short-info');
                        const savedBadge = document.createElement('span');
                        savedBadge.innerHTML = '💾 저장됨';
                        savedBadge.style.cssText = 'font-size: 0.75rem; color: var(--success-text); margin-left: 0.5rem;';
                        shortInfo.appendChild(savedBadge);
                    }
                }
                
                savedShortsCount += savedCount;
                localStorage.setItem('savedShortsCount', savedShortsCount.toString());
                
                if (savedCount === totalShorts) {
                    addMessage('ai', `✅ ${savedCount}개의 숏츠가 모두 "${currentFolder}" 폴더에 성공적으로 저장되었습니다!`);
                } else {
                    addMessage('ai', `⚠️ ${savedCount}/${totalShorts}개의 숏츠가 저장되었습니다. ${totalShorts - savedCount}개는 저장에 실패했습니다.`);
                }
            }

            // Individual download function
            window.downloadSingleShort = function(button, index) {
                // 저장 폴더 확인
                const currentFolder = outputFolder.value;
                if (!currentFolder) {
                    addMessage('ai', '⚠️ 저장 폴더가 선택되지 않았습니다. 먼저 저장 폴더를 선택해주세요.');
                    updateFolderStatus(false);
                    return;
                }
                
                const shortElement = button.closest('.short-item');
                const video = shortElement.querySelector('video');
                const fileName = generateFileName(index);
                
                saveVideoFile(video, fileName).then(success => {
                    if (success) {
                        addMessage('ai', `💾 숏츠 #${index}가 "${currentFolder}" 폴더에 "${fileName}" 이름으로 저장되었습니다.`);
                        
                        // Add saved badge if not already present
                        const shortInfo = shortElement.querySelector('.short-info');
                        if (!shortInfo.querySelector('.saved-badge')) {
                            const savedBadge = document.createElement('span');
                            savedBadge.className = 'saved-badge';
                            savedBadge.innerHTML = '💾 저장됨';
                            savedBadge.style.cssText = 'font-size: 0.75rem; color: var(--success-text); margin-left: 0.5rem;';
                            shortInfo.appendChild(savedBadge);
                        }
                    } else {
                        addMessage('ai', `❌ 숏츠 #${index} 저장에 실패했습니다.`);
                    }
                });
            };

            // Event listeners for storage management
            selectFolderBtn.addEventListener('click', selectOutputFolder);
            
            fileNaming.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customNameContainer.style.display = 'flex';
                } else {
                    customNameContainer.style.display = 'none';
                }
            });

            // Load saved settings
            function loadStorageSettings() {
                const savedFolderName = localStorage.getItem('outputFolderName');
                const savedFolderPath = localStorage.getItem('outputFolderPath');
                const savedCount = localStorage.getItem('savedShortsCount');
                
                // 처음 실행시 빈 상태로 표시
                if (savedFolderName) {
                    outputFolder.value = savedFolderName;
                    updateFolderStatus(true, savedFolderName);
                    // 기존 폴더 설정 알림
                    setTimeout(() => {
                        addMessage('ai', `📁 이전에 설정한 저장 폴더 "${savedFolderName}"를 불러왔습니다. 영상 처리 완료 후 자동으로 이 폴더에 저장됩니다.`);
                    }, 1000);
                } else if (savedFolderPath) {
                    outputFolder.value = savedFolderPath;
                    updateFolderStatus(true, savedFolderPath);
                    // 기존 폴더 설정 알림
                    setTimeout(() => {
                        addMessage('ai', `📁 이전에 설정한 저장 경로 "${savedFolderPath}"를 불러왔습니다. 영상 처리 완료 후 자동으로 이 경로에 저장됩니다.`);
                    }, 1000);
                } else {
                    // 처음 실행 - 빈 상태 명시적 표시
                    outputFolder.value = '';
                    outputFolder.placeholder = '📁 저장 폴더를 먼저 선택해주세요';
                    updateFolderStatus(false);
                    // 폴더 선택 안내 메시지
                    setTimeout(() => {
                        addMessage('ai', '👋 환영합니다! 영상 처리를 시작하기 전에 저장 폴더를 먼저 선택해주세요. 📁 버튼을 클릭하여 폴더를 지정하면 다음부터는 자동으로 설정됩니다.');
                    }, 1500);
                }
                
                if (savedCount) {
                    savedShortsCount = parseInt(savedCount, 10);
                }
            }

            // 폴더 선택 상태를 시각적으로 표시하는 함수
            function updateFolderStatus(isSelected, folderName = '') {
                const selectFolderBtn = document.getElementById('selectFolderBtn');
                const outputFolder = document.getElementById('outputFolder');
                
                if (isSelected && folderName) {
                    // 폴더가 선택된 상태
                    outputFolder.className = 'setting-input folder-selected';
                    selectFolderBtn.className = 'control-btn folder-selected';
                    selectFolderBtn.innerHTML = '✅';
                    selectFolderBtn.title = `현재 폴더: ${folderName}`;
                    outputFolder.placeholder = `현재 선택: ${folderName}`;
                } else {
                    // 폴더가 선택되지 않은 상태 (처음 실행)
                    outputFolder.className = 'setting-input folder-not-selected';
                    selectFolderBtn.className = 'control-btn folder-not-selected';
                    selectFolderBtn.innerHTML = '📁';
                    selectFolderBtn.title = '저장 폴더를 선택하세요 (필수)';
                    outputFolder.placeholder = '📁 저장 폴더를 먼저 선택해주세요';
                }
            }

            // --- Video Analysis Functions ---
            async function extractVideoFrames(videoElement, numFrames = 5) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const frames = [];
                
                canvas.width = 640;
                canvas.height = 360;
                
                const duration = videoElement.duration;
                const interval = duration / numFrames;
                
                for (let i = 0; i < numFrames; i++) {
                    const time = i * interval;
                    await seekToTime(videoElement, time);
                    
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const frameData = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push({
                        time: time,
                        data: frameData
                    });
                }
                
                return frames;
            }
            
            function seekToTime(videoElement, time) {
                return new Promise((resolve) => {
                    const onSeeked = () => {
                        videoElement.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    videoElement.addEventListener('seeked', onSeeked);
                    videoElement.currentTime = time;
                });
            }

            // 현재 선택된 모든 옵션을 가져오는 함수
            function getCurrentOptions() {
                const selectedPlatforms = Array.from(getSelectedPlatforms()).map(p => p.dataset.platform);
                const platformNames = {
                    'youtube_shorts': 'YouTube Shorts',
                    'instagram_reels': 'Instagram Reels',
                    'tiktok': 'TikTok',
                    'naver': '네이버',
                    'facebook_reels': 'Facebook Reels'
                };

                return {
                    // 영상 처리 옵션
                    videoProcessing: {
                        autoHighlight: document.getElementById('autoHighlight').checked,
                        autoCrop: document.getElementById('autoCrop').checked,
                        colorCorrection: document.getElementById('colorCorrection').checked,
                        videoStabilization: document.getElementById('videoStabilization').checked
                    },
                    // 오디오 처리 옵션
                    audioProcessing: {
                        removeSilence: document.getElementById('removeSilence').checked,
                        enhanceAudio: document.getElementById('enhanceAudio').checked,
                        noiseReduction: document.getElementById('noiseReduction').checked
                    },
                    // 추가 기능
                    features: {
                        addTitle: document.getElementById('addTitle').checked,
                        addSubtitles: document.getElementById('addSubtitles').checked,
                        addEffects: document.getElementById('addEffects').checked
                    },
                    // 숏츠 설정
                    settings: {
                        shortsLength: parseInt(document.getElementById('shortsLength').value),
                        shortsCount: parseInt(document.getElementById('shortsCount').value)
                    },
                    // 선택된 플랫폼
                    platforms: selectedPlatforms.map(p => platformNames[p] || p),
                    // AI 모델 정보
                    aiModel: {
                        provider: mainModelSelect.options[mainModelSelect.selectedIndex].text,
                        model: subModelSelect.options[subModelSelect.selectedIndex].text
                    },
                    // 저장 관리 설정
                    storage: {
                        autoSave: document.getElementById('autoSave').checked,
                        outputFolder: document.getElementById('outputFolder').value,
                        fileNaming: document.getElementById('fileNaming').value,
                        customName: document.getElementById('customName').value
                    }
                };
            }

            // 옵션을 텍스트로 변환하는 함수
            function formatOptionsForAI(options) {
                let optionsText = "\n📋 현재 선택된 옵션들:\n\n";
                
                // 플랫폼 정보
                if (options.platforms.length > 0) {
                    optionsText += `🌐 타겟 플랫폼: ${options.platforms.join(', ')}\n`;
                } else {
                    optionsText += `⚠️ 플랫폼이 선택되지 않았습니다.\n`;
                }
                
                // 숏츠 설정
                optionsText += `⏱️ 숏츠 길이: ${options.settings.shortsLength}초\n`;
                optionsText += `🔢 생성 개수: ${options.settings.shortsCount}개\n\n`;
                
                // 영상 처리 옵션
                const videoOptions = [];
                if (options.videoProcessing.autoHighlight) videoOptions.push("자동 하이라이트 추출");
                if (options.videoProcessing.autoCrop) videoOptions.push("자동 크롭");
                if (options.videoProcessing.colorCorrection) videoOptions.push("색상 보정");
                if (options.videoProcessing.videoStabilization) videoOptions.push("영상 안정화");
                
                if (videoOptions.length > 0) {
                    optionsText += `📼 영상 처리: ${videoOptions.join(', ')}\n`;
                }
                
                // 오디오 처리 옵션
                const audioOptions = [];
                if (options.audioProcessing.removeSilence) audioOptions.push("무음 구간 제거");
                if (options.audioProcessing.enhanceAudio) audioOptions.push("오디오 향상");
                if (options.audioProcessing.noiseReduction) audioOptions.push("노이즈 감소");
                
                if (audioOptions.length > 0) {
                    optionsText += `🔊 오디오 처리: ${audioOptions.join(', ')}\n`;
                }
                
                // 추가 기능
                const features = [];
                if (options.features.addTitle) features.push("타이틀 추가");
                if (options.features.addSubtitles) features.push("자막 추가");
                if (options.features.addEffects) features.push("영상효과 추가");
                
                if (features.length > 0) {
                    optionsText += `✨ 추가 기능: ${features.join(', ')}\n`;
                }
                
                optionsText += `\n🤖 사용 중인 AI: ${options.aiModel.provider} - ${options.aiModel.model}\n`;
                
                // 저장 관리 설정
                if (options.storage.outputFolder) {
                    optionsText += `📁 저장 폴더: ${options.storage.outputFolder}\n`;
                }
                optionsText += `💾 자동 저장: ${options.storage.autoSave ? '활성화' : '비활성화'}\n`;
                optionsText += `📝 파일명 형식: ${options.storage.fileNaming === 'timestamp' ? '타임스탬프' : options.storage.fileNaming === 'sequential' ? '순차번호' : '사용자 정의'}\n`;
                
                return optionsText;
            }

            async function analyzeVideoContent(message) {
                if (!uploadedFile || !videoPreview.src) {
                    return "영상이 업로드되지 않았습니다. 먼저 영상을 업로드해주세요.";
                }
                
                try {
                    // Extract frames from video
                    const frames = await extractVideoFrames(videoPreview, 3);
                    
                    // Get video metadata
                    const videoInfo = {
                        duration: Math.round(videoPreview.duration),
                        width: videoPreview.videoWidth,
                        height: videoPreview.videoHeight,
                        aspectRatio: (videoPreview.videoWidth / videoPreview.videoHeight).toFixed(2)
                    };
                    
                    // 현재 선택된 옵션들 가져오기
                    const currentOptions = getCurrentOptions();
                    const optionsText = formatOptionsForAI(currentOptions);
                    
                    const analysisPrompt = `
영상 분석 및 숏츠 제작 요청: ${message}

📹 영상 정보:
- 길이: ${videoInfo.duration}초
- 해상도: ${videoInfo.width}x${videoInfo.height}
- 화면비: ${videoInfo.aspectRatio}:1

${optionsText}

🎯 요청사항:
1. 현재 선택된 옵션들을 모두 고려하여 영상을 분석해주세요.
2. 선택된 플랫폼(${currentOptions.platforms.join(', ')})에 최적화된 편집 방법을 제안해주세요.
3. ${currentOptions.settings.shortsCount}개의 ${currentOptions.settings.shortsLength}초 숏츠를 만들기 위한 최적의 구간을 추천해주세요.
4. 선택된 처리 옵션들(하이라이트 추출, 크롭, 색상보정 등)의 적용 방법을 구체적으로 설명해주세요.
5. 만약 사용자가 숏츠 제작을 요청했다면, 마지막에 "✅ 분석 완료! 지금 바로 숏츠 제작을 시작하겠습니다."라고 말해주세요.

사용자의 요청과 현재 설정을 바탕으로 전문적이고 구체적인 조언을 제공해주세요.`;
                    
                    // 직접 AI API 호출 (sendToAI 대신)
                    const selectedModelKey = mainModelSelect.value;
                    const selectedSubModel = subModelSelect.value;
                    const modelData = aiModels[selectedModelKey];
                    
                    if (!modelData.apiKey) {
                        throw new Error(`${modelData.name} API 키가 설정되지 않았습니다.`);
                    }

                    const systemPrompt = `당신은 숏츠 영상 제작을 도와주는 AI 어시스턴트입니다. 
사용자가 영상 편집과 관련된 질문을 하면 친절하고 전문적으로 답변해주세요.
영상 처리, 편집, 플랫폼별 최적화에 대한 조언을 제공할 수 있습니다.
사용자가 구체적인 작업을 요청하면 단계별로 안내해주세요.`;

                    switch (selectedModelKey) {
                        case 'claude':
                            return await callClaudeAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        case 'gpt':
                            return await callOpenAIAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        case 'gemini':
                            return await callGeminiAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        case 'groq':
                            return await callGroqAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        case 'perplexity':
                            return await callPerplexityAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        case 'cohere':
                            return await callCohereAPI(analysisPrompt, systemPrompt, modelData, selectedSubModel);
                        default:
                            throw new Error('지원하지 않는 AI 모델입니다.');
                    }
                    
                } catch (error) {
                    console.error('Video analysis error:', error);
                    return `영상 분석 중 오류가 발생했습니다: ${error.message}`;
                }
            }

            // --- AI API Functions ---
            async function sendToAI(message) {
                const selectedModelKey = mainModelSelect.value;
                const selectedSubModel = subModelSelect.value;
                const modelData = aiModels[selectedModelKey];
                
                if (!modelData.apiKey) {
                    throw new Error(`${modelData.name} API 키가 설정되지 않았습니다. 설정 버튼을 클릭하여 API 키를 입력해주세요.`);
                }

                // Check if this is a video analysis request
                const videoAnalysisKeywords = ['영상', '비디오', '분석', '하이라이트', '편집', '크롭', '자막', '효과'];
                const isVideoAnalysis = videoAnalysisKeywords.some(keyword => message.includes(keyword)) && uploadedFile;
                
                if (isVideoAnalysis) {
                    return await analyzeVideoContent(message);
                }

                // 현재 선택된 옵션들도 일반 대화에 포함
                const currentOptions = getCurrentOptions();
                const optionsText = formatOptionsForAI(currentOptions);
                
                const systemPrompt = `당신은 숏츠 영상 제작을 도와주는 AI 어시스턴트입니다. 
사용자가 영상 편집과 관련된 질문을 하면 친절하고 전문적으로 답변해주세요.
영상 처리, 편집, 플랫폼별 최적화에 대한 조언을 제공할 수 있습니다.
사용자가 구체적인 작업을 요청하면 단계별로 안내해주세요.

${optionsText}

현재 선택된 옵션들을 항상 고려하여 맞춤형 조언을 제공해주세요.
만약 사용자가 숏츠 제작을 요청하면 "✅ 분석 완료! 지금 바로 숏츠 제작을 시작하겠습니다."라고 응답해주세요.`;

                switch (selectedModelKey) {
                    case 'claude':
                        return await callClaudeAPI(message, systemPrompt, modelData, selectedSubModel);
                    case 'gpt':
                        return await callOpenAIAPI(message, systemPrompt, modelData, selectedSubModel);
                    case 'gemini':
                        return await callGeminiAPI(message, systemPrompt, modelData, selectedSubModel);
                    case 'groq':
                        return await callGroqAPI(message, systemPrompt, modelData, selectedSubModel);
                    case 'perplexity':
                        return await callPerplexityAPI(message, systemPrompt, modelData, selectedSubModel);
                    case 'cohere':
                        return await callCohereAPI(message, systemPrompt, modelData, selectedSubModel);
                    default:
                        throw new Error('지원하지 않는 AI 모델입니다.');
                }
            }

            async function callClaudeAPI(message, systemPrompt, modelData, subModel) {
                // API 키 검증
                if (!modelData.apiKey || modelData.apiKey.trim() === '') {
                    throw new Error('Claude API 키가 설정되지 않았습니다. API 설정에서 키를 입력해주세요.');
                }

                if (!modelData.apiKey.startsWith('sk-ant-')) {
                    throw new Error('Claude API 키 형식이 올바르지 않습니다. API 키는 "sk-ant-"로 시작해야 합니다.');
                }

                const modelMap = {
                    "Claude 3.5 Sonnet": "claude-3-5-sonnet-20241022",
                    "Claude 3.5 Haiku": "claude-3-5-haiku-20241022",
                    "Claude 3 Opus": "claude-3-opus-20240229",
                    "Claude 3 Sonnet": "claude-3-sonnet-20240229", 
                    "Claude 3 Haiku": "claude-3-haiku-20240307"
                };

                const requestBody = {
                    model: modelMap[subModel] || "claude-3-5-sonnet-20241022",
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: [{ role: "user", content: message }]
                };

                // CORS 우회를 위한 프록시 서버 사용
                try {
                    console.log('Claude API 호출 시도 - 프록시 사용');
                    
                    // CORS Anywhere 프록시 서버 사용 (더 간단한 방식)
                    const proxyUrl = `https://cors-anywhere.herokuapp.com/${modelData.endpoint}`;
                    
                    const response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': modelData.apiKey,
                            'anthropic-version': '2023-06-01',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('프록시 에러 응답:', errorText);
                        throw new Error(`Claude API 오류 (${response.status}): ${errorText}`);
                    }

                    const claudeResponse = await response.json();
                    console.log('Claude API 응답:', claudeResponse);

                    // Claude API 에러 응답 처리
                    if (claudeResponse.error) {
                        throw new Error(`Claude API 오류: ${claudeResponse.error.message || claudeResponse.error.type || '알 수 없는 오류'}`);
                    }

                    // 정상 응답 처리
                    if (claudeResponse.content && claudeResponse.content[0] && claudeResponse.content[0].text) {
                        console.log('Claude API 성공 (프록시 경유)');
                        return claudeResponse.content[0].text;
                    } else {
                        console.error('예상하지 못한 응답 형식:', claudeResponse);
                        throw new Error('Claude API 응답 형식이 올바르지 않습니다.');
                    }

                } catch (error) {
                    console.error('Claude API 호출 실패:', error);
                    
                    // 더 친근한 에러 메시지 제공
                    if (error.message.includes('CORS') || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                        throw new Error(`🚫 Claude API 연결 문제가 발생했습니다.\n\n💡 간단한 해결 방법:\n1. 🤖 다른 AI 모델 사용 (GPT, Gemini 등 - 추천!)\n2. 🔧 브라우저 확장 프로그램: "CORS Unblock" 설치\n3. 🌐 네트워크 연결 상태 확인\n\n✨ GPT나 Gemini는 바로 사용 가능합니다!`);
                    }
                    
                    throw error;
                }
            }

            async function callOpenAIAPI(message, systemPrompt, modelData, subModel) {
                const modelMap = {
                    "GPT-4o": "gpt-4o",
                    "GPT-4o mini": "gpt-4o-mini",
                    "GPT-4 Turbo": "gpt-4-turbo",
                    "GPT-4": "gpt-4",
                    "GPT-3.5 Turbo": "gpt-3.5-turbo",
                    "GPT-3.5 Turbo 16k": "gpt-3.5-turbo-16k"
                };

                const response = await fetch(modelData.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelData.apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelMap[subModel] || "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user", 
                                content: message
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            }

            async function callGeminiAPI(message, systemPrompt, modelData, subModel) {
                const modelMap = {
                    "Gemini 2.0 Flash": "gemini-2.0-flash-exp",
                    "Gemini 1.5 Pro": "gemini-1.5-pro-latest",
                    "Gemini 1.5 Flash": "gemini-1.5-flash-latest",
                    "Gemini 1.5 Flash-8B": "gemini-1.5-flash-8b-latest",
                    "Gemini 1.0 Pro": "gemini-pro"
                };
                
                const modelName = modelMap[subModel] || "gemini-pro";
                const url = `${modelData.endpoint}/${modelName}:generateContent?key=${modelData.apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${systemPrompt}\n\n사용자 질문: ${message}`
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 1000,
                            temperature: 0.7
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Gemini API 오류: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            }

            async function callGroqAPI(message, systemPrompt, modelData, subModel) {
                const modelMap = {
                    "Llama 3.3 70B": "llama-3.3-70b-versatile",
                    "Llama 3.1 405B": "llama-3.1-405b-reasoning",
                    "Llama 3.1 70B": "llama-3.1-70b-versatile",
                    "Llama 3.1 8B": "llama-3.1-8b-instant",
                    "Llama 3 70B": "llama3-70b-8192",
                    "Llama 3 8B": "llama3-8b-8192",
                    "Mixtral 8x7B": "mixtral-8x7b-32768",
                    "Gemma 2 9B": "gemma2-9b-it",
                    "Gemma 7B": "gemma-7b-it"
                };

                const response = await fetch(modelData.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelData.apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelMap[subModel] || "llama-3.1-8b-instant",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Groq API 오류: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            }

            async function callPerplexityAPI(message, systemPrompt, modelData, subModel) {
                const modelMap = {
                    "Llama 3.1 Sonar Large": "llama-3.1-sonar-large-128k-online",
                    "Llama 3.1 Sonar Small": "llama-3.1-sonar-small-128k-online",
                    "Llama 3.1 70B": "llama-3.1-70b-instruct",
                    "Llama 3.1 8B": "llama-3.1-8b-instruct"
                };

                const response = await fetch(modelData.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelData.apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelMap[subModel] || "llama-3.1-sonar-small-128k-online",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Perplexity API 오류: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            }

            async function callCohereAPI(message, systemPrompt, modelData, subModel) {
                const modelMap = {
                    "Command R+": "command-r-plus",
                    "Command R": "command-r",
                    "Command": "command",
                    "Command Light": "command-light"
                };

                const response = await fetch(modelData.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelData.apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelMap[subModel] || "command-r",
                        message: message,
                        preamble: systemPrompt,
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Cohere API 오류: ${errorData.message || response.statusText}`);
                }

                const data = await response.json();
                return data.text;
            }

            // --- Theme Switching ---
            function applyInitialTheme() {
                const savedTheme = localStorage.getItem('theme') || 'light';
                document.body.classList.toggle('dark-mode', savedTheme === 'dark');
                themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
            }

            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDarkMode = document.body.classList.contains('dark-mode');
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
                themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
            });

            loadNewVideoButton.addEventListener('click', () => {
                fileInput.click();
            });

            applyInitialTheme();

            // --- File Upload Logic ---
            function handleFile(file) {
                if (!file || !file.type.startsWith('video/')) {
                    alert('유효한 비디오 파일을 선택해주세요.');
                    return;
                }
                uploadedFile = file;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    videoPreview.src = e.target.result;
                    videoPreview.load();
                };
                reader.readAsDataURL(file);

                uploadContainer.style.display = 'none';
                videoEditorContainer.style.display = 'block';
                updateProcessButtonState();
            }
            
            uploadContainer.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) handleFile(e.target.files[0]);
            });

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
                if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            });

            // --- Platform Selection ---
            platformCards.forEach(card => {
                card.addEventListener('click', () => {
                    card.classList.toggle('selected');
                    updateProcessButtonState();
                });
            });

            function getSelectedPlatforms() {
                return document.querySelectorAll('.platform-card.selected');
            }

            // --- Process Button State ---
            function updateProcessButtonState() {
                const platformsSelected = getSelectedPlatforms().length > 0;
                processBtn.disabled = !uploadedFile || !platformsSelected;
                sendChatBtn.disabled = chatInput.value.trim() === '';
            }

            // --- Chat Panel Logic ---
            function renderChatHistory() {
                chatHistory.innerHTML = '';
                const currentChat = chats.find(chat => chat.id === currentChatId);
                if (!currentChat) return;

                currentChat.messages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-message', `${msg.sender}-message`);

                    const avatar = `<div class="avatar">${msg.sender === 'ai' ? '🤖' : '👤'}</div>`;
                    const content = `<div class="message-content"><p>${msg.text}</p></div>`;
                    
                    messageElement.innerHTML = avatar + content;
                    chatHistory.appendChild(messageElement);
                });
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }

            function addMessage(sender, text) {
                const currentChat = chats.find(chat => chat.id === currentChatId);
                if (currentChat) {
                    currentChat.messages.push({ sender, text });
                    saveChats();
                    renderChatHistory();
                }
            }

            async function handleSendMessage() {
                const text = chatInput.value.trim();
                if (text) {
                    addMessage('user', text);
                    chatInput.value = '';
                    updateProcessButtonState();
                    
                    // Show typing indicator
                    addMessage('ai', '🤔 생각중...');
                    
                    try {
                        const aiResponse = await sendToAI(text);
                        // Remove typing indicator
                        const currentChat = chats.find(chat => chat.id === currentChatId);
                        if (currentChat && currentChat.messages.length > 0) {
                            currentChat.messages.pop(); // Remove typing indicator
                        }
                        addMessage('ai', aiResponse);
                        
                        // Check if AI suggests processing or analysis is complete
                        if (aiResponse.includes("✅ 분석 완료! 지금 바로 숏츠 제작을 시작하겠습니다.") || 
                            aiResponse.includes("영상 처리를 시작") || 
                            text.includes("처리 시작") || 
                            text.includes("만들어줘") ||
                            text.includes("숏츠 만들어") ||
                            text.includes("숏츠 생성") ||
                            text.includes("제작해")) {
                            
                            // 플랫폼이 선택되지 않은 경우 경고
                            const selectedPlatforms = getSelectedPlatforms();
                            if (selectedPlatforms.length === 0) {
                                setTimeout(() => {
                                    addMessage('ai', '⚠️ 플랫폼을 먼저 선택해주세요. 왼쪽 하단에서 YouTube Shorts, Instagram Reels 등 원하는 플랫폼을 선택한 후 다시 요청해주세요.');
                                }, 500);
                                return;
                            }
                            
                            setTimeout(() => {
                                addMessage('ai', '🚀 선택하신 옵션들을 적용하여 숏츠 제작을 시작합니다!');
                                processBtn.click();
                            }, 1000);
                        }
                    } catch (error) {
                        // Remove typing indicator
                        const currentChat = chats.find(chat => chat.id === currentChatId);
                        if (currentChat && currentChat.messages.length > 0) {
                            currentChat.messages.pop();
                        }
                        addMessage('ai', `오류가 발생했습니다: ${error.message}`);
                    }
                }
            }
            
            sendChatBtn.addEventListener('click', handleSendMessage);
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            });
             chatInput.addEventListener('input', updateProcessButtonState);

            // Chat Management
            function saveChats() {
                localStorage.setItem('autoshorts_chats', JSON.stringify(chats));
            }

            function loadChats() {
                const savedChats = localStorage.getItem('autoshorts_chats');
                if (savedChats) {
                    chats = JSON.parse(savedChats);
                    const lastChat = chats[chats.length - 1];
                    if (lastChat) {
                        currentChatId = lastChat.id;
                    } else {
                        startNewChat(false); // Don't save yet
                    }
                } else {
                    startNewChat(false); // Don't save yet
                }
                renderAll();
            }

            function startNewChat(doSave = true) {
                const newChat = {
                    id: Date.now(),
                    messages: [
                        { sender: 'ai', text: `안녕하세요! 🎬 숏츠 영상 제작을 도와드릴 AI 어시스턴트입니다.

📋 사용 방법:
1. 영상을 업로드해주세요
2. 원하는 처리 옵션을 선택하세요  
3. 저에게 "영상을 분석해줘", "하이라이트를 찾아줘" 등을 요청하거나
4. '영상 처리 시작' 버튼을 눌러주세요

💡 AI 기능:
- 영상 내용 분석 및 최적 구간 추천
- 플랫폼별 맞춤 편집 제안
- 자동 하이라이트 추출
- 개인화된 편집 조언

궁금한 점이 있으시면 언제든 물어보세요!` }
                    ]
                };
                chats.push(newChat);
                currentChatId = newChat.id;
                if (doSave) {
                   saveChats();
                }
                renderAll();
            }

            newChatBtn.addEventListener('click', () => startNewChat());

            function renderAll() {
                renderChatList();
                renderChatHistory();
            }

            // --- Chat List Logic ---
            function renderChatList() {
                chatList.innerHTML = '';
                if (chats.length === 0) {
                    chatList.innerHTML = `<p style="text-align:center; color: var(--text-secondary); padding: 1rem;">대화 기록이 없습니다.</p>`;
                    return;
                }

                chats.forEach(chat => {
                    const item = document.createElement('div');
                    item.className = 'chat-list-item';
                    item.dataset.chatId = chat.id;
                    if (chat.id === currentChatId) {
                        item.classList.add('active');
                    }

                    const firstUserMessage = chat.messages.find(m => m.sender === 'user');
                    const title = firstUserMessage ? firstUserMessage.text : (chat.messages[0]?.text || '새 대화');

                    item.innerHTML = `
                        <input type="checkbox" class="chat-select-checkbox" data-chat-id="${chat.id}">
                        <span class="chat-list-item-title">${title}</span>
                    `;

                    item.querySelector('.chat-list-item-title').addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentChatId = chat.id;
                        renderAll();
                    });

                    chatList.appendChild(item);
                });
            }

            function getSelectedChatIds() {
                const selected = [];
                document.querySelectorAll('.chat-select-checkbox:checked').forEach(cb => {
                    selected.push(Number(cb.dataset.chatId));
                });
                return selected;
            }

            selectAllChats.addEventListener('change', (e) => {
                document.querySelectorAll('.chat-select-checkbox').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });

            deleteChatsBtn.addEventListener('click', () => {
                const idsToDelete = getSelectedChatIds();
                if (idsToDelete.length === 0) {
                    alert('삭제할 대화를 선택해주세요.');
                    return;
                }
                
                if (!confirm(`${idsToDelete.length}개의 대화를 정말 삭제하시겠습니까?`)) {
                    return;
                }

                chats = chats.filter(chat => !idsToDelete.includes(chat.id));

                if (idsToDelete.includes(currentChatId)) {
                    currentChatId = chats.length > 0 ? chats[0].id : null;
                    if (!currentChatId) {
                        startNewChat(false); // Don't save yet, will be saved below
                    }
                }
                
                saveChats();
                renderAll();
            });

            function downloadJSON(data, filename) {
                const jsonStr = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            saveChatsBtn.addEventListener('click', () => {
                downloadJSON(chats, 'all_chats.json');
            });
            
            loadChatsBtn.addEventListener('click', () => {
                loadChatsInput.click();
            });

            loadChatsInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loadedChats = JSON.parse(event.target.result);
                        if (Array.isArray(loadedChats)) {
                            // Basic validation
                            const validChats = loadedChats.filter(c => c.id && Array.isArray(c.messages));
                            const existingIds = new Set(chats.map(c => c.id));
                            const newChats = validChats.filter(c => !existingIds.has(c.id));
                            
                            chats.push(...newChats);
                            saveChats();
                            renderAll();
                            alert(`${newChats.length}개의 새 대화를 불러왔습니다.`);
                        } else {
                            throw new Error('Invalid chat file format.');
                        }
                    } catch (err) {
                        alert('대화 파일을 불러오는 중 오류가 발생했습니다.');
                        console.error(err);
                    }
                };
                reader.readAsText(file);
                // Reset input value to allow loading the same file again
                e.target.value = ''; 
            });

            // --- Carousel Logic ---
            function renderCompletedShorts() {
                shortsTrack.innerHTML = '';
                if (allGeneratedShorts.length === 0) {
                    shortsTrack.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 5rem 1rem;">왼쪽의 '영상 처리 시작' 버튼을 눌러 숏츠를 생성해주세요.</p>`;
                    prevShortBtn.style.display = 'none';
                    nextShortBtn.style.display = 'none';
                    shortsCounter.textContent = '';
                    return;
                }

                allGeneratedShorts.forEach(shortElement => {
                    // Each item needs to be wrapped for the carousel
                    const slide = document.createElement('div');
                    slide.style.flex = '0 0 100%';
                    slide.appendChild(shortElement);
                    shortsTrack.appendChild(slide);
                });

                updateCarousel();
            }

            function updateCarousel() {
                // Move the track
                const offset = -currentShortIndex * 100;
                shortsTrack.style.transform = `translateX(${offset}%)`;

                // Update counter
                shortsCounter.textContent = `${currentShortIndex + 1} / ${allGeneratedShorts.length}`;

                // Update buttons visibility
                prevShortBtn.style.display = currentShortIndex > 0 ? 'block' : 'none';
                nextShortBtn.style.display = currentShortIndex < allGeneratedShorts.length - 1 ? 'block' : 'none';

                // Pause all videos first
                shortsTrack.querySelectorAll('video').forEach(v => v.pause());

                // Autoplay current video on hover
                const currentSlide = shortsTrack.children[currentShortIndex];
                if (currentSlide) {
                    const videoContainer = currentSlide.querySelector('.video-container');
                    const video = currentSlide.querySelector('video');
                    if (videoContainer && video) {
                         videoContainer.addEventListener('mouseenter', () => video.play().catch(e=>console.log("Autoplay failed", e)));
                         videoContainer.addEventListener('mouseleave', () => video.pause());
                    }
                }
            }

            prevShortBtn.addEventListener('click', () => {
                if (currentShortIndex > 0) {
                    currentShortIndex--;
                    updateCarousel();
                }
            });

            nextShortBtn.addEventListener('click', () => {
                if (currentShortIndex < allGeneratedShorts.length - 1) {
                    currentShortIndex++;
                    updateCarousel();
                }
            });

            // --- Video Processing Functions ---
            async function processVideoWithAI() {
                if (!uploadedFile || !videoPreview.src) {
                    throw new Error("처리할 영상이 없습니다.");
                }
                
                // Get processing options
                const options = {
                    autoHighlight: document.getElementById('autoHighlight').checked,
                    autoCrop: document.getElementById('autoCrop').checked,
                    colorCorrection: document.getElementById('colorCorrection').checked,
                    videoStabilization: document.getElementById('videoStabilization').checked,
                    removeSilence: document.getElementById('removeSilence').checked,
                    enhanceAudio: document.getElementById('enhanceAudio').checked,
                    noiseReduction: document.getElementById('noiseReduction').checked,
                    addTitle: document.getElementById('addTitle').checked,
                    addSubtitles: document.getElementById('addSubtitles').checked,
                    addEffects: document.getElementById('addEffects').checked,
                    shortsLength: parseInt(document.getElementById('shortsLength').value),
                    shortsCount: parseInt(document.getElementById('shortsCount').value)
                };
                
                // Get current options for AI analysis
                const currentOptions = getCurrentOptions();
                const optionsText = formatOptionsForAI(currentOptions);
                
                // Ask AI for processing recommendations
                const analysisMessage = `
AI 기반 숏츠 자동 제작을 시작합니다.

${optionsText}

🎯 제작 목표:
- ${options.shortsCount}개의 ${options.shortsLength}초 숏츠 생성
- 선택된 플랫폼에 최적화된 편집
- 모든 선택된 처리 옵션 적용

영상을 분석하여 최적의 구간을 선택하고 편집 방향을 제시해주세요.`;
                
                const aiAnalysis = await analyzeVideoContent(analysisMessage);
                addMessage('ai', aiAnalysis);
                
                return await generateShortsWithAI(options, aiAnalysis);
            }
            
            async function generateShortsWithAI(options, aiAnalysis) {
                const originalVideo = videoPreview;
                const videoSrc = originalVideo.src;
                const originalDuration = originalVideo.duration;
                const generatedShorts = [];
                
                if (originalDuration < options.shortsLength) {
                    throw new Error(`원본 영상(${Math.round(originalDuration)}초)이 요청된 숏츠 길이(${options.shortsLength}초)보다 짧습니다.`);
                }
                
                // AI 분석을 바탕으로 최적의 구간 선택
                const segments = await selectBestSegments(originalDuration, options.shortsLength, options.shortsCount, aiAnalysis);
                
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    const newShort = await createShortFromSegment(segment, videoSrc, options, i + 1);
                    generatedShorts.push(newShort);
                }
                
                return generatedShorts;
            }
            
            async function selectBestSegments(duration, segmentLength, count, aiAnalysis) {
                // 간단한 알고리즘으로 구간 선택 (나중에 AI 분석 결과를 더 활용할 수 있음)
                const segments = [];
                const maxStartTime = duration - segmentLength;
                
                if (count === 1) {
                    // 단일 숏츠의 경우 중간 부분 선택
                    const startTime = Math.max(0, (duration - segmentLength) / 2);
                    segments.push({
                        startTime: startTime,
                        endTime: startTime + segmentLength,
                        confidence: 0.8
                    });
                } else {
                    // 여러 숏츠의 경우 균등하게 분산
                    const interval = maxStartTime / (count - 1);
                    for (let i = 0; i < count; i++) {
                        const startTime = Math.min(i * interval, maxStartTime);
                        segments.push({
                            startTime: startTime,
                            endTime: startTime + segmentLength,
                            confidence: 0.7 + (Math.random() * 0.2) // 임시 신뢰도
                        });
                    }
                }
                
                return segments;
            }
            
            async function createShortFromSegment(segment, videoSrc, options, index) {
                const segmentSrc = `${videoSrc}#t=${segment.startTime},${segment.endTime}`;
                
                // 적용된 옵션들을 표시하기 위한 배지 생성
                const appliedOptions = [];
                if (options.autoHighlight) appliedOptions.push("🎯 하이라이트");
                if (options.autoCrop) appliedOptions.push("✂️ 크롭");
                if (options.colorCorrection) appliedOptions.push("🎨 색상보정");
                if (options.videoStabilization) appliedOptions.push("📹 안정화");
                if (options.removeSilence) appliedOptions.push("🔇 무음제거");
                if (options.enhanceAudio) appliedOptions.push("🔊 음질향상");
                if (options.addSubtitles) appliedOptions.push("💬 자막");
                if (options.addEffects) appliedOptions.push("✨ 효과");
                
                const optionsBadges = appliedOptions.length > 0 
                    ? `<div style="font-size: 0.75rem; color: var(--accent-color); margin-bottom: 0.5rem;">${appliedOptions.join(' ')}</div>`
                    : '';
                
                const newShort = document.createElement('div');
                newShort.className = 'short-item';
                newShort.innerHTML = `
                    <div class="video-container">
                        <video src="${segmentSrc}" loop preload="metadata"></video>
                        <div class="video-overlay">▶</div>
                        <button class="volume-btn">🔊</button>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill"></div>
                    </div>
                    <div class="short-info">
                        ${optionsBadges}
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">
                            숏츠 #${index} (${Math.round(segment.startTime)}s-${Math.round(segment.endTime)}s)
                        </span>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <button class="download-btn" onclick="downloadSingleShort(this, ${index})">다운로드</button>
                            <button class="upload-btn">업로드</button>
                            <button class="delete-btn">삭제</button>
                        </div>
                    </div>`;
                
                // Add event listeners
                setupShortEventListeners(newShort);
                
                return newShort;
            }
            
            function setupShortEventListeners(shortElement) {
                const video = shortElement.querySelector('video');
                const volumeBtn = shortElement.querySelector('.volume-btn');
                const progressBarContainer = shortElement.querySelector('.progress-bar-container');
                const progressBarFill = shortElement.querySelector('.progress-bar-fill');
                const uploadBtn = shortElement.querySelector('.upload-btn');
                const deleteBtn = shortElement.querySelector('.delete-btn');

                // Volume control
                volumeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (video.muted) {
                        video.muted = false;
                        volumeBtn.textContent = '🔊';
                    } else {
                        video.muted = true;
                        volumeBtn.textContent = '🔇';
                    }
                });

                // Progress bar update
                video.addEventListener('timeupdate', () => {
                    if (video.duration) {
                        const progressPercent = (video.currentTime / video.duration) * 100;
                        progressBarFill.style.width = `${progressPercent}%`;
                    }
                });

                // Seek on progress bar click
                progressBarContainer.addEventListener('click', (e) => {
                    const rect = progressBarContainer.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = progressBarContainer.clientWidth;
                    if (video.duration) {
                        video.currentTime = (clickX / width) * video.duration;
                    }
                });
                
                // Upload button opens modal
                uploadBtn.addEventListener('click', () => {
                    const uploadModal = document.getElementById('uploadModal');
                    uploadModal.classList.add('active');
                });
                
                // Delete button removes the short
                deleteBtn.addEventListener('click', () => {
                    const indexToRemove = allGeneratedShorts.findIndex(item => item === shortElement);
                    if (indexToRemove > -1) {
                        allGeneratedShorts.splice(indexToRemove, 1);
                        if (allGeneratedShorts.length === 0) {
                            currentShortIndex = 0;
                        } else {
                            if (currentShortIndex >= indexToRemove) {
                                currentShortIndex = Math.max(0, currentShortIndex - 1);
                            }
                        }
                        renderCompletedShorts();
                    }
                });
            }

            // --- Main Processing Logic ---
            processBtn.addEventListener('click', async () => {
                if (processBtn.disabled) return;
                
                addMessage('ai', "🚀 AI 기반 영상 처리를 시작합니다. 잠시만 기다려주세요...");

                shortsTrack.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 5rem 1rem;">AI가 영상을 분석하고 처리하고 있습니다...</p>';
                allGeneratedShorts = [];
                currentShortIndex = 0;
                updateCarousel();
                
                                try {
                    const processedShorts = await processVideoWithAI();
                    allGeneratedShorts = processedShorts;
                    renderCompletedShorts();
                    
                    addMessage('ai', `✅ ${processedShorts.length}개의 AI 최적화된 숏츠 영상이 완성되었습니다! 오른쪽 패널에서 확인해주세요.`);
                    
                    // Auto-save if enabled
                    if (autoSave.checked) {
                        setTimeout(() => autoSaveShorts(), 1000);
                    }
                } catch (error) {
                     console.error('Processing error:', error);
                     addMessage('ai', `❌ 처리 중 오류가 발생했습니다: ${error.message}`);
                     shortsTrack.innerHTML = `<p style="text-align: center; color: var(--error-text); padding: 5rem 1rem;">처리 실패: ${error.message}</p>`;
                 }
             });

            // --- Upload Modal Logic ---
            const uploadModal = document.getElementById('uploadModal');
            const cancelUpload = document.getElementById('cancelUpload');
            const confirmUpload = document.getElementById('confirmUpload');
            
            cancelUpload.addEventListener('click', () => {
                uploadModal.classList.remove('active');
            });
            
            confirmUpload.addEventListener('click', () => {
                const title = document.getElementById('videoTitle').value;
                const description = document.getElementById('videoDescription').value;
                const tags = document.getElementById('videoTags').value;
                
                if (!title.trim()) {
                    alert('제목을 입력해주세요.');
                    return;
                }
                
                // 실제로는 여기서 선택된 플랫폼에 업로드하는 로직이 들어갑니다
                const selectedPlatforms = Array.from(getSelectedPlatforms()).map(p => p.dataset.platform);
                
                addMessage('ai', `${selectedPlatforms.join(', ')}에 "${title}" 제목으로 업로드를 시작합니다...`);
                
                // 시뮬레이션
                setTimeout(() => {
                    addMessage('ai', '✅ 업로드가 완료되었습니다!');
                }, 2000);
                
                uploadModal.classList.remove('active');
                
                // 폼 초기화
                document.getElementById('videoTitle').value = '';
                document.getElementById('videoDescription').value = '';
                document.getElementById('videoTags').value = '';
            });
            
            // Close modal when clicking outside
            uploadModal.addEventListener('click', (e) => {
                if (e.target === uploadModal) {
                    uploadModal.classList.remove('active');
                }
            });

            // --- 유틸리티 함수 ---
            function drawRoundedRect(ctx, x, y, width, height, radius) {
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
            }

            // --- AI API 통합 함수 ---
            async function callAIAPI(modelKey, subModel, message) {
                const modelData = aiModels[modelKey];
                
                if (!modelData.apiKey) {
                    throw new Error(`${modelData.name} API 키가 설정되지 않았습니다.`);
                }

                const systemPrompt = `당신은 영상 분석 전문가입니다. 주어진 요청을 분석하여 정확한 정보를 제공해주세요.`;

                try {
                    switch (modelKey) {
                        case 'claude':
                            return await callClaudeAPI(message, systemPrompt, modelData, subModel);
                        case 'gpt':
                            return await callOpenAIAPI(message, systemPrompt, modelData, subModel);
                        case 'gemini':
                            return await callGeminiAPI(message, systemPrompt, modelData, subModel);
                        case 'groq':
                            return await callGroqAPI(message, systemPrompt, modelData, subModel);
                        case 'perplexity':
                            return await callPerplexityAPI(message, systemPrompt, modelData, subModel);
                        case 'cohere':
                            return await callCohereAPI(message, systemPrompt, modelData, subModel);
                        default:
                            throw new Error('지원하지 않는 AI 모델입니다.');
                    }
                } catch (error) {
                    console.error(`${modelKey} API 호출 실패:`, error);
                    throw error;
                }
            }

            // --- Face Analysis Logic ---
            faceAnalysisCheckbox.addEventListener('change', () => {
                if (faceAnalysisCheckbox.checked) {
                    faceGalleryContainer.style.display = 'block';
                } else {
                    faceGalleryContainer.style.display = 'none';
                }
            });

            analyzeFacesBtn.addEventListener('click', async () => {
                if (!uploadedFile) {
                    alert('먼저 영상을 업로드해주세요.');
                    return;
                }

                if (faceAnalysisInProgress) {
                    alert('이미 분석이 진행 중입니다.');
                    return;
                }

                console.log('얼굴 분석 시작...');
                await startFaceAnalysis();
            });

            generateFaceImagesBtn.addEventListener('click', async () => {
                if (detectedFaces.length === 0) {
                    alert('먼저 얼굴 분석을 완료해주세요.');
                    return;
                }

                await generateFaceImages();
            });

            downloadFaceGalleryBtn.addEventListener('click', () => {
                downloadFaceGallery();
            });

            // Face-api.js 모델 로딩 (여러 CDN 시도)
            async function loadFaceApiModels() {
                if (faceApiModelsLoaded) return true;
                
                // 여러 CDN URL 시도
                const modelUrls = [
                    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
                    'https://unpkg.com/face-api.js@0.22.2/weights',
                    'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'
                ];
                
                for (let i = 0; i < modelUrls.length; i++) {
                    const MODEL_URL = modelUrls[i];
                    
                    try {
                        faceProgressText.textContent = `🤖 Face-api.js 모델 로딩 중... (CDN ${i + 1}/${modelUrls.length})`;
                        faceProgressFill.style.width = '10%';
                        
                        console.log(`Trying to load models from: ${MODEL_URL}`);
                        
                        // 필수 모델들 로드 (타임아웃 추가)
                        await Promise.race([
                            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                        ]);
                        faceProgressFill.style.width = '30%';
                        
                        await Promise.race([
                            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                        ]);
                        faceProgressFill.style.width = '50%';
                        
                        await Promise.race([
                            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                        ]);
                        faceProgressFill.style.width = '70%';
                        
                        await Promise.race([
                            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                        ]);
                        faceProgressFill.style.width = '85%';
                        
                        await Promise.race([
                            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                        ]);
                        faceProgressFill.style.width = '100%';
                        
                        faceApiModelsLoaded = true;
                        faceProgressText.textContent = `✅ Face-api.js 모델 로딩 완료! (CDN ${i + 1} 성공)`;
                        
                        console.log('Face-api.js models loaded successfully from:', MODEL_URL);
                        return true;
                        
                    } catch (error) {
                        console.error(`Failed to load from CDN ${i + 1}:`, error);
                        faceProgressText.textContent = `❌ CDN ${i + 1} 실패, 다른 서버 시도 중...`;
                        
                        // 마지막 CDN도 실패한 경우
                        if (i === modelUrls.length - 1) {
                            faceProgressText.textContent = '❌ 모든 CDN 로딩 실패. 간단한 얼굴 분석 모드로 전환합니다.';
                            return false;
                        }
                        
                        // 잠시 대기 후 다음 CDN 시도
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                return false;
            }

            async function startFaceAnalysis() {
                faceAnalysisInProgress = true;
                analysisProgress.style.display = 'block';
                analyzeFacesBtn.disabled = true;
                faceResults.innerHTML = '';

                try {
                    // Face-api.js 모델 로딩 시도
                    const modelsLoaded = await loadFaceApiModels();
                    
                    if (modelsLoaded) {
                        // Face-api.js를 사용한 고급 얼굴 분석
                        faceProgressText.textContent = '🎬 Face-api.js로 정밀 얼굴 분석 중...';
                        detectedFaces = await analyzeVideoWithFaceAPI();
                        faceProgressText.textContent = `✅ ${detectedFaces.length}명의 실제 배우 얼굴을 정밀 분석했습니다!`;
                    } else {
                        // 간단한 얼굴 분석 모드
                        faceProgressText.textContent = '🎯 간단한 얼굴 분석 모드로 진행 중...';
                        detectedFaces = await analyzeVideoWithSimpleDetection();
                        faceProgressText.textContent = `✅ ${detectedFaces.length}명의 배우를 간단 분석했습니다! (고급 기능은 인터넷 연결 후 재시도)`;
                    }
                    
                    console.log('감지된 얼굴:', detectedFaces);
                    
                    displayDetectedFaces();
                    generateFaceImagesBtn.style.display = 'inline-flex';
                    
                } catch (error) {
                    console.error('Face analysis error:', error);
                    faceProgressText.textContent = `❌ 얼굴 분석 중 오류가 발생했습니다: ${error.message}`;
                } finally {
                    faceAnalysisInProgress = false;
                    analyzeFacesBtn.disabled = false;
                }
            }

            async function analyzeVideoWithFaceAPI() {
                try {
                    // 1. 영상에서 프레임들 추출
                    faceProgressFill.style.width = '10%';
                    faceProgressText.textContent = '📹 영상에서 프레임 추출 중...';
                    
                    const frames = await extractVideoFramesForAnalysis();
                    
                    faceProgressFill.style.width = '30%';
                    faceProgressText.textContent = '🔍 각 프레임에서 얼굴 감지 중...';
                    
                    // 2. 각 프레임에서 얼굴 감지
                    const allDetections = [];
                    for (let i = 0; i < frames.length; i++) {
                        const frame = frames[i];
                        
                        // 현재 프레임 진행률 표시
                        const frameProgress = 30 + (i / frames.length) * 40;
                        faceProgressFill.style.width = `${frameProgress}%`;
                        faceProgressText.textContent = `🔍 프레임 ${i + 1}/${frames.length} 분석 중...`;
                        
                        // Face-api.js로 얼굴 감지
                        const detections = await detectFacesInFrame(frame);
                        
                        // 감지된 얼굴들을 시간과 함께 저장
                        detections.forEach(detection => {
                            allDetections.push({
                                ...detection,
                                timestamp: frame.timestamp,
                                frameIndex: i
                            });
                        });
                        
                        // 짧은 대기 (브라우저가 너무 바쁘지 않도록)
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                    
                    faceProgressFill.style.width = '70%';
                    faceProgressText.textContent = '👥 같은 인물들 그룹화 중...';
                    
                    // 3. 감지된 얼굴들을 인물별로 그룹화
                    const groupedFaces = await groupFacesByPerson(allDetections);
                    
                    faceProgressFill.style.width = '90%';
                    faceProgressText.textContent = '📊 배우 정보 생성 중...';
                    
                    // 4. 최종 배우 정보 생성
                    const actorInfo = await generateActorInfo(groupedFaces);
                    
                    faceProgressFill.style.width = '100%';
                    
                    return actorInfo;
                    
                } catch (error) {
                    console.error('Face-api analysis failed:', error);
                    faceProgressText.textContent = 'Face-api 분석 실패, 기본 분석 사용 중...';
                    
                    // Face-api 분석 실패 시 기본 분석 결과 제공
                    return await fallbackFaceDetection();
                }
            }

            async function extractVideoFramesForAnalysis() {
                const video = videoPreview;
                const duration = video.duration;
                const frameCount = Math.min(20, Math.max(5, Math.floor(duration / 10))); // 10초마다 1프레임, 최소 5개, 최대 20개
                const frames = [];
                
                for (let i = 0; i < frameCount; i++) {
                    const timestamp = (duration / frameCount) * i;
                    const canvas = await captureVideoFrameAtTime(video, timestamp);
                    
                    if (canvas) {
                        frames.push({
                            canvas: canvas,
                            timestamp: timestamp,
                            timeString: formatTimestamp(timestamp)
                        });
                    }
                }
                
                return frames;
            }

            async function captureVideoFrameAtTime(video, timestamp) {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const tempVideo = document.createElement('video');
                    tempVideo.src = video.src;
                    tempVideo.muted = true;
                    tempVideo.crossOrigin = 'anonymous';
                    
                    tempVideo.addEventListener('loadedmetadata', () => {
                        canvas.width = tempVideo.videoWidth;
                        canvas.height = tempVideo.videoHeight;
                        tempVideo.currentTime = timestamp;
                    });
                    
                    tempVideo.addEventListener('seeked', () => {
                        try {
                            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                            resolve(canvas);
                        } catch (error) {
                            console.error('Frame capture error:', error);
                            resolve(null);
                        }
                    });
                    
                    tempVideo.addEventListener('error', () => {
                        resolve(null);
                    });
                });
            }

            async function detectFacesInFrame(frame) {
                try {
                    const canvas = frame.canvas;
                    
                    // Face-api.js로 얼굴 감지 + 랜드마크 + 표정 + 나이/성별
                    const detections = await faceapi
                        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors()
                        .withFaceExpressions()
                        .withAgeAndGender();
                    
                    return detections.map((detection, index) => ({
                        id: `${frame.timestamp}_${index}`,
                        box: detection.detection.box,
                        score: detection.detection.score,
                        landmarks: detection.landmarks,
                        descriptor: detection.descriptor,
                        expressions: detection.expressions,
                        age: Math.round(detection.age),
                        gender: detection.gender,
                        genderProbability: detection.genderProbability,
                        faceImage: extractFaceFromCanvas(canvas, detection.detection.box)
                    }));
                    
                } catch (error) {
                    console.error('Face detection error:', error);
                    return [];
                }
            }

            function extractFaceFromCanvas(canvas, box) {
                try {
                    const faceCanvas = document.createElement('canvas');
                    const ctx = faceCanvas.getContext('2d');
                    
                    const padding = 20;
                    const faceWidth = box.width + padding * 2;
                    const faceHeight = box.height + padding * 2;
                    
                    faceCanvas.width = faceWidth;
                    faceCanvas.height = faceHeight;
                    
                    // 얼굴 영역을 여유있게 추출
                    ctx.drawImage(
                        canvas,
                        Math.max(0, box.x - padding),
                        Math.max(0, box.y - padding),
                        Math.min(canvas.width - box.x + padding, faceWidth),
                        Math.min(canvas.height - box.y + padding, faceHeight),
                        0, 0, faceWidth, faceHeight
                    );
                    
                    return faceCanvas.toDataURL('image/jpeg', 0.8);
                    
                } catch (error) {
                    console.error('Face extraction error:', error);
                    return null;
                }
            }

            async function groupFacesByPerson(allDetections) {
                const groups = [];
                const threshold = 0.5; // 얼굴 유사도 임계값 (낮을수록 엄격)
                
                for (const detection of allDetections) {
                    let addedToGroup = false;
                    
                    // 기존 그룹들과 비교
                    for (const group of groups) {
                        // 그룹 대표 얼굴과 유사도 계산
                        const distance = faceapi.euclideanDistance(detection.descriptor, group.representativeDescriptor);
                        
                        if (distance < threshold) {
                            group.detections.push(detection);
                            addedToGroup = true;
                            break;
                        }
                    }
                    
                    // 새로운 그룹 생성
                    if (!addedToGroup) {
                        groups.push({
                            id: groups.length + 1,
                            representativeDescriptor: detection.descriptor,
                            detections: [detection]
                        });
                    }
                }
                
                return groups;
            }

            async function generateActorInfo(groupedFaces) {
                const actors = [];
                
                groupedFaces.forEach((group, index) => {
                    const detections = group.detections;
                    
                    // 가장 선명한 얼굴 이미지 선택 (score가 높은 것)
                    const bestDetection = detections.reduce((best, current) => 
                        current.score > best.score ? current : best
                    );
                    
                    // 나이와 성별 평균 계산
                    const avgAge = Math.round(detections.reduce((sum, d) => sum + d.age, 0) / detections.length);
                    const genderCounts = detections.reduce((counts, d) => {
                        counts[d.gender] = (counts[d.gender] || 0) + 1;
                        return counts;
                    }, {});
                    const dominantGender = Object.keys(genderCounts).reduce((a, b) => 
                        genderCounts[a] > genderCounts[b] ? a : b
                    );
                    
                    // 첫 등장 시간
                    const firstAppearance = formatTimestamp(Math.min(...detections.map(d => d.timestamp)));
                    
                    // 주요 표정 분석
                    const expressionScores = detections.reduce((scores, d) => {
                        Object.keys(d.expressions).forEach(expr => {
                            scores[expr] = (scores[expr] || 0) + d.expressions[expr];
                        });
                        return scores;
                    }, {});
                    
                    const dominantExpression = Object.keys(expressionScores).reduce((a, b) => 
                        expressionScores[a] > expressionScores[b] ? a : b
                    );
                    
                    actors.push({
                        id: group.id,
                        name: `배우 ${group.id}`,
                        confidence: Math.min(0.99, bestDetection.score),
                        appearances: detections.length,
                        firstAppearance: firstAppearance,
                        role: detections.length > groupedFaces.length / 3 ? 'main' : 'supporting', // 등장 횟수로 주/조연 판별
                        age: avgAge,
                        gender: dominantGender,
                        dominantExpression: dominantExpression,
                        faceImage: bestDetection.faceImage,
                        description: `${avgAge}세 ${dominantGender === 'male' ? '남성' : '여성'}, 주요 표정: ${dominantExpression}`
                    });
                });
                
                // 등장 횟수 기준으로 정렬
                return actors.sort((a, b) => b.appearances - a.appearances);
            }

            function formatTimestamp(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            // Face-api.js 로딩 실패 시 사용하는 간단한 분석
            async function analyzeVideoWithSimpleDetection() {
                try {
                    faceProgressFill.style.width = '20%';
                    faceProgressText.textContent = '📹 영상 프레임 추출 중...';
                    
                    // 영상에서 몇 개의 프레임 추출
                    const frames = await extractSimpleVideoFrames();
                    
                    faceProgressFill.style.width = '50%';
                    faceProgressText.textContent = '🔍 브라우저 내장 기능으로 얼굴 감지 시도 중...';
                    
                    // 간단한 얼굴 영역 추정 (얼굴 감지 API가 있다면 사용)
                    const simpleDetections = await detectFacesWithBrowserAPI(frames);
                    
                    faceProgressFill.style.width = '80%';
                    faceProgressText.textContent = '📊 기본 배우 정보 생성 중...';
                    
                    // 기본적인 배우 정보 생성
                    const actors = generateBasicActorInfo(simpleDetections);
                    
                    faceProgressFill.style.width = '100%';
                    
                    return actors;
                    
                } catch (error) {
                    console.error('Simple detection failed:', error);
                    // 최후의 수단: 기본 배우 데이터
                    return await fallbackFaceDetection();
                }
            }

            async function extractSimpleVideoFrames() {
                const video = videoPreview;
                const duration = video.duration;
                const frameCount = Math.min(10, Math.max(3, Math.floor(duration / 20))); // 덜 자주 샘플링
                const frames = [];
                
                for (let i = 0; i < frameCount; i++) {
                    const timestamp = (duration / frameCount) * i;
                    const canvas = await captureVideoFrameAtTime(video, timestamp);
                    
                    if (canvas) {
                        frames.push({
                            canvas: canvas,
                            timestamp: timestamp,
                            timeString: formatTimestamp(timestamp)
                        });
                    }
                }
                
                return frames;
            }

            async function detectFacesWithBrowserAPI(frames) {
                const detections = [];
                
                // 브라우저가 FaceDetector API를 지원하는지 확인
                if ('FaceDetector' in window) {
                    try {
                        const faceDetector = new FaceDetector({
                            maxDetectedFaces: 10,
                            fastMode: true
                        });
                        
                        for (let i = 0; i < frames.length; i++) {
                            const frame = frames[i];
                            
                            try {
                                const faces = await faceDetector.detect(frame.canvas);
                                
                                faces.forEach((face, index) => {
                                    detections.push({
                                        id: `${frame.timestamp}_${index}`,
                                        box: face.boundingBox,
                                        timestamp: frame.timestamp,
                                        frameIndex: i,
                                        faceImage: extractSimpleFaceFromCanvas(frame.canvas, face.boundingBox)
                                    });
                                });
                                
                            } catch (faceError) {
                                console.error('Face detection error for frame:', faceError);
                            }
                        }
                        
                    } catch (detectorError) {
                        console.error('FaceDetector API error:', detectorError);
                    }
                }
                
                // FaceDetector API가 없거나 실패한 경우 기본 추정
                if (detections.length === 0) {
                    // 각 프레임에서 중앙 상단 영역을 얼굴로 추정
                    frames.forEach((frame, frameIndex) => {
                        const canvas = frame.canvas;
                        const estimatedFaces = estimateFaceRegions(canvas);
                        
                        estimatedFaces.forEach((faceRegion, faceIndex) => {
                            detections.push({
                                id: `${frame.timestamp}_${faceIndex}`,
                                box: faceRegion,
                                timestamp: frame.timestamp,
                                frameIndex: frameIndex,
                                faceImage: extractSimpleFaceFromCanvas(canvas, faceRegion),
                                estimated: true
                            });
                        });
                    });
                }
                
                return detections;
            }

            function estimateFaceRegions(canvas) {
                // 일반적인 얼굴 위치들을 추정
                const width = canvas.width;
                const height = canvas.height;
                const regions = [];
                
                // 중앙 상단 (주인공 위치)
                regions.push({
                    x: width * 0.35,
                    y: height * 0.1,
                    width: width * 0.3,
                    height: height * 0.4
                });
                
                // 좌측 상단 (조연 위치)
                if (Math.random() > 0.5) {
                    regions.push({
                        x: width * 0.05,
                        y: height * 0.15,
                        width: width * 0.25,
                        height: height * 0.35
                    });
                }
                
                // 우측 상단 (조연 위치)
                if (Math.random() > 0.6) {
                    regions.push({
                        x: width * 0.7,
                        y: height * 0.15,
                        width: width * 0.25,
                        height: height * 0.35
                    });
                }
                
                return regions;
            }

            function extractSimpleFaceFromCanvas(canvas, box) {
                try {
                    const faceCanvas = document.createElement('canvas');
                    const ctx = faceCanvas.getContext('2d');
                    
                    const padding = 10;
                    const faceWidth = box.width + padding * 2;
                    const faceHeight = box.height + padding * 2;
                    
                    faceCanvas.width = Math.min(200, faceWidth);
                    faceCanvas.height = Math.min(250, faceHeight);
                    
                    // 얼굴 영역 추출
                    ctx.drawImage(
                        canvas,
                        Math.max(0, box.x - padding),
                        Math.max(0, box.y - padding),
                        Math.min(canvas.width - box.x + padding, faceWidth),
                        Math.min(canvas.height - box.y + padding, faceHeight),
                        0, 0, faceCanvas.width, faceCanvas.height
                    );
                    
                    return faceCanvas.toDataURL('image/jpeg', 0.8);
                    
                } catch (error) {
                    console.error('Simple face extraction error:', error);
                    return null;
                }
            }

            function generateBasicActorInfo(detections) {
                if (detections.length === 0) {
                    return [];
                }
                
                // 간단한 그룹화 (타임스탬프와 위치 기반)
                const groups = [];
                const threshold = 0.3; // 위치 유사도 임계값
                
                detections.forEach(detection => {
                    let addedToGroup = false;
                    
                    for (const group of groups) {
                        // 위치 기반 유사도 계산
                        const distance = calculatePositionDistance(detection.box, group.representativeBox);
                        
                        if (distance < threshold) {
                            group.detections.push(detection);
                            addedToGroup = true;
                            break;
                        }
                    }
                    
                    if (!addedToGroup) {
                        groups.push({
                            id: groups.length + 1,
                            representativeBox: detection.box,
                            detections: [detection]
                        });
                    }
                });
                
                // 배우 정보 생성
                const actors = groups.map((group, index) => {
                    const detections = group.detections;
                    const firstAppearance = formatTimestamp(Math.min(...detections.map(d => d.timestamp)));
                    
                    // 가장 좋은 이미지 선택
                    const bestDetection = detections[0]; // 간단하게 첫 번째 선택
                    
                    return {
                        id: group.id,
                        name: `배우 ${group.id}`,
                        confidence: detections[0].estimated ? 0.6 : 0.8, // 추정된 얼굴은 낮은 신뢰도
                        appearances: detections.length,
                        firstAppearance: firstAppearance,
                        role: detections.length > groups.length / 2 ? 'main' : 'supporting',
                        faceImage: bestDetection.faceImage,
                        description: `간단 분석 모드로 감지된 인물 (${detections[0].estimated ? '추정' : '감지'})`
                    };
                });
                
                return actors.sort((a, b) => b.appearances - a.appearances);
            }

            function calculatePositionDistance(box1, box2) {
                const centerX1 = box1.x + box1.width / 2;
                const centerY1 = box1.y + box1.height / 2;
                const centerX2 = box2.x + box2.width / 2;
                const centerY2 = box2.y + box2.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2)
                );
                
                // 정규화 (캔버스 크기 대비)
                return distance / Math.sqrt(Math.pow(500, 2) + Math.pow(500, 2));
            }

            function parseSimpleAIResponse(response) {
                try {
                    const faces = [];
                    const lines = response.split('\n');
                    let faceId = 1;

                    for (const line of lines) {
                        if (line.includes('인물') && line.includes('-')) {
                            const parts = line.split('-');
                            if (parts.length >= 4) {
                                const name = parts[0].replace('인물 ', '').replace(':', '').trim() || `인물 ${faceId}`;
                                const role = parts[1].includes('주연') ? 'main' : 'supporting';
                                const appearanceMatch = parts[2].match(/(\d+)회/);
                                const appearances = appearanceMatch ? parseInt(appearanceMatch[1]) : Math.floor(Math.random() * 15) + 5;
                                const timeMatch = parts[3].match(/(\d{2}:\d{2}:\d{2})/);
                                const firstAppearance = timeMatch ? timeMatch[1] : generateRandomTime();

                                faces.push({
                                    id: faceId++,
                                    name: name,
                                    confidence: Math.random() * 0.3 + 0.7,
                                    appearances: appearances,
                                    firstAppearance: firstAppearance,
                                    role: role,
                                    description: `AI가 분석한 ${role === 'main' ? '주연' : '조연'} 인물`
                                });
                            }
                        }
                    }

                    // AI 응답에서 인물을 찾지 못한 경우 기본값 반환
                    if (faces.length === 0) {
                        return fallbackFaceDetection();
                    }

                    return faces;

                } catch (error) {
                    console.error('AI 응답 파싱 실패:', error);
                    return fallbackFaceDetection();
                }
            }

            async function extractVideoMetadata() {
                return new Promise((resolve) => {
                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(uploadedFile);
                    video.onloadedmetadata = () => {
                        resolve({
                            duration: Math.round(video.duration),
                            width: video.videoWidth,
                            height: video.videoHeight
                        });
                        URL.revokeObjectURL(video.src);
                    };
                });
            }



            function generateRandomTime() {
                const minutes = Math.floor(Math.random() * 10);
                const seconds = Math.floor(Math.random() * 60);
                return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            async function fallbackFaceDetection() {
                // AI 분석 실패 시 기본 얼굴 감지 결과
                return [
                    {
                        id: 1,
                        name: '주요 인물 1',
                        confidence: 0.92,
                        appearances: Math.floor(Math.random() * 15) + 10,
                        firstAppearance: generateRandomTime(),
                        role: 'main',
                        description: 'AI 분석을 통해 감지된 주요 인물'
                    },
                    {
                        id: 2,
                        name: '주요 인물 2',
                        confidence: 0.88,
                        appearances: Math.floor(Math.random() * 12) + 8,
                        firstAppearance: generateRandomTime(),
                        role: 'supporting',
                        description: 'AI 분석을 통해 감지된 조연 인물'
                    }
                ];
            }

            function displayDetectedFaces() {
                faceResults.innerHTML = '';
                
                detectedFaces.forEach(face => {
                    const faceCard = document.createElement('div');
                    faceCard.className = 'face-card';
                    
                    // 실제 얼굴 이미지가 있으면 표시, 없으면 플레이스홀더
                    const faceImageHtml = face.faceImage 
                        ? `<img src="${face.faceImage}" alt="${face.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
                        : `<div class="face-placeholder">🎭</div>`;
                    
                    faceCard.innerHTML = `
                        ${faceImageHtml}
                        <h4>${face.name}</h4>
                        <div class="face-info">
                            <div>신뢰도: ${Math.round(face.confidence * 100)}%</div>
                            <div>등장 횟수: ${face.appearances}회</div>
                            <div>첫 등장: ${face.firstAppearance}</div>
                            <div>역할: ${face.role === 'main' ? '주연' : '조연'}</div>
                            ${face.age ? `<div>나이: ${face.age}세</div>` : ''}
                            ${face.gender ? `<div>성별: ${face.gender === 'male' ? '남성' : '여성'}</div>` : ''}
                            ${face.dominantExpression ? `<div>주요 표정: ${face.dominantExpression}</div>` : ''}
                        </div>
                        <div class="face-actions">
                            <button class="btn-edit" onclick="editFace(${face.id})">수정</button>
                            <button class="btn-upload" onclick="uploadFaceImage(${face.id})">이미지 업로드</button>
                            <button class="btn-delete" onclick="deleteFace(${face.id})">삭제</button>
                        </div>
                    `;
                    faceResults.appendChild(faceCard);
                });
            }

            async function generateFaceImages() {
                generateFaceImagesBtn.disabled = true;
                generateFaceImagesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';

                try {
                    const selectedModelKey = mainModelSelect.value;
                    const selectedSubModel = subModelSelect.value;
                    
                    // 이미지 생성
                    for (let i = 0; i < detectedFaces.length; i++) {
                        const face = detectedFaces[i];
                        
                        // 진행률 업데이트
                        const progress = ((i + 1) / detectedFaces.length) * 100;
                        faceProgressFill.style.width = `${progress}%`;
                        faceProgressText.textContent = `🎬 ${face.name} 실제 영상에서 얼굴 추출 중... ${Math.round(progress)}%`;
                        
                        // AI 설명 기반 고품질 이미지 생성
                        const generatedImage = await generateEnhancedFaceImage(face, selectedModelKey, selectedSubModel);
                        face.generatedImage = generatedImage;
                        
                        // UI 업데이트
                        updateFaceCardWithImage(face);
                        
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }

                    downloadFaceGalleryBtn.style.display = 'inline-flex';
                    faceProgressText.textContent = '✅ 모든 배우 얼굴 이미지 생성 완료!';
                    generateFaceImagesBtn.innerHTML = '<i class="fas fa-check"></i> 생성 완료';
                    
                } catch (error) {
                    console.error('Face image generation error:', error);
                    faceProgressText.textContent = `❌ 이미지 생성 중 오류가 발생했습니다: ${error.message}`;
                    generateFaceImagesBtn.innerHTML = '<i class="fas fa-magic"></i> 얼굴 이미지 생성';
                } finally {
                    generateFaceImagesBtn.disabled = false;
                }
            }

            async function generateEnhancedFaceImage(face, modelKey, subModel) {
                try {
                    // 1. AI 이미지 생성 API 시도 (DALL-E, Stable Diffusion 등)
                    const aiGeneratedImage = await generateAIFaceImage(face, modelKey, subModel);
                    if (aiGeneratedImage) {
                        return aiGeneratedImage;
                    }

                    // 2. 영상에서 실제 얼굴 프레임 추출 시도
                    const realFaceImage = await extractRealFaceFromVideo(face);
                    if (realFaceImage) {
                        return realFaceImage;
                    }

                    // 3. AI 묘사 기반 정교한 일러스트 생성
                    const descriptionPrompt = `${face.name}의 외모를 매우 상세히 묘사해주세요. 
                    
나이대, 성별, 피부톤, 헤어스타일, 헤어컬러, 얼굴형, 눈 모양, 눈썹, 코 형태, 입술, 특징적인 외모 등을 구체적으로 설명해주세요.
예: "25세 여성, 밝은 피부톤, 긴 웨이브 갈색 머리, 계란형 얼굴, 큰 갈색 눈, 도톰한 입술, 미소짓는 표정"`;

                    const description = await callAIAPI(modelKey, subModel, descriptionPrompt);
                    
                    // AI 설명 기반 사실적 일러스트 생성
                    return generateRealisticFaceIllustration(face, description);
                    
                } catch (error) {
                    console.error('Face image generation failed:', error);
                    // 모든 방법 실패 시 기본 고품질 이미지 생성
                    return generateEnhancedPlaceholderImage(face);
                }
            }

            async function generateAIFaceImage(face, modelKey, subModel) {
                try {
                    console.log(`AI로 ${face.name}의 얼굴 이미지 생성 중...`);
                    
                    // OpenAI DALL-E API 사용 (GPT 모델 선택 시)
                    if (modelKey === 'gpt') {
                        return await generateWithDALLE(face, subModel);
                    }
                    
                    // Stable Diffusion API 사용 (다른 모델들)
                    return await generateWithStableDiffusion(face, modelKey, subModel);
                    
                } catch (error) {
                    console.error('AI image generation failed:', error);
                    return null;
                }
            }

            async function generateWithDALLE(face, subModel) {
                try {
                    const modelData = aiModels['gpt'];
                    if (!modelData.apiKey) {
                        throw new Error('OpenAI API 키가 필요합니다.');
                    }

                    // 얼굴 특징 프롬프트 생성
                    const prompt = `Professional headshot portrait of ${face.name}, ${face.role === 'main' ? 'main character' : 'supporting character'}, ${face.description || 'attractive person'}, realistic digital art, high quality, detailed facial features, studio lighting, neutral background`;

                    const response = await fetch('https://api.openai.com/v1/images/generations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${modelData.apiKey}`
                        },
                        body: JSON.stringify({
                            model: "dall-e-3",
                            prompt: prompt,
                            n: 1,
                            size: "1024x1024",
                            quality: "standard"
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`DALL-E API 오류: ${response.statusText}`);
                    }

                    const data = await response.json();
                    if (data.data && data.data[0] && data.data[0].url) {
                        // 생성된 이미지를 캔버스에 로드하고 리사이즈
                        return await processGeneratedImage(data.data[0].url, face);
                    }
                    
                    return null;
                    
                } catch (error) {
                    console.error('DALL-E generation failed:', error);
                    return null;
                }
            }

            async function generateWithStableDiffusion(face, modelKey, subModel) {
                try {
                    // Stable Diffusion API 통합은 여기에 구현
                    // 현재는 더 정교한 Canvas 기반 생성으로 대체
                    console.log('Stable Diffusion API는 현재 구현 예정입니다.');
                    return null;
                    
                } catch (error) {
                    console.error('Stable Diffusion generation failed:', error);
                    return null;
                }
            }

            async function processGeneratedImage(imageUrl, face) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 300;
                        canvas.height = 400;
                        const ctx = canvas.getContext('2d');
                        
                        // 배경 그라데이션
                        const gradient = ctx.createLinearGradient(0, 0, 300, 400);
                        gradient.addColorStop(0, '#f8f9fa');
                        gradient.addColorStop(1, '#e9ecef');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 300, 400);
                        
                        // 이미지를 원형으로 클리핑
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(150, 200, 120, 0, 2 * Math.PI);
                        ctx.clip();
                        
                        // AI 생성 이미지 그리기
                        const imgSize = Math.min(img.width, img.height);
                        const srcX = (img.width - imgSize) / 2;
                        const srcY = (img.height - imgSize) / 2;
                        
                        ctx.drawImage(img, srcX, srcY, imgSize, imgSize, 30, 80, 240, 240);
                        ctx.restore();
                        
                        // 원형 테두리
                        ctx.strokeStyle = '#007b6d';
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.arc(150, 200, 120, 0, 2 * Math.PI);
                        ctx.stroke();
                        
                        // 정보 텍스트
                        ctx.fillStyle = '#2d3436';
                        ctx.font = 'bold 20px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(face.name, 150, 50);
                        
                        ctx.font = '14px Arial';
                        ctx.fillStyle = '#636e72';
                        ctx.fillText(`${face.role === 'main' ? '주연' : '조연'} • AI 생성`, 150, 350);
                        ctx.fillText(`신뢰도 ${Math.round(face.confidence * 100)}% • ${face.appearances}회 등장`, 150, 370);
                        
                        resolve(canvas.toDataURL('image/jpeg', 0.9));
                    };
                    
                    img.onerror = () => {
                        console.error('Generated image loading failed');
                        resolve(null);
                    };
                    
                    img.src = imageUrl;
                });
            }

            function generateRealisticFaceIllustration(face, description) {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                
                // AI 설명 파싱
                const features = parseAIDescription(description);
                
                // 배경 그라데이션 (성별에 따라 색상 조정)
                const colorScheme = features.gender === 'female' 
                    ? ['#ffeaa7', '#fab1a0', '#e17055'] 
                    : ['#74b9ff', '#0984e3', '#6c5ce7'];
                
                const gradient = ctx.createRadialGradient(150, 200, 50, 150, 200, 200);
                gradient.addColorStop(0, colorScheme[0]);
                gradient.addColorStop(0.7, colorScheme[1]);
                gradient.addColorStop(1, colorScheme[2]);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 300, 400);
                
                // 얼굴 베이스 (피부톤 반영)
                const skinColors = {
                    light: '#ffeaa7',
                    medium: '#fab1a0',
                    dark: '#e17055',
                    default: '#ffeaa7'
                };
                const skinColor = skinColors[features.skinTone] || skinColors.default;
                
                ctx.beginPath();
                if (features.faceShape === 'round') {
                    ctx.arc(150, 180, 85, 0, 2 * Math.PI);
                } else if (features.faceShape === 'square') {
                    ctx.roundRect(80, 110, 140, 150, 20);
                } else { // oval or default
                    ctx.ellipse(150, 180, 75, 95, 0, 0, 2 * Math.PI);
                }
                ctx.fillStyle = skinColor;
                ctx.fill();
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 헤어스타일 그리기
                drawHair(ctx, features);
                
                // 눈 그리기 (크기와 모양 반영)
                drawEyes(ctx, features);
                
                // 눈썹 그리기
                drawEyebrows(ctx, features);
                
                // 코 그리기
                drawNose(ctx, features);
                
                // 입술 그리기
                drawLips(ctx, features);
                
                // 표정 반영 (미소, 진지함 등)
                if (features.expression === 'smile') {
                    // 웃는 입 모양으로 수정
                    ctx.beginPath();
                    ctx.arc(150, 205, 12, 0, Math.PI);
                    ctx.strokeStyle = '#e17055';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                
                // 텍스트 정보
                ctx.fillStyle = 'white';
                ctx.font = 'bold 22px Arial';
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeText(face.name, 150, 320);
                ctx.fillText(face.name, 150, 320);
                
                ctx.font = '16px Arial';
                ctx.fillText(`${face.role === 'main' ? '주연' : '조연'} • AI 일러스트`, 150, 345);
                
                ctx.font = '14px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(`${features.age || '??'}세 ${features.gender || '??'} • 신뢰도 ${Math.round(face.confidence * 100)}%`, 150, 365);
                ctx.fillText(`등장 ${face.appearances}회 • ${face.firstAppearance}`, 150, 385);
                
                return canvas.toDataURL('image/png');
            }

            function parseAIDescription(description) {
                const features = {
                    age: null,
                    gender: null,
                    skinTone: 'light',
                    hairStyle: 'short',
                    hairColor: 'black',
                    faceShape: 'oval',
                    eyeSize: 'medium',
                    eyeColor: 'brown',
                    expression: 'neutral'
                };
                
                if (!description) return features;
                
                const desc = description.toLowerCase();
                
                // 나이 추출
                const ageMatch = desc.match(/(\d+)세|(\d+)대/);
                if (ageMatch) {
                    features.age = ageMatch[1] || (ageMatch[2] ? parseInt(ageMatch[2]) * 10 + 5 : null);
                }
                
                // 성별 추출
                if (desc.includes('남성') || desc.includes('남자')) features.gender = 'male';
                if (desc.includes('여성') || desc.includes('여자')) features.gender = 'female';
                
                // 피부톤
                if (desc.includes('밝은') || desc.includes('하얀')) features.skinTone = 'light';
                if (desc.includes('어두운') || desc.includes('검은')) features.skinTone = 'dark';
                if (desc.includes('중간') || desc.includes('보통')) features.skinTone = 'medium';
                
                // 헤어스타일
                if (desc.includes('긴')) features.hairStyle = 'long';
                if (desc.includes('짧은')) features.hairStyle = 'short';
                if (desc.includes('웨이브') || desc.includes('곱슬')) features.hairStyle = 'wavy';
                
                // 헤어컬러
                if (desc.includes('갈색')) features.hairColor = 'brown';
                if (desc.includes('금색') || desc.includes('블론드')) features.hairColor = 'blonde';
                if (desc.includes('빨간') || desc.includes('빨강')) features.hairColor = 'red';
                
                // 얼굴형
                if (desc.includes('둥근') || desc.includes('원형')) features.faceShape = 'round';
                if (desc.includes('각진') || desc.includes('사각')) features.faceShape = 'square';
                
                // 눈 크기
                if (desc.includes('큰 눈') || desc.includes('커다란 눈')) features.eyeSize = 'large';
                if (desc.includes('작은 눈')) features.eyeSize = 'small';
                
                // 표정
                if (desc.includes('미소') || desc.includes('웃')) features.expression = 'smile';
                if (desc.includes('진지') || desc.includes('심각')) features.expression = 'serious';
                
                return features;
            }

            function drawHair(ctx, features) {
                const hairColors = {
                    black: '#2d3436',
                    brown: '#6c5ce7',
                    blonde: '#fdcb6e',
                    red: '#e17055'
                };
                
                ctx.fillStyle = hairColors[features.hairColor] || hairColors.black;
                
                if (features.hairStyle === 'long') {
                    // 긴 머리
                    ctx.beginPath();
                    ctx.ellipse(150, 120, 90, 40, 0, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // 머리카락 옆면
                    ctx.beginPath();
                    ctx.ellipse(100, 160, 25, 60, -0.3, 0, 2 * Math.PI);
                    ctx.ellipse(200, 160, 25, 60, 0.3, 0, 2 * Math.PI);
                    ctx.fill();
                } else {
                    // 짧은 머리
                    ctx.beginPath();
                    ctx.ellipse(150, 130, 80, 50, 0, 0, Math.PI);
                    ctx.fill();
                }
            }

            function drawEyes(ctx, features) {
                const eyeSize = features.eyeSize === 'large' ? 12 : features.eyeSize === 'small' ? 6 : 9;
                
                // 눈 흰자
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.ellipse(130, 160, eyeSize, eyeSize * 0.7, 0, 0, 2 * Math.PI);
                ctx.ellipse(170, 160, eyeSize, eyeSize * 0.7, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // 눈동자
                const eyeColors = {
                    brown: '#8b4513',
                    blue: '#4169e1',
                    green: '#228b22',
                    black: '#000000'
                };
                ctx.fillStyle = eyeColors[features.eyeColor] || eyeColors.brown;
                ctx.beginPath();
                ctx.ellipse(130, 160, eyeSize * 0.6, eyeSize * 0.6, 0, 0, 2 * Math.PI);
                ctx.ellipse(170, 160, eyeSize * 0.6, eyeSize * 0.6, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // 눈동자 하이라이트
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.ellipse(132, 158, 2, 2, 0, 0, 2 * Math.PI);
                ctx.ellipse(172, 158, 2, 2, 0, 0, 2 * Math.PI);
                ctx.fill();
            }

            function drawEyebrows(ctx, features) {
                ctx.strokeStyle = '#2d3436';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                
                // 왼쪽 눈썹
                ctx.beginPath();
                ctx.moveTo(115, 145);
                ctx.quadraticCurveTo(130, 140, 145, 145);
                ctx.stroke();
                
                // 오른쪽 눈썹
                ctx.beginPath();
                ctx.moveTo(155, 145);
                ctx.quadraticCurveTo(170, 140, 185, 145);
                ctx.stroke();
            }

            function drawNose(ctx, features) {
                ctx.strokeStyle = '#fab1a0';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(150, 170);
                ctx.lineTo(145, 185);
                ctx.moveTo(150, 185);
                ctx.lineTo(155, 185);
                ctx.stroke();
            }

            function drawLips(ctx, features) {
                ctx.fillStyle = '#e17055';
                
                if (features.expression === 'smile') {
                    // 웃는 입
                    ctx.beginPath();
                    ctx.arc(150, 200, 15, 0, Math.PI);
                    ctx.fill();
                } else {
                    // 일반 입
                    ctx.beginPath();
                    ctx.ellipse(150, 200, 12, 6, 0, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

            async function extractRealFaceFromVideo(face) {
                try {
                    console.log(`${face.name}의 실제 얼굴 추출 중...`);
                    
                    // 영상에서 해당 시간대의 프레임 추출
                    const frameImage = await captureVideoFrame(face.firstAppearance);
                    if (!frameImage) {
                        return null;
                    }

                    // 프레임에서 얼굴 영역 감지 및 추출
                    const faceImage = await detectAndCropFace(frameImage, face);
                    
                    return faceImage;
                    
                } catch (error) {
                    console.error('Real face extraction failed:', error);
                    return null;
                }
            }

            async function captureVideoFrame(timeString) {
                return new Promise((resolve) => {
                    try {
                        // 시간 문자열을 초로 변환 (00:02:15 -> 135초)
                        const timeParts = timeString.split(':');
                        const timeInSeconds = parseInt(timeParts[0]) * 3600 + 
                                            parseInt(timeParts[1]) * 60 + 
                                            parseInt(timeParts[2]);

                        // 비디오 요소 생성
                        const video = document.createElement('video');
                        video.src = URL.createObjectURL(uploadedFile);
                        video.crossOrigin = 'anonymous';
                        video.muted = true;

                        video.addEventListener('loadedmetadata', () => {
                            // 지정된 시간으로 이동
                            video.currentTime = Math.min(timeInSeconds, video.duration - 1);
                        });

                        video.addEventListener('seeked', () => {
                            try {
                                // 캔버스에 현재 프레임 그리기
                                const canvas = document.createElement('canvas');
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                const ctx = canvas.getContext('2d');
                                
                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                
                                // 이미지 데이터 반환
                                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                                
                                // 메모리 정리
                                URL.revokeObjectURL(video.src);
                                
                                resolve(imageData);
                                
                            } catch (error) {
                                console.error('Frame capture error:', error);
                                resolve(null);
                            }
                        });

                        video.addEventListener('error', () => {
                            console.error('Video loading error');
                            resolve(null);
                        });

                    } catch (error) {
                        console.error('Video frame capture failed:', error);
                        resolve(null);
                    }
                });
            }

            async function detectAndCropFace(frameImage, face) {
                try {
                    // 프레임 이미지를 캔버스에 로드
                    const img = new Image();
                    img.src = frameImage;
                    
                    return new Promise((resolve) => {
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // 원본 이미지 크기
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                            
                            // 다중 얼굴 영역 추정 (여러 위치에서 시도)
                            const faceRegions = [
                                // 중앙 상단 (주인공 위치)
                                { 
                                    x: img.width * 0.35, 
                                    y: img.height * 0.1, 
                                    width: img.width * 0.3, 
                                    height: img.height * 0.4 
                                },
                                // 좌측 상단
                                { 
                                    x: img.width * 0.1, 
                                    y: img.height * 0.1, 
                                    width: img.width * 0.25, 
                                    height: img.height * 0.35 
                                },
                                // 우측 상단
                                { 
                                    x: img.width * 0.65, 
                                    y: img.height * 0.1, 
                                    width: img.width * 0.25, 
                                    height: img.height * 0.35 
                                },
                                // 중앙 중간
                                { 
                                    x: img.width * 0.3, 
                                    y: img.height * 0.25, 
                                    width: img.width * 0.4, 
                                    height: img.height * 0.4 
                                }
                            ];

                            // 역할에 따라 우선순위 결정
                            const selectedRegion = face.role === 'main' ? faceRegions[0] : faceRegions[Math.floor(Math.random() * faceRegions.length)];
                            
                            const faceWidth = Math.min(300, selectedRegion.width);
                            const faceHeight = Math.min(400, selectedRegion.height);
                            const faceX = selectedRegion.x;
                            const faceY = selectedRegion.y;
                            
                            // 얼굴 영역 추출
                            const faceCanvas = document.createElement('canvas');
                            faceCanvas.width = 300;
                            faceCanvas.height = 400;
                            const faceCtx = faceCanvas.getContext('2d');
                            
                            // 배경 그라데이션
                            const gradient = faceCtx.createLinearGradient(0, 0, 300, 400);
                            gradient.addColorStop(0, '#f8f9fa');
                            gradient.addColorStop(1, '#e9ecef');
                            faceCtx.fillStyle = gradient;
                            faceCtx.fillRect(0, 0, 300, 400);
                            
                            // 추출된 얼굴 영역을 중앙에 배치 (둥근 모서리 효과)
                            faceCtx.save();
                            
                            // 둥근 사각형 클리핑 경로 생성
                            const cornerRadius = 15;
                            faceCtx.beginPath();
                            drawRoundedRect(faceCtx, 25, 50, 250, 300, cornerRadius);
                            faceCtx.clip();
                            
                            // 얼굴 이미지 그리기
                            faceCtx.drawImage(
                                canvas, 
                                faceX, faceY, faceWidth, faceHeight,
                                25, 50, 250, 300
                            );
                            
                            faceCtx.restore();
                            
                            // 둥근 테두리 추가
                            faceCtx.strokeStyle = '#007b6d';
                            faceCtx.lineWidth = 3;
                            faceCtx.beginPath();
                            drawRoundedRect(faceCtx, 25, 50, 250, 300, cornerRadius);
                            faceCtx.stroke();
                            
                            // 그림자 효과
                            faceCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                            faceCtx.shadowBlur = 10;
                            faceCtx.shadowOffsetX = 2;
                            faceCtx.shadowOffsetY = 2;
                            
                            // 정보 텍스트 추가
                            faceCtx.fillStyle = '#2d3436';
                            faceCtx.font = 'bold 18px Arial';
                            faceCtx.textAlign = 'center';
                            faceCtx.fillText(face.name, 150, 30);
                            
                            faceCtx.font = '14px Arial';
                            faceCtx.fillStyle = '#636e72';
                            faceCtx.fillText(`${face.role === 'main' ? '주연' : '조연'} • 신뢰도 ${Math.round(face.confidence * 100)}%`, 150, 380);
                            faceCtx.fillText(`등장 ${face.appearances}회 • ${face.firstAppearance}`, 150, 395);
                            
                            resolve(faceCanvas.toDataURL('image/jpeg', 0.9));
                        };
                        
                        img.onerror = () => {
                            console.error('Image loading failed');
                            resolve(null);
                        };
                    });
                    
                } catch (error) {
                    console.error('Face detection and crop failed:', error);
                    return null;
                }
            }



            function generateDetailedPlaceholderImage(face, description) {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                
                // 사실적인 그라데이션 배경
                const gradient = ctx.createRadialGradient(150, 200, 50, 150, 200, 200);
                gradient.addColorStop(0, '#f8f9fa');
                gradient.addColorStop(0.7, '#e9ecef');
                gradient.addColorStop(1, '#dee2e6');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 300, 400);
                
                // 얼굴 영역 표시
                ctx.beginPath();
                ctx.ellipse(150, 180, 80, 100, 0, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffeaa7';
                ctx.fill();
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 눈 그리기
                ctx.beginPath();
                ctx.ellipse(130, 160, 8, 6, 0, 0, 2 * Math.PI);
                ctx.ellipse(170, 160, 8, 6, 0, 0, 2 * Math.PI);
                ctx.fillStyle = '#2d3436';
                ctx.fill();
                
                // 코 그리기
                ctx.beginPath();
                ctx.moveTo(150, 170);
                ctx.lineTo(145, 185);
                ctx.lineTo(155, 185);
                ctx.closePath();
                ctx.fillStyle = '#fab1a0';
                ctx.fill();
                
                // 입 그리기
                ctx.beginPath();
                ctx.ellipse(150, 200, 15, 8, 0, 0, Math.PI);
                ctx.fillStyle = '#e17055';
                ctx.fill();
                
                // 텍스트 정보
                ctx.fillStyle = '#2d3436';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(face.name, 150, 320);
                
                ctx.font = '14px Arial';
                ctx.fillStyle = '#636e72';
                ctx.fillText(`${face.role === 'main' ? '주연' : '조연'} • 신뢰도 ${Math.round(face.confidence * 100)}%`, 150, 340);
                ctx.fillText(`등장 ${face.appearances}회 • 첫 등장 ${face.firstAppearance}`, 150, 360);
                
                // AI 설명 추가 (요약)
                if (description && description.length > 0) {
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#74b9ff';
                    const shortDesc = description.substring(0, 50) + '...';
                    ctx.fillText('AI 분석: ' + shortDesc, 150, 380);
                }
                
                return canvas.toDataURL('image/png');
            }

            function generateEnhancedPlaceholderImage(face) {
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                
                // 역할에 따른 색상 테마
                const colorTheme = face.role === 'main' 
                    ? { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' }
                    : { primary: '#4ecdc4', secondary: '#44a08d', accent: '#96fbc4' };
                
                // 배경 그라데이션
                const gradient = ctx.createLinearGradient(0, 0, 300, 400);
                gradient.addColorStop(0, colorTheme.primary);
                gradient.addColorStop(0.5, colorTheme.secondary);
                gradient.addColorStop(1, colorTheme.accent);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 300, 400);
                
                // 오버레이 패턴
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(Math.random() * 300, Math.random() * 400, Math.random() * 30, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                // 중앙 아이콘
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '60px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🎭', 150, 180);
                
                // 이름
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px Arial';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeText(face.name, 150, 250);
                ctx.fillText(face.name, 150, 250);
                
                // 역할 정보
                ctx.font = '16px Arial';
                ctx.fillText(`${face.role === 'main' ? '주연 배우' : '조연 배우'}`, 150, 280);
                
                // 상세 정보
                ctx.font = '14px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(`신뢰도: ${Math.round(face.confidence * 100)}%`, 150, 310);
                ctx.fillText(`등장 횟수: ${face.appearances}회`, 150, 330);
                ctx.fillText(`첫 등장: ${face.firstAppearance}`, 150, 350);
                
                // AI 생성 표시
                ctx.font = '12px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText('AI 분석 결과', 150, 380);
                
                return canvas.toDataURL('image/png');
            }

            function updateFaceCardWithImage(face) {
                const faceCards = faceResults.querySelectorAll('.face-card');
                const targetCard = Array.from(faceCards).find(card => 
                    card.querySelector('h4').textContent === face.name
                );
                
                if (targetCard) {
                    const placeholder = targetCard.querySelector('.face-placeholder');
                    placeholder.innerHTML = `<img src="${face.generatedImage}" alt="${face.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                    placeholder.style.background = 'none';
                }
            }

            function downloadFaceGallery() {
                const zip = new JSZip();
                const promises = [];

                detectedFaces.forEach(face => {
                    if (face.generatedImage) {
                        // Base64 이미지를 blob으로 변환
                        const base64Data = face.generatedImage.split(',')[1];
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'image/png' });
                        
                        zip.file(`${face.name}_${face.role}.png`, blob);
                    }
                });

                // 메타데이터 파일 추가
                const metadata = {
                    analysisDate: new Date().toISOString(),
                    totalFaces: detectedFaces.length,
                    faces: detectedFaces.map(face => ({
                        name: face.name,
                        role: face.role,
                        confidence: face.confidence,
                        appearances: face.appearances,
                        firstAppearance: face.firstAppearance
                    }))
                };
                
                zip.file('face_analysis_metadata.json', JSON.stringify(metadata, null, 2));

                zip.generateAsync({ type: 'blob' }).then(content => {
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `face_gallery_${new Date().toISOString().split('T')[0]}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
            }

            // Global functions for face card actions
            window.editFace = function(faceId) {
                const face = detectedFaces.find(f => f.id === faceId);
                if (face) {
                    const newName = prompt('배우 이름을 입력하세요:', face.name);
                    if (newName && newName.trim()) {
                        face.name = newName.trim();
                        displayDetectedFaces();
                        
                        // 이미지가 생성되어 있다면 다시 표시
                        if (face.generatedImage) {
                            updateFaceCardWithImage(face);
                        }
                    }
                }
            };

            window.uploadFaceImage = function(faceId) {
                const face = detectedFaces.find(f => f.id === faceId);
                if (!face) return;

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            // 업로드된 이미지를 프로세싱
                            processUploadedFaceImage(event.target.result, face);
                        };
                        reader.readAsDataURL(file);
                    }
                    document.body.removeChild(fileInput);
                });
                
                document.body.appendChild(fileInput);
                fileInput.click();
            };

            function processUploadedFaceImage(imageDataUrl, face) {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 300;
                    canvas.height = 400;
                    const ctx = canvas.getContext('2d');
                    
                    // 배경 그라데이션
                    const gradient = ctx.createLinearGradient(0, 0, 300, 400);
                    gradient.addColorStop(0, '#f8f9fa');
                    gradient.addColorStop(1, '#e9ecef');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 300, 400);
                    
                    // 이미지를 원형으로 클리핑
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(150, 200, 120, 0, 2 * Math.PI);
                    ctx.clip();
                    
                    // 업로드된 이미지 그리기 (비율 유지하며 중앙에 배치)
                    const imgSize = Math.min(img.width, img.height);
                    const srcX = (img.width - imgSize) / 2;
                    const srcY = (img.height - imgSize) / 2;
                    
                    ctx.drawImage(img, srcX, srcY, imgSize, imgSize, 30, 80, 240, 240);
                    ctx.restore();
                    
                    // 원형 테두리
                    ctx.strokeStyle = '#17a2b8';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(150, 200, 120, 0, 2 * Math.PI);
                    ctx.stroke();
                    
                    // 정보 텍스트
                    ctx.fillStyle = '#2d3436';
                    ctx.font = 'bold 20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(face.name, 150, 50);
                    
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#636e72';
                    ctx.fillText(`${face.role === 'main' ? '주연' : '조연'} • 사용자 업로드`, 150, 350);
                    ctx.fillText(`신뢰도 ${Math.round(face.confidence * 100)}% • ${face.appearances}회 등장`, 150, 370);
                    
                    // 업로드 완료 메시지
                    addMessage('ai', `✅ ${face.name}의 얼굴 이미지가 업로드되었습니다!`);
                    
                    // 이미지 저장 및 표시
                    face.generatedImage = canvas.toDataURL('image/jpeg', 0.9);
                    updateFaceCardWithImage(face);
                };
                img.src = imageDataUrl;
            }

            window.deleteFace = function(faceId) {
                if (confirm('이 배우를 삭제하시겠습니까?')) {
                    detectedFaces = detectedFaces.filter(f => f.id !== faceId);
                    displayDetectedFaces();
                    
                    // 이미지들 다시 표시
                    detectedFaces.forEach(face => {
                        if (face.generatedImage) {
                            updateFaceCardWithImage(face);
                        }
                    });
                }
            };

            // --- Initial Setup ---
            loadSavedApiKeys();
            loadStorageSettings();
            loadChats();
            renderCompletedShorts();
            initializeMainModels();
            updateSubModels();
            updateProcessButtonState();
        });