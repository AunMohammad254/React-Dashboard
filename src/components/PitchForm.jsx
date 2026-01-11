import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { LinkButton } from "./Button";
import GalaxyButton from "./GalaxyButton";
import LogoIcon from "../assets/logo.svg";
import { GeminiAPIManager } from "../utils/geminiApi";
import CustomModelSelector from "./ModelSelector";
import PitchDetails from "./PitchDetails";
import CodePreview from "./CodePreview";
import { generatePitchPrompt, generateWebsitePrompt } from "../utils/prompts";

export default function PitchForm({ user, onNavigate }) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [queueStatus, setQueueStatus] = useState(null);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLandingCode(null);
    setPreviewUrl("");
    setShowPreview(false);
    setQueueStatus(null);

    try {
      console.log('🚀 Starting pitch generation process...');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // Validate API key before proceeding
      apiManager.validateApiKey(apiKey);

      // Check API quota and availability
      await apiManager.checkApiQuota(apiKey);

      // Step 1: Get Pitch Data
      console.log('📊 Step 1: Generating pitch data...');

      const pitchPrompt = generatePitchPrompt(prompt);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: pitchPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const responseText = await apiManager.makeRequest(requestBody, apiKey, selectedModel, 0, setQueueStatus);
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

      const websitePrompt = generateWebsitePrompt(pitchData);

      const requestBody = {
        contents: [{ parts: [{ text: websitePrompt }] }],
      };

      const responseText = await apiManager.makeRequest(requestBody, apiKey, selectedModel, 0, setQueueStatus);
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

  return (
    <div className="relative text-(--text-primary) font-sans selection:bg-(--accent-primary) selection:text-white overflow-x-hidden">
      <div className="relative z-10 w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 sm:mb-12 animate-fade-in-down">
          <div className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <div className="absolute inset-0 bg-(--gradient-primary) rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
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
            <LinkButton onClick={() => onNavigate('history')} className="hidden sm:flex text-sm font-medium hover:text-(--accent-primary) transition-colors">
              <span className="mr-2">📂</span> History
            </LinkButton>
            <div className="h-8 w-px bg-(--border-primary) hidden sm:block"></div>
            <div className="flex items-center space-x-3 bg-(--bg-secondary) px-3 py-1.5 rounded-full border border-(--border-secondary)">
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block pr-1" style={{ color: 'var(--text-secondary)' }}>{user.email.split('@')[0]}</span>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        {!result && (
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-2 sm:space-x-4 bg-(--bg-secondary) px-4 py-2 rounded-full border border-(--border-secondary)">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${!loading ? 'bg-(--accent-primary) text-white' : 'text-(--text-tertiary)'}`}>
                <span>✏️</span>
                <span className="text-sm font-medium hidden sm:inline">Describe Idea</span>
              </div>
              <div className="w-6 h-0.5 bg-(--border-secondary)" />
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${loading ? 'bg-(--accent-primary) text-white' : 'text-(--text-tertiary)'}`}>
                <span>⚡</span>
                <span className="text-sm font-medium hidden sm:inline">Generate</span>
              </div>
              <div className="w-6 h-0.5 bg-(--border-secondary)" />
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-(--text-tertiary)">
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
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
          <div className="bg-(--bg-primary) rounded-[1.2rem] sm:rounded-[1.4rem] p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <CustomModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />

              {/* Form Label */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💡</span>
                <label className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Describe Your Startup Vision
                </label>
              </div>

              {/* Textarea */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    maxLength={5000}
                    placeholder="I want to build an AI-powered fitness app that creates personalized workout plans with real-time form correction using computer vision, targeting busy professionals..."
                    className="w-full h-32 sm:h-36 bg-(--bg-secondary) text-(--text-primary) border border-(--border-primary) rounded-xl px-4 py-4 sm:px-5 sm:py-4 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-(--text-disabled)"
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
                  ) : queueStatus ? (
                    <motion.div
                      key="queue"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center space-x-2 text-yellow-500 font-medium"
                    >
                      <span className="animate-pulse">⏳</span>
                      <span>{queueStatus}</span>
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
                <div className="bg-(--bg-secondary) p-1.5 rounded-xl border border-(--border-secondary) inline-flex shadow-lg relative z-10">
                  <button
                    onClick={() => setActiveTab("pitch")}
                    className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "pitch"
                      ? "bg-(--bg-elevated) text-(--text-primary) shadow-md transform scale-105"
                      : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-tertiary)"
                      }`}
                  >
                    <span>📊</span>
                    <span>Pitch Deck</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("website")}
                    className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "website"
                      ? "bg-(--bg-elevated) text-(--text-primary) shadow-md transform scale-105"
                      : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-tertiary)"
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
                  <PitchDetails
                    data={result}
                    onUpdate={setResult}
                  />
                ) : (
                  <CodePreview code={landingCode} onOpenPreview={openPreview} onShowNotification={showNotification} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
              className="w-full h-[90vh] max-w-7xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in relative z-101"
            >
              <div
                style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-secondary)' }}
                className="p-4 flex justify-between items-center"
              >
                <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg flex items-center">
                  <span className="mr-2">📱</span> Live Preview
                </h3>
                <button
                  onClick={closePreview}
                  className="p-2 rounded-full transition-colors hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
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
