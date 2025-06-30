import * as DOM from './dom-elements.js';

const aiModels = {
    claude: { name: "Claude", subModels: ["Claude 3.5 Sonnet", "Claude 3 Opus"], apiKey: "", apiKeyUrl: "https://console.anthropic.com/settings/keys" },
    gpt: { name: "OpenAI GPT", subModels: ["GPT-4o", "GPT-4 Turbo"], apiKey: "", apiKeyUrl: "https://platform.openai.com/api-keys" },
    gemini: { name: "Google Gemini", subModels: ["Gemini 1.5 Pro", "Gemini 1.5 Flash"], apiKey: "", apiKeyUrl: "https://aistudio.google.com/app/api-keys" },
    groq: { name: "Groq", subModels: ["Llama 3.1 70B", "Llama 3.1 8B"], apiKey: "", apiKeyUrl: "https://console.groq.com/keys" },
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


export function initializeApiManagement() {
    loadSavedApiKeys();
    initializeMainModels();
    updateSubModels();
    setupApiModalEventListeners();
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
        "Claude 3.5 Sonnet": "claude-3-5-sonnet-20240620",
        "Claude 3 Opus": "claude-3-opus-20240229",
        "Claude 3 Sonnet": "claude-3-sonnet-20240229", 
        "Claude 3 Haiku": "claude-3-haiku-20240307"
    };

    const requestBody = {
        model: modelMap[subModel] || "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: message }]
    };

    // CORS 우회를 위한 프록시 서버 사용
    try {
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
            throw new Error(`Claude API 오류 (${response.status}): ${errorText}`);
        }

        const claudeResponse = await response.json();

        if (claudeResponse.error) {
            throw new Error(`Claude API 오류: ${claudeResponse.error.message || claudeResponse.error.type || '알 수 없는 오류'}`);
        }

        if (claudeResponse.content && claudeResponse.content[0] && claudeResponse.content[0].text) {
            return claudeResponse.content[0].text;
        } else {
            throw new Error('Claude API 응답 형식이 올바르지 않습니다.');
        }

    } catch (error) {
        if (error.message.includes('CORS') || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error(`🚫 Claude API 연결 문제가 발생했습니다.\n\n💡 해결 방법:\n1. 🤖 다른 AI 모델 사용 (GPT, Gemini 등)\n2. 🔧 브라우저에 "CORS Unblock" 확장 프로그램 설치`);
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
        "GPT-3.5 Turbo": "gpt-3.5-turbo"
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
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
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
        "Gemini 1.5 Pro": "gemini-1.5-pro-latest",
        "Gemini 1.5 Flash": "gemini-1.5-flash-latest",
    };
    
    const modelName = modelMap[subModel] || "gemini-1.5-flash-latest";
    const url = `${modelData.endpoint}/${modelName}:generateContent?key=${modelData.apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${systemPrompt}\n\n사용자 질문: ${message}` }]
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
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
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
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
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
            chat_history: [
                { role: "SYSTEM", message: systemPrompt }
            ],
            message: message,
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

export async function sendToAI(message, systemPrompt, modelData, selectedModelKey, selectedSubModel) {
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