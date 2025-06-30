export const domElements = {
    // General
    themeToggle: document.getElementById('theme-toggle'),
    loadNewVideoButton: document.getElementById('loadNewVideoButton'),
    
    // Upload
    uploadContainer: document.getElementById('uploadContainer'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),

    // Video Preview
    videoPreviewSection: document.getElementById('videoPreviewSection'),
    originalVideoContainer: document.getElementById('originalVideoContainer'),
    videoEditorContainer: document.getElementById('videoEditorContainer'),
    videoPreview: document.getElementById('videoPreview'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    rewindBtn: document.getElementById('rewindBtn'),
    
    // Controls
    processBtn: document.getElementById('processBtn'),
    platformCards: document.querySelectorAll('.platform-card'),
    
    // Options
    faceAnalysisCheckbox: document.getElementById('faceAnalysis'),
    shortsLength: document.getElementById('shortsLength'),
    shortsCount: document.getElementById('shortsCount'),
    
    // Storage
    selectFolderBtn: document.getElementById('selectFolderBtn'),
    outputFolder: document.getElementById('outputFolder'),
    autoSave: document.getElementById('autoSave'),
    fileNaming: document.getElementById('fileNaming'),
    customName: document.getElementById('customName'),
    customNameContainer: document.getElementById('customNameContainer'),
    
    // Progress & Status
    progressSection: document.getElementById('progressSection'),
    progressFill: document.getElementById('progressFill'),
    statusText: document.getElementById('statusText'),

    // Results
    resultsContainer: document.getElementById('resultsContainer'),
    completedShortsGrid: document.getElementById('completedShortsGrid'),
    shortsTrack: document.getElementById('shortsTrack'),
    prevShortBtn: document.getElementById('prevShortBtn'),
    nextShortBtn: document.getElementById('nextShortBtn'),
    shortsCounter: document.getElementById('shorts-counter'),

    // Chat
    chatHistory: document.getElementById('chatHistory'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    newChatBtn: document.getElementById('newChatBtn'),

    // Chat List
    chatList: document.getElementById('chatList'),
    selectAllChats: document.getElementById('selectAllChats'),
    saveChatsBtn: document.getElementById('saveChatsBtn'),
    loadChatsBtn: document.getElementById('loadChatsBtn'),
    loadChatsInput: document.getElementById('loadChatsInput'),
    deleteChatsBtn: document.getElementById('deleteChatsBtn'),

    // Face Gallery
    faceGalleryContainer: document.getElementById('faceGalleryContainer'),
    analyzeFacesBtn: document.getElementById('analyzeFacesBtn'),
    generateFaceImagesBtn: document.getElementById('generateFaceImagesBtn'),
    downloadFaceGalleryBtn: document.getElementById('downloadFaceGalleryBtn'),
    analysisProgress: document.getElementById('analysisProgress'),
    faceProgressFill: document.getElementById('faceProgressFill'),
    faceProgressText: document.getElementById('faceProgressText'),
    faceResults: document.getElementById('faceResults'),

    // AI Models
    mainModelSelect: document.getElementById('mainModelSelect'),
    subModelSelect: document.getElementById('subModelSelect'),
    apiSettingsBtn: document.getElementById('apiSettingsBtn'),
    
    // API Key Modal
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyModalTitle: document.getElementById('apiKeyModalTitle'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeyLink: document.getElementById('apiKeyLink'),
    saveApiKeyBtn: document.getElementById('saveApiKey'),
    cancelApiKeyBtn: document.getElementById('cancelApiKey'),
    closeApiKeyModalBtn: document.querySelector('#apiKeyModal .close-button'),

    // Upload Modal
    uploadModal: document.getElementById('uploadModal'),
    modalTitle: document.getElementById('modalTitle'),
    uploadForm: document.getElementById('uploadForm'),
    videoTitle: document.getElementById('videoTitle'),
    videoDescription: document.getElementById('videoDescription'),
    videoTags: document.getElementById('videoTags'),
    cancelUpload: document.getElementById('cancelUpload'),
    confirmUpload: document.getElementById('confirmUpload'),
}; 