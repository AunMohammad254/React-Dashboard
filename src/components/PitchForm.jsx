
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LinkButton, PrimaryButton } from "./Button";
import GalaxyButton from "./GalaxyButton";
import LogoIcon from "../assets/logo.svg";
import { APIRequestHelper, checkNetworkStatus, logNetworkDiagnostics } from "../utils/networkUtils";

// API Rate Limiting and Request Queue Management
class GeminiAPIManager {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
    this.maxRetries = 3;
    this.baseDelay = 1000; // Base delay for exponential backoff

    // Rate limiting: 2 requests per minute
    this.requestTimestamps = [];
    this.maxRequestsPerMinute = 2;
    this.rateLimitWindow = 60000; // 1 minute in milliseconds
  }

  // Check if rate limit is exceeded
  checkRateLimit() {
    const now = Date.now();

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );

    // Check if we've exceeded the rate limit
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requestTimestamps);
      const timeUntilReset = this.rateLimitWindow - (now - oldestRequest);
      throw new Error(
        `Rate limit exceeded. You can only make ${this.maxRequestsPerMinute} requests per minute. ` +
        `Please wait ${Math.ceil(timeUntilReset / 1000)} seconds before trying again.`
      );
    }

    // Add current timestamp
    this.requestTimestamps.push(now);
    return true;
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

  // Enhanced request with retry logic and rate limiting
  async makeRequest(requestBody, apiKey, retryCount = 0) {
    // Check network connectivity first
    if (!checkNetworkStatus()) {
      logNetworkDiagnostics();
      throw new Error("No internet connection. Please check your network and try again.");
    }

    // Log network diagnostics on first attempt
    if (retryCount === 0) {
      logNetworkDiagnostics();
    }

    this.validateApiKey(apiKey);

    // Check rate limiting (only on first attempt, not on retries)
    if (retryCount === 0) {
      this.checkRateLimit();
    }

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PitchCraft/1.0"
      },
      body: JSON.stringify(requestBody),
    };

    try {
      console.log(`0 Making Gemini API request (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
      console.log('📤 Request payload:', JSON.stringify(requestBody, null, 2));

      this.lastRequestTime = Date.now();

      // Log request details for debugging
      APIRequestHelper.logRequestDetails(url, requestOptions);

      const response = await fetch(url, requestOptions);

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      // Log response details for debugging
      APIRequestHelper.logRequestDetails(url, requestOptions, response);

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);

        if (response.status === 429) {
          // Rate limit exceeded - implement exponential backoff
          if (retryCount < this.maxRetries) {
            const delay = this.calculateBackoffDelay(retryCount);
            console.log(`⏳ Rate limited. Retrying in ${delay}ms...`);
            await this.sleep(delay);
            return this.makeRequest(requestBody, apiKey, retryCount + 1);
          } else {
            throw new Error("Rate limit exceeded. Please try again in a few minutes. Consider upgrading your API quota if this persists.");
          }
        } else if (response.status === 403) {
          throw new Error("API key is invalid or doesn't have sufficient permissions. Please check your Gemini API key.");
        } else if (response.status === 400) {
          throw new Error(`Invalid request: ${errorData.error?.message || 'Bad request format'}`);
        } else if (response.status >= 500) {
          // Server error - retry with backoff
          if (retryCount < this.maxRetries) {
            const delay = this.calculateBackoffDelay(retryCount);
            console.log(`🔄 Server error. Retrying in ${delay}ms...`);
            await this.sleep(delay);
            return this.makeRequest(requestBody, apiKey, retryCount + 1);
          } else {
            throw new Error("Gemini API is temporarily unavailable. Please try again later.");
          }
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Raw API Response:', JSON.stringify(data, null, 2));

      return this.validateAndParseResponse(data);

    } catch (error) {
      console.error(`❌ Request failed (attempt ${retryCount + 1}):`, error);

      // Log error details for debugging
      APIRequestHelper.logRequestDetails(url, requestOptions, null, error);

      // Network errors or other non-HTTP errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Log network diagnostics on network errors
        logNetworkDiagnostics();

        if (retryCount < this.maxRetries) {
          const delay = this.calculateBackoffDelay(retryCount);
          console.log(`🌐 Network error. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.makeRequest(requestBody, apiKey, retryCount + 1);
        } else {
          throw new Error("Network connection failed. Please check your internet connection and try again.");
        }
      }

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

  // Enhanced JSON extraction and parsing
  extractAndParseJSON(text) {
    console.log('🔍 Attempting to extract JSON from response...');

    // Try to find JSON object in the text
    const jsonPatterns = [
      /\{[\s\S]*\}/,  // Standard JSON object
      /```json\s*(\{[\s\S]*?\})\s*```/,  // JSON in code blocks
      /```\s*(\{[\s\S]*?\})\s*```/,  // JSON in generic code blocks
    ];

    let jsonText = null;
    for (const pattern of jsonPatterns) {
      const match = text.match(pattern);
      if (match) {
        jsonText = match[1] || match[0];
        console.log('✅ Found JSON pattern:', jsonText.substring(0, 100) + '...');
        break;
      }
    }

    if (!jsonText) {
      console.error('❌ No JSON object found in response:', text);
      throw new Error("Could not find JSON object in AI response. The AI may have returned an unexpected format.");
    }

    // Clean and parse JSON
    try {
      // First attempt: direct parsing
      const parsed = JSON.parse(jsonText);
      console.log('✅ Successfully parsed JSON on first attempt');
      return this.validateParsedData(parsed);
    } catch (firstError) {
      console.log('⚠️ First parse attempt failed, trying cleanup...', firstError.message);

      try {
        // Second attempt: clean up common issues
        const cleaned = jsonText
          .replace(/'\s*:\s*'/g, '": "')  // Replace single quotes around keys/values
          .replace(/([{[,])\s*'([^']+?)'\s*(?=[:,\]}])/g, '$1"$2"')  // Replace single quotes with double quotes
          .replace(/,(\s*[}\]])/g, "$1")  // Remove trailing commas
          .replace(/\n/g, ' ')  // Remove newlines
          .replace(/\t/g, ' ')  // Remove tabs
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .trim();

        const parsed = JSON.parse(cleaned);
        console.log('✅ Successfully parsed JSON after cleanup');
        return this.validateParsedData(parsed);
      } catch (secondError) {
        console.error('❌ JSON parsing failed after cleanup:', secondError.message);
        console.error('🔍 Problematic JSON text:', jsonText);
        throw new Error(`Failed to parse AI response as JSON: ${secondError.message}. Please try again.`);
      }
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

export default function PitchForm({ user, onNavigate }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [landingCode, setLandingCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pitch");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [apiManager] = useState(() => new GeminiAPIManager());

  const generatePreview = useCallback(() => {
    if (!landingCode) return;

    // Create blob from HTML code
    const blob = new Blob([landingCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  }, [landingCode]);

  // Generate preview URL when landing code changes
  useEffect(() => {
    if (landingCode && !previewUrl) {
      generatePreview();
    }
  }, [landingCode, previewUrl, generatePreview]);

  const openPreview = () => {
    if (!previewUrl) {
      generatePreview();
    }
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLandingCode(null);
    setPreviewUrl("");
    setShowPreview(false);

    try {
      console.log('🚀 Starting pitch generation process...');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // Validate API key before proceeding
      apiManager.validateApiKey(apiKey);

      // Check API quota and availability
      await apiManager.checkApiQuota(apiKey);

      // Step 1: Get Pitch Data
      console.log('📊 Step 1: Generating pitch data...');
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `
ACT AS A PROFESSIONAL STARTUP CONSULTANT. Generate a comprehensive startup pitch package from this idea: "${prompt}"

Return ONLY valid JSON with this exact structure:
{
  "name": "Creative startup name",
  "tagline": "Catchy one-liner",
  "elevator_pitch": "2-4 sentence compelling story",
  "problem": "Clear problem statement",
  "solution": "Innovative solution description", 
  "target_audience": {
    "description": "Primary customer description",
    "segments": ["segment 1", "segment 2", "segment 3"]
  },
  "unique_value_proposition": "What makes it unique vs competitors",
  "landing_copy": {
    "headline": "Attention-grabbing headline",
    "subheadline": "Supporting description",
    "call_to_action": "Action-oriented CTA"
  },
  "industry": "Relevant industry",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "neutral": "#hex"
  },
  "logo_ideas": ["creative idea 1", "creative idea 2", "creative idea 3"]
}

IMPORTANT: Return ONLY the JSON object, no other text.`,
              },
            ],
          },
        ],
      };

      const responseText = await apiManager.makeRequest(requestBody, apiKey);
      const parsed = apiManager.extractAndParseJSON(responseText);

      console.log('✅ Pitch data generated successfully');
      setResult(parsed);

      // Step 2: Generate landing page code
      console.log('🌐 Step 2: Generating landing page code...');
      const generatedCode = await generateLandingPageCode(parsed);
      setLandingCode(generatedCode);

      // Step 3: Save to Supabase
      console.log('💾 Step 3: Saving to database...');
      const { error } = await supabase.from("pitches").insert({
        user_id: user.id,
        title: parsed.name,
        short_description: parsed.tagline,
        industry: parsed.industry,
        tone: "auto",
        language: "auto",
        generated_data: parsed,
        landing_code: generatedCode,
      });

      if (error) {
        console.error('❌ Database save error:', error);
        throw new Error(`Failed to save pitch: ${error.message}`);
      }

      console.log('🎉 Pitch generation completed successfully!');
      showNotification("✅ Pitch + Website Code Generated!", "success");

    } catch (err) {
      console.error('❌ Pitch generation failed:', err);
      const errorMessage = err.message || "Something went wrong. Please try again.";
      showNotification(`❌ ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateLandingPageCode(pitchData) {
    try {
      console.log('🌐 Generating landing page code...');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      const websitePrompt = `Create a stunning, modern landing page HTML for: ${pitchData.name
        } - ${pitchData.tagline}

Details:
- Problem: ${pitchData.problem}
- Solution: ${pitchData.solution} 
- UVP: ${pitchData.unique_value_proposition}
- Colors: ${JSON.stringify(pitchData.colors)}
- Audience: ${pitchData.target_audience?.description}

Requirements:
- Use Tailwind CSS CDN
- Modern glass morphism design
- Fully responsive layout
- Smooth animations
- Professional startup aesthetic
- Include: Hero, Features, Testimonials, CTA, Footer
- Add interactive elements
- IMPORTANT: Do NOT use any external images (no Unsplash, no external URLs)
- Use CSS gradients, emoji icons, and solid colors for visual elements
- Use placeholder text for testimonials instead of external images
- Create visual appeal through typography, gradients, and geometric shapes

Return ONLY complete HTML code:`;

      const requestBody = {
        contents: [{ parts: [{ text: websitePrompt }] }],
      };

      const responseText = await apiManager.makeRequest(requestBody, apiKey);
      console.log('✅ Landing page code generated successfully');
      return responseText;

    } catch (error) {
      console.error('⚠️ Landing page generation failed, using fallback:', error);
      showNotification("⚠️ Using fallback template for landing page", "warning");
      return generateFallbackTemplate(pitchData);
    }
  }

  function generateFallbackTemplate(pitchData) {
    const colors = pitchData.colors || {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#06B6D4",
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pitchData.name} - ${pitchData.tagline}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, ${colors.primary
      }20, ${colors.secondary}20); }
        .hero-gradient { background: linear-gradient(135deg, ${colors.primary
      }, ${colors.secondary}); }
    </style>
</head>
<body class="bg-white">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-linear-to-r from-[${colors.primary
      }] to-[${colors.secondary
      }] rounded-lg flex items-center justify-center">
                        <img src={LogoIcon} alt="Pitch Crafter" className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <span class="text-xl font-bold text-gray-900">${pitchData.name
      }</span>
                </div>
                <button class="bg-[${colors.primary
      }] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[${colors.secondary
      }] transition-colors">
                    Get Started
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-gradient text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-5xl font-bold mb-6">${pitchData.landing_copy?.headline || pitchData.name
      }</h1>
            <p class="text-xl opacity-90 mb-8 max-w-3xl mx-auto">${pitchData.landing_copy?.subheadline || pitchData.tagline
      }</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="bg-white text-[${colors.primary
      }] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                    ${pitchData.landing_copy?.call_to_action ||
      "Get Started Free"
      }
                </button>
                <button class="border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
                    Learn More
                </button>
            </div>
        </div>
    </section>

    <!-- Problem Section -->
    <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">The Problem We Solve</h2>
            <p class="text-lg text-gray-600 leading-relaxed">${pitchData.problem
      }</p>
        </div>
    </section>

    <!-- Solution Section -->
    <section class="py-20 gradient-bg">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Innovative Solution</h2>
            <p class="text-lg text-gray-600 leading-relaxed">${pitchData.solution
      }</p>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gray-900 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p class="text-gray-300 mb-8 text-lg">Join the future with ${pitchData.name
      }</p>
            <button class="bg-[${colors.accent
      }] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[${colors.primary
      }] transition-colors">
                Start Your Journey
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 ${pitchData.name}. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;
  }

  function showNotification(message, type) {
    const el = document.createElement("div");

    // Enhanced notification styling with support for warning type
    let statusClass, icon;
    switch (type) {
      case "success":
        statusClass = "status-success";
        icon = "✅";
        break;
      case "warning":
        statusClass = "bg-yellow-100 text-yellow-800 border-yellow-300";
        icon = "⚠️";
        break;
      case "error":
      default:
        statusClass = "status-error";
        icon = "❌";
        break;
    }

    el.className = `fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 font-semibold backdrop-blur-sm border animate-fade-in-right ${statusClass}`;
    el.innerHTML = `
      <div class="flex items-center">
        <span class="mr-3 text-lg">${icon}</span>
        <span>${message}</span>
        <button class="ml-4 text-lg opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    document.body.appendChild(el);

    // Auto-remove after delay (longer for errors and warnings)
    const delay = type === "error" || type === "warning" ? 6000 : 4000;
    setTimeout(() => {
      if (el.parentNode) {
        el.style.opacity = "0";
        el.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (el.parentNode) el.remove();
        }, 300);
      }
    }, delay);
  }

  // ✅ COMPLETE PITCH DETAILS COMPONENT
  const RenderPitchDetails = ({ data }) => {
    if (!data) return null;

    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Startup Header */}
        <motion.div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'var(--glass-backdrop)',
          }}
          className="p-4 sm:p-6 lg:p-8 rounded-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-0">
              <h2
                style={{ background: 'var(--gradient-primary-bold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold mb-2 sm:mb-3"
              >
                {data.name}
              </h2>
              <p
                style={{ color: 'var(--text-primary)' }}
                className="text-lg sm:text-xl font-medium mb-3 sm:mb-4"
              >
                {data.tagline}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                style={{
                  background: 'var(--gradient-success-subtle)',
                  color: 'var(--text-success)',
                  border: '1px solid var(--border-success)',
                }}
                className="px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm"
              >
                🚀 Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }}
              className="p-3 sm:p-4 rounded-lg"
            >
              <h3 style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold mb-1">Industry</h3>
              <p style={{ color: 'var(--text-primary)' }} className="font-medium">{data.industry}</p>
            </div>
            <div
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }}
              className="p-3 sm:p-4 rounded-lg"
            >
              <h3 style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold mb-1">Target Market</h3>
              <p style={{ color: 'var(--text-primary)' }} className="font-medium">{data.target_audience.description}</p>
            </div>
            <div
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }}
              className="p-3 sm:p-4 rounded-lg"
            >
              <h3 style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold mb-1">Business Model</h3>
              <p style={{ color: 'var(--text-primary)' }} className="font-medium">B2B SaaS</p>
            </div>
          </div>

          {/* Elevator Pitch */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderLeft: '4px solid var(--accent-primary)',
            }}
            className="p-4 sm:p-6 rounded-r-lg"
          >
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold mb-2">Elevator Pitch</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="italic leading-relaxed">
              "{data.elevator_pitch}"
            </p>
          </div>
        </motion.div>

        {/* Problem & Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <motion.div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="p-4 sm:p-6 rounded-xl relative overflow-hidden group hover:shadow-lg transition-all"
            whileHover={{ y: -5 }}
          >
            <div
              style={{ background: 'var(--accent-error)' }}
              className="absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity"
            />
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl sm:text-3xl">⚠️</span>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">The Problem</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">
              {data.problem}
            </p>
          </motion.div>

          <motion.div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="p-4 sm:p-6 rounded-xl relative overflow-hidden group hover:shadow-lg transition-all"
            whileHover={{ y: -5 }}
          >
            <div
              style={{ background: 'var(--accent-success)' }}
              className="absolute top-0 right-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity"
            />
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl sm:text-3xl">💡</span>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">The Solution</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">
              {data.solution}
            </p>
          </motion.div>
        </div>

        {/* Unique Value Proposition */}
        <motion.div
          style={{
            background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--border-primary)',
          }}
          className="p-4 sm:p-8 rounded-xl text-center relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          <div
            style={{
              background: 'radial-gradient(circle at center, var(--accent-primary-transparent) 0%, transparent 70%)',
            }}
            className="absolute inset-0 opacity-20"
          />
          <div className="relative z-10">
            <h3 style={{ color: 'var(--accent-primary)' }} className="text-sm font-bold uppercase tracking-widest mb-3">Unique Value Proposition</h3>
            <p style={{ color: 'var(--text-primary)' }} className="text-xl sm:text-2xl font-bold leading-tight">
              {data.unique_value_proposition}
            </p>
          </div>
        </motion.div>

        {/* Brand Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Logo Concepts */}
          <motion.div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
            }}
            className="p-4 sm:p-6 rounded-xl"
          >
            <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🎨</span> Logo Concepts
            </h3>
            <div className="space-y-3">
              {data.logo_ideas.map((idea, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-secondary)',
                  }}
                  className="p-3 rounded-lg flex items-center space-x-3 hover:bg-opacity-80 transition-colors"
                >
                  <span
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border"
                  >
                    {index + 1}
                  </span>
                  <p style={{ color: 'var(--text-primary)' }}>{idea}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Color Palette */}
          <motion.div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
            }}
            className="p-4 sm:p-6 rounded-xl"
          >
            <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🎭</span> Brand Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.colors).map(([name, hex]) => (
                <div key={name} className="space-y-2 group cursor-pointer">
                  <div
                    className="h-16 w-full rounded-lg shadow-md border border-[var(--border-secondary)] transition-transform transform group-hover:scale-105 relative overflow-hidden"
                    style={{ backgroundColor: hex }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm capitalize font-medium">{name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }} className="text-xs font-mono bg-opacity-10 px-2 py-1 rounded">
                      {hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Target Audience */}
        <motion.div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
          className="p-4 sm:p-6 lg:p-8 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl sm:text-3xl">👥</span>
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">Target Audience</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Who are we building for?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">Primary Segment</h4>
              <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed mb-4">
                {data.target_audience.description}
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">Key Segments</h4>
              <div className="flex flex-wrap gap-2">
                {data.target_audience.segments.map((segment, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // ✅ CODE DISPLAY COMPONENT
  const RenderWebsiteCode = ({ code }) => {
    if (!code) return null;

    return (
      <div className="animate-fade-in-up">
        {/* Website Preview Card */}
        <motion.div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-lg)',
          }}
          className="rounded-xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="border-b border-[var(--border-secondary)] p-4 flex items-center justify-between bg-[var(--bg-secondary)]">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌐</span>
              <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg">Landing Page Generator</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={openPreview}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center shadow-lg"
              >
                <span className="mr-2">👁️</span> Live Preview
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  showNotification("Code copied to clipboard!", "success");
                }}
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-secondary)',
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-80 transition-colors flex items-center"
              >
                <span className="mr-2">📋</span> Copy Code
              </button>
            </div>
          </div>

          <div className="p-0 relative">
            <pre className="text-sm p-4 overflow-x-auto font-mono text-gray-300 bg-[#1a1b26] leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
              {code}
            </pre>
          </div>
        </motion.div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-white overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)] rounded-full blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-secondary)] rounded-full blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-[var(--accent-tertiary)] rounded-full blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 sm:mb-12 animate-fade-in-down">
          <div className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
                className="relative w-full h-full rounded-xl flex items-center justify-center shadow-xl"
              >
                <img src={LogoIcon} alt="PitchCraft" className="w-6 h-6 sm:w-8 sm:h-8 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight">
                <span style={{
                  background: 'var(--gradient-primary-bold)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>Pitch</span>
                <span style={{ color: 'var(--text-primary)' }}>Craft</span>
              </h1>
              <span className="text-xs sm:text-sm font-medium tracking-wide" style={{ color: 'var(--text-tertiary)' }}>AI-Powered Startup Builder</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <LinkButton onClick={() => onNavigate('history')} className="hidden sm:flex text-sm font-medium hover:text-[var(--accent-primary)] transition-colors">
              <span className="mr-2">📂</span> History
            </LinkButton>
            <div className="h-8 w-[1px] bg-[var(--border-primary)] hidden sm:block"></div>
            <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-secondary)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block pr-1" style={{ color: 'var(--text-secondary)' }}>{user.email.split('@')[0]}</span>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        {!result && (
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-2 sm:space-x-4 bg-[var(--bg-secondary)] px-4 py-2 rounded-full border border-[var(--border-secondary)]">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${!loading ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-tertiary)]'}`}>
                <span>✏️</span>
                <span className="text-sm font-medium hidden sm:inline">Describe Idea</span>
              </div>
              <div className="w-6 h-[2px] bg-[var(--border-secondary)]" />
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${loading ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-tertiary)]'}`}>
                <span>⚡</span>
                <span className="text-sm font-medium hidden sm:inline">Generate</span>
              </div>
              <div className="w-6 h-[2px] bg-[var(--border-secondary)]" />
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-[var(--text-tertiary)]">
                <span>✅</span>
                <span className="text-sm font-medium hidden sm:inline">Review & Save</span>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {!result && !loading && (
          <div className="text-center mb-10 sm:mb-12">
            {/* Purple Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-3xl sm:text-4xl">✨</span>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-primary mb-4 leading-tight animate-fade-in-up">
              <span style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Craft Your Perfect Pitch</span>
            </h2>

            {/* Subtitle */}
            <p style={{ color: 'var(--text-secondary)' }} className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
              Transform your startup idea into a complete business package with AI-powered pitch generation, branding, and production-ready website code.
            </p>
          </div>
        )}

        {/* Input Form */}
        <motion.div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-2xl)',
          }}
          className={`max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-1 bg-opacity-80 backdrop-blur-xl transition-all duration-500 ${result ? 'mb-8' : 'mb-20'}`}
          animate={{
            scale: loading ? 0.98 : 1,
            opacity: 1
          }}
        >
          <div className="bg-[var(--bg-primary)] rounded-[1.2rem] sm:rounded-[1.4rem] p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form Label */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💡</span>
                <label className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Describe Your Startup Vision
                </label>
              </div>

              {/* Textarea */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    maxLength={5000}
                    placeholder="I want to build an AI-powered fitness app that creates personalized workout plans with real-time form correction using computer vision, targeting busy professionals..."
                    className="w-full h-32 sm:h-36 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-4 sm:px-5 sm:py-4 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-[var(--text-disabled)]"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Character Counter Row */}
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {prompt.length} / 5000 Characters
                </span>
                <span style={{ color: 'var(--text-tertiary)' }} className="flex items-center">
                  <span className="mr-1">💭</span> Be detailed for better results
                </span>
              </div>

              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { icon: '💳', label: 'FinTech App' },
                  { icon: '🤖', label: 'AI Startup' },
                  { icon: '☁️', label: 'SaaS Platform' },
                  { icon: '🛒', label: 'E-commerce' },
                  { icon: '🏥', label: 'HealthTech' },
                  { icon: '📚', label: 'EdTech' },
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setPrompt(prev => prev ? `${prev} ${tag.icon} ${tag.label}` : `I want to build a ${tag.label.toLowerCase()} that...`)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <GalaxyButton
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`${!loading && prompt.trim() ? 'generate-btn-pulse' : ''}`}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-center space-x-3"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>AI is crafting your startup...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-center space-x-3"
                    >
                      <span className="text-xl">✨</span>
                      <span>Generate Complete Startup Package</span>
                      <span className="text-xl">🚀</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GalaxyButton>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 pb-20"
            >
              {/* Tabs */}
              <div className="flex justify-center mb-8">
                <div className="bg-[var(--bg-secondary)] p-1.5 rounded-xl border border-[var(--border-secondary)] inline-flex shadow-lg relative z-10">
                  <button
                    onClick={() => setActiveTab("pitch")}
                    className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "pitch"
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md transform scale-105"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                  >
                    <span>📊</span>
                    <span>Pitch Deck</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("website")}
                    className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "website"
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md transform scale-105"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                  >
                    <span>🌐</span>
                    <span>Landing Page</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "pitch" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === "pitch" ? (
                  <RenderPitchDetails data={result} />
                ) : (
                  <RenderWebsiteCode code={landingCode} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full h-[90vh] max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in relative z-[101]">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📱</span> Live Preview
                </h3>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 bg-gray-100 relative">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Website Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .font-primary {
          font-family: 'Outfit', sans-serif;
        }
        /* Pulse animation for the button */
        @keyframes pulse-custom {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        }
        .generate-btn-pulse {
          animation: pulse-custom 2s infinite;
        }
      `}</style>
    </div>
  );
}
