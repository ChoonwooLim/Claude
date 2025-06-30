export const aiModels = {
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