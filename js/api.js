import * as DOM from './dom-elements.js';

const aiModels = {
    claude: { 
        name: "Claude", 
        subModels: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"], 
        apiKey: "", 
        apiKeyUrl: "https://console.anthropic.com/settings/keys",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    gpt: { 
        name: "OpenAI GPT", 
        subModels: ["GPT-4o", "GPT-4o mini", "GPT-4 Turbo", "GPT-4"], 
        apiKey: "", 
        apiKeyUrl: "https://platform.openai.com/api-keys",
        endpoint: "https://api.openai.com/v1/chat/completions"
    },
    gemini: { 
        name: "Google Gemini", 
        subModels: ["Gemini 2.5 Pro", "Gemini 1.5 Pro", "Gemini 1.5 Flash"], 
        apiKey: "", 
        apiKeyUrl: "https://aistudio.google.com/app/api-keys",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models"
    },
    groq: { 
        name: "Groq", 
        subModels: ["Llama 3.3 70B", "Llama 3.1 8B", "Gemma2 9B"], 
        apiKey: "", 
        apiKeyUrl: "https://console.groq.com/keys",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
    },
};

let currentEditingModel = null;

function initializeMainModels() {
    DOM.mainModelSelect.innerHTML = '';
    for (const key in aiModels) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = aiModels[key].name;
        DOM.mainModelSelect.appendChild(option);
    }
}

function updateSubModels() {
    const selectedModelKey = DOM.mainModelSelect.value;
    DOM.subModelSelect.innerHTML = '';
    aiModels[selectedModelKey].subModels.forEach(modelName => {
        const option = document.createElement('option');
        option.value = modelName;
        option.textContent = modelName;
        DOM.subModelSelect.appendChild(option);
    });
}

function closeApiKeyModal() {
    DOM.apiKeyModal.style.display = 'none';
}

function loadSavedApiKeys() {
    for (const modelKey in aiModels) {
        const savedKey = localStorage.getItem(`apiKey_${modelKey}`);
        if (savedKey) aiModels[modelKey].apiKey = savedKey;
    }
}

function setupApiModalEventListeners() {
    DOM.mainModelSelect.addEventListener('change', updateSubModels);
    
    DOM.apiSettingsBtn.addEventListener('click', () => {
        const selectedModelKey = DOM.mainModelSelect.value;
        currentEditingModel = selectedModelKey;
        DOM.apiKeyModalTitle.textContent = `${aiModels[selectedModelKey].name} API 키 설정`;
        DOM.apiKeyInput.value = aiModels[selectedModelKey].apiKey || '';
        DOM.apiKeyLink.href = aiModels[selectedModelKey].apiKeyUrl;
        DOM.apiKeyModal.style.display = 'block';
    });

    DOM.saveApiKeyBtn.addEventListener('click', () => {
        if (currentEditingModel) {
            aiModels[currentEditingModel].apiKey = DOM.apiKeyInput.value;
            localStorage.setItem(`apiKey_${currentEditingModel}`, DOM.apiKeyInput.value);
            alert(`${aiModels[currentEditingModel].name} API 키가 저장되었습니다.`);
            closeApiKeyModal();
        }
    });

    DOM.cancelApiKeyBtn.addEventListener('click', closeApiKeyModal);
    DOM.closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);
}

// --- API Call Functions ---

async function callClaudeAPI(message, systemPrompt, modelData, subModel) {
    if (!modelData.apiKey) throw new Error("API 키가 설정되지 않았습니다.");
    const modelMap = {
        "Claude 3.5 Sonnet": "claude-3-5-sonnet-20240620",
        "Claude 3 Opus": "claude-3-opus-20240229",
        "Claude 3 Haiku": "claude-3-haiku-20240307"
    };
    const response = await fetch(modelData.endpoint, {
        method: 'POST',
        headers: {
            'x-api-key': modelData.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: modelMap[subModel] || "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }]
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({error:{message: response.statusText}}));
        throw new Error(err.error.message);
    }
    const result = await response.json();
    return result.content[0].text;
}

async function callGenericOpenAIAPI(message, systemPrompt, modelData, subModel, modelMap) {
    if (!modelData.apiKey) throw new Error("API 키가 설정되지 않았습니다.");
    const response = await fetch(modelData.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${modelData.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelMap[subModel],
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({error:{message: response.statusText}}));
        throw new Error(err.error.message);
    }
    const result = await response.json();
    return result.choices[0].message.content;
}

async function callOpenAIAPI(message, systemPrompt, modelData, subModel) {
    const modelMap = {
        "GPT-4o": "gpt-4o",
        "GPT-4o mini": "gpt-4o-mini",
        "GPT-4 Turbo": "gpt-4-turbo",
        "GPT-4": "gpt-4",
    };
    return callGenericOpenAIAPI(message, systemPrompt, modelData, subModel, modelMap);
}

async function callGroqAPI(message, systemPrompt, modelData, subModel) {
    const modelMap = {
        "Llama 3.3 70B": "llama-3.3-70b-versatile",
        "Llama 3.1 8B": "llama-3.1-8b-instant",
        "Gemma2 9B": "gemma2-9b-it",
    };
    return callGenericOpenAIAPI(message, systemPrompt, modelData, subModel, modelMap);
}


async function callGeminiAPI(message, systemPrompt, modelData, subModel) {
    if (!modelData.apiKey) throw new Error("API 키가 설정되지 않았습니다.");
    const modelMap = {
        "Gemini 2.5 Pro": "gemini-2.5-pro",
        "Gemini 1.5 Pro": "gemini-1.5-pro-latest",
        "Gemini 1.5 Flash": "gemini-1.5-flash-latest",
    };
    const modelName = modelMap[subModel] || "gemini-1.5-flash-latest";
    const url = `${modelData.endpoint}/${modelName}:generateContent?key=${modelData.apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({error:{message: response.statusText}}));
        throw new Error(err.error.message);
    }
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}


export async function callAI(systemPrompt, userMessage) {
    const modelKey = DOM.mainModelSelect.value;
    const subModel = DOM.subModelSelect.value;
    const modelData = aiModels[modelKey];

    try {
        switch (modelKey) {
            case 'claude':
                return await callClaudeAPI(userMessage, systemPrompt, modelData, subModel);
            case 'gpt':
                return await callOpenAIAPI(userMessage, systemPrompt, modelData, subModel);
            case 'gemini':
                return await callGeminiAPI(userMessage, systemPrompt, modelData, subModel);
            case 'groq':
                return await callGroqAPI(userMessage, systemPrompt, modelData, subModel);
            default:
                throw new Error("선택된 AI 모델을 호출하는 기능이 아직 구현되지 않았습니다.");
        }
    } catch (error) {
        console.error(`${modelData.name} API 호출 오류:`, error);
        return `❌ ${modelData.name} API 호출 중 오류가 발생했습니다: ${error.message}`;
    }
}


export function initializeApiManagement() {
    loadSavedApiKeys();
    initializeMainModels();
    updateSubModels();
    setupApiModalEventListeners();
}