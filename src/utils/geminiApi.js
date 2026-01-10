import { checkNetworkStatus, logNetworkDiagnostics } from "./networkUtils";

export const MODELS = {
  "auto": { id: "auto", name: "✨ Auto (Smart Select)" },
  "gemini-3-flash": { id: "gemini-3-flash", name: "⚡ Gemini 3.0 Flash (Best)" },
  "gemini-2.5-flash": { id: "gemini-2.5-flash", name: "🚀 Gemini 2.5 Flash" },
  "gemini-2.5-flash-lite": { id: "gemini-2.5-flash-lite", name: "💨 Gemini 2.5 Flash Lite" },
  "gemma-3-27b": { id: "gemma-3-27b", name: "🧠 Gemma 3 27B" },
  "gemma-3-12b": { id: "gemma-3-12b", name: "🤖 Gemma 3 12B" },
};

export class GeminiAPIManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 5;
    this.rateLimits = {
      "gemini-3-flash": { rpm: 1, window: 60000 },
      "gemini-2.5-flash": { rpm: 5, window: 60000 },
      "default": { rpm: 2, window: 60000 }
    };
  }

  // Get locally stored usage timestamp to enforce "1 user 1 minute" rule for high-end models
  canMakeLocalRequest(modelId) {
    if (modelId === 'auto') return true;

    const lastUsageKey = `pitchcraft_last_usage_${modelId}`;
    const lastUsage = localStorage.getItem(lastUsageKey);
    const now = Date.now();

    // Specific rule: 1 user 1 min for gemini-3-flash
    if (modelId === 'gemini-3-flash') {
      if (lastUsage && (now - parseInt(lastUsage)) < 60000) {
        const remaining = Math.ceil((60000 - (now - parseInt(lastUsage))) / 1000);
        throw new Error(`Wait ${remaining}s before reusing ${MODELS[modelId].name}. Rate limit: 1/min.`);
      }
    }
    return true;
  }

  recordUsage(modelId) {
    if (modelId !== 'auto') {
      localStorage.setItem(`pitchcraft_last_usage_${modelId}`, Date.now().toString());
    }
  }

  // Validate API key format and availability
  validateApiKey(apiKey) {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please check your .env file and ensure VITE_GEMINI_API_KEY is set.");
    }

    // Handle undefined environment variable (shows as string "undefined")
    if (apiKey === 'undefined' || apiKey === '${import.meta.env.VITE_GEMINI_API_KEY}') {
      throw new Error("Environment variable VITE_GEMINI_API_KEY is not set. Please create a .env file with your Gemini API key.");
    }

    // Basic format validation for Google API keys
    if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
      throw new Error("Invalid Gemini API key format. Google API keys should start with 'AIza' and be at least 35 characters long.");
    }

    // Check for common placeholder values
    const placeholders = ['your_gemini_api_key_here', 'AIzaSyAcFSJm_B0GVn0VpQDijlQxMpLzfPeiqq8'];
    if (placeholders.includes(apiKey)) {
      throw new Error("Please replace the placeholder API key with your actual Gemini API key.");
    }

    return true;
  }

  // Check API quota and availability
  async checkApiQuota(apiKey) {
    try {
      console.log('🔍 Checking API quota and availability...');

      // Make a minimal test request to check quota
      const testRequest = {
        contents: [{ parts: [{ text: "Test" }] }],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testRequest),
        }
      );

      if (response.status === 403) {
        throw new Error("API key is invalid or has insufficient permissions. Please verify your Gemini API key and ensure it has the necessary permissions.");
      } else if (response.status === 429) {
        throw new Error("API quota exceeded. Please wait a few minutes before trying again or consider upgrading your API plan.");
      }

      console.log('✅ API quota check passed');
      return true;
    } catch (error) {
      console.error('❌ API quota check failed:', error);
      throw error;
    }
  }

  // Main Entry Point for Request
  async makeRequest(requestBody, apiKey, modelId = 'auto', retryCount = 0, onQueueUpdate = null) {
    this.validateApiKey(apiKey);
    this.canMakeLocalRequest(modelId);

    if (!checkNetworkStatus()) {
      logNetworkDiagnostics();
      throw new Error("No internet connection.");
    }

    // Resolve Model ID
    let targetModel = modelId;
    if (modelId === 'auto') {
      targetModel = 'gemini-2.5-flash';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    return this._executeRequestWithRetry(url, requestBody, targetModel, retryCount, onQueueUpdate);
  }

  async _executeRequestWithRetry(url, requestBody, modelId, retryCount, onQueueUpdate) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    try {
      console.log(`🚀 Sending request to ${modelId} (Attempt ${retryCount + 1})`);

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`⏳ Rate limit hit for ${modelId}. Entering waiting list...`);

          if (retryCount >= this.maxRetries) {
            throw new Error("All slots are currently full. Please try a different model or wait a few minutes.");
          }

          const waitTime = Math.min(2000 * Math.pow(2, retryCount), 15000);

          if (onQueueUpdate) {
            onQueueUpdate(`High traffic. Waiting for open slot... (Queue #${this.maxRetries - retryCount})`);
          }

          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this._executeRequestWithRetry(url, requestBody, modelId, retryCount + 1, onQueueUpdate);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || response.statusText);
      }

      this.recordUsage(modelId);
      const data = await response.json();
      return this.validateAndParseResponse(data);

    } catch (error) {
      console.error(`❌ Request failed:`, error);
      throw error;
    }
  }

  // Validate and parse API response
  validateAndParseResponse(data) {
    // Check for API error in response
    if (data.error) {
      console.error('🚨 API returned error:', data.error);
      throw new Error(`Gemini API Error: ${data.error.message || 'Unknown error'}`);
    }

    // Validate response structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('🚨 Invalid response structure:', data);
      throw new Error("Invalid response from Gemini API. No candidates found.");
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
      console.error('🚨 Invalid candidate structure:', candidate);
      throw new Error("Invalid response structure from Gemini API.");
    }

    const text = candidate.content.parts[0]?.text;
    if (!text || typeof text !== 'string') {
      console.error('🚨 No text content in response:', candidate);
      throw new Error("No text content received from Gemini API.");
    }

    console.log('📝 Extracted text content:', text.substring(0, 200) + '...');
    return text;
  }

  // Calculate exponential backoff delay
  calculateBackoffDelay(retryCount) {
    return Math.min(this.baseDelay * Math.pow(2, retryCount) + Math.random() * 1000, 30000);
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // JSON parsing - simpler version since we expect application/json response
  extractAndParseJSON(text) {
    console.log('🔍 Attempting to parse JSON from response...');
    
    // Clean up if the model still returns markdown code blocks despite config
    let jsonString = text;
    if (jsonString.includes('```json')) {
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
    } else if (jsonString.includes('```')) {
        jsonString = jsonString.replace(/```/g, '');
    }
    jsonString = jsonString.trim();

    try {
      const parsed = JSON.parse(jsonString);
      console.log('✅ Successfully parsed JSON');
      return this.validateParsedData(parsed);
    } catch (error) {
      console.error('❌ JSON parsing failed:', error);
      throw new Error(`Failed to parse AI response as JSON: ${error.message}.`);
    }
  }

  // Validate parsed data structure
  validateParsedData(data) {
    console.log('🔍 Validating parsed data structure...');

    // Ensure required fields exist with fallbacks
    const validated = {
      name: data.name || "Untitled Startup",
      tagline: data.tagline || "Transforming ideas into reality",
      elevator_pitch: data.elevator_pitch || data.description || "An innovative startup solution.",
      problem: data.problem || "A significant market problem that needs solving.",
      solution: data.solution || "An innovative solution to address the problem.",
      target_audience: {
        description: data.target_audience?.description || "General consumers and businesses",
        segments: Array.isArray(data.target_audience?.segments)
          ? data.target_audience.segments
          : ["Early adopters", "Tech-savvy users", "Business professionals"]
      },
      unique_value_proposition: data.unique_value_proposition || data.uvp || "Unique value in the market",
      landing_copy: {
        headline: data.landing_copy?.headline || data.name || "Welcome to the Future",
        subheadline: data.landing_copy?.subheadline || data.tagline || "Innovation at your fingertips",
        call_to_action: data.landing_copy?.call_to_action || "Get Started Today"
      },
      industry: data.industry || "Technology",
      colors: {
        primary: data.colors?.primary || "#3B82F6",
        secondary: data.colors?.secondary || "#8B5CF6",
        accent: data.colors?.accent || "#06B6D4",
        neutral: data.colors?.neutral || "#6B7280"
      },
      logo_ideas: Array.isArray(data.logo_ideas)
        ? data.logo_ideas
        : ["Modern minimalist design", "Tech-inspired icon", "Professional wordmark"]
    };

    console.log('✅ Data validation complete');
    return validated;
  }
}
