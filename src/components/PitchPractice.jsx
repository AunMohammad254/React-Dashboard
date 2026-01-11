import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeminiAPIManager } from "../utils/geminiApi";
import { generatePitchFeedback } from "../utils/prompts";

export default function PitchPractice({ pitch, onExit }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const recognitionRef = useRef(null);
    const apiManager = useRef(new GeminiAPIManager());

    // Guard clause for missing data
    const data = pitch?.generated_data;

    if (!data) {
        return (
            <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto w-full p-4 items-center justify-center">
                <div className="text-center p-8 card-glass border-red-500/30">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Data Unavailable</h2>
                    <p className="text-neutral-300 mb-6">This pitch is missing the required data for analysis.</p>
                    <button
                        onClick={onExit}
                        className="px-6 py-3 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 font-bold transition-all"
                    >
                        Return to My Pitches
                    </button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        // Load history
        try {
            const saved = localStorage.getItem(`pitch_history_${pitch.id}`);
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, [pitch.id]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTrans = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTrans += event.results[i][0].transcript + " ";
                    }
                }
                if (finalTrans) {
                    setTranscript((prev) => prev + finalTrans);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    setError("Microphone access denied. Please enable permission.");
                }
            };
        } else {
            setError("Speech recognition not supported in this browser. Try Chrome.");
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            setTranscript("");
            setAnalysis(null);
            setError("");
            recognitionRef.current?.start();
        }
        setIsRecording(!isRecording);
    };

    const analyzePitch = async () => {
        if (!transcript.trim()) return;
        setLoading(true);

        try {
            const prompt = generatePitchFeedback(data, transcript);
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            const text = await apiManager.current.makeRequest(
                { contents: [{ parts: [{ text: prompt }] }] },
                apiKey,
                "auto",
                0,
                setQueueStatus
            );

            if (text) {
                // Manually parse JSON here
                let jsonString = text;

                // Attempt to clean markdown
                if (jsonString.includes('```json')) {
                    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
                } else if (jsonString.includes('```')) {
                    jsonString = jsonString.replace(/```/g, '');
                }

                jsonString = jsonString.trim();

                // Regex fallback: find the first { and last }
                const firstOpen = jsonString.indexOf('{');
                const lastClose = jsonString.lastIndexOf('}');

                if (firstOpen !== -1 && lastClose !== -1) {
                    jsonString = jsonString.substring(firstOpen, lastClose + 1);
                }

                const data = JSON.parse(jsonString);
                setAnalysis(data);

                // Save to history
                const newAttempt = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    score: data.score,
                    pacing: data.pacing,
                    feedback_summary: data.positive_feedback
                };

                const updatedHistory = [newAttempt, ...history];
                setHistory(updatedHistory);
                localStorage.setItem(`pitch_history_${pitch.id}`, JSON.stringify(updatedHistory));
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Failed to analyze pitch. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto w-full p-4 sm:p-6 card-glass">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-primary font-bold text-white mb-2">Pitch Practice Dojo</h2>
                    <p className="text-neutral-300">Record your elevator pitch and get AI feedback.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors font-medium text-sm border border-neutral-700 flex items-center space-x-2"
                    >
                        <span>📜</span>
                        <span>History</span>
                    </button>
                    <button
                        onClick={onExit}
                        className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-red-900/50 transition-colors font-medium text-sm border border-neutral-700"
                    >
                        Exit Dojo
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {/* Left: Original Pitch & Recording */}
                <div className="space-y-6">
                    <div className="card-glass p-6 bg-white/5">
                        <h3 className="text-lg font-bold text-white mb-3">Original Scripts</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-1">Tagline</span>
                                <p className="text-white font-medium italic">"{data.tagline || "No tagline"}"</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-1">Elevator Pitch</span>
                                <p className="text-neutral-200 leading-relaxed text-sm bg-black/20 p-4 rounded-xl border border-white/10">
                                    {data.elevator_pitch || "No elevator pitch available."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recording Controls */}
                    <div className="card-glass p-6 bg-white/5 text-center">
                        <div className="mb-6 relative h-32 flex items-center justify-center">
                            <motion.button
                                onClick={toggleRecording}
                                animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all ${isRecording
                                    ? "bg-red-500 shadow-red-500/50"
                                    : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/30"
                                    }`}
                            >
                                {isRecording ? "⏹" : "🎤"}
                            </motion.button>
                            {isRecording && (
                                <div className="absolute -bottom-4 text-red-400 font-mono text-sm animate-pulse">
                                    Recording...
                                </div>
                            )}
                        </div>

                        <p className="text-neutral-400 text-sm mb-4">
                            {isRecording
                                ? "Speak clearly. Click stop when finished."
                                : "Click microphone to start recording."}
                        </p>

                        {transcript && !isRecording && !analysis && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={analyzePitch}
                                disabled={loading}
                                className="btn-primary w-full py-3 text-lg font-bold flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>{queueStatus || "Analyzing..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        <span>Analyze My Performance</span>
                                    </>
                                )}
                            </motion.button>
                        )}

                        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                    </div>

                    {/* Transcript Display */}
                    {(transcript || isRecording) && (
                        <div className="card-glass p-6 bg-white/5">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Your Transcript</h3>
                            <p className="text-white leading-relaxed font-mono text-sm min-h-[100px]">
                                {transcript || <span className="text-neutral-600 italic">Listening...</span>}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Analysis Results */}
                <AnimatePresence>
                    {analysis ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Score Card */}
                            <div className="card-glass p-8 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 text-center border-indigo-500/30">
                                <span className="block text-neutral-300 text-sm font-bold uppercase tracking-wider mb-2">Overall Score</span>
                                <div className="text-6xl font-black text-white mb-2 font-primary">{analysis.score}</div>
                                <div className="flex justify-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-xl ${i < Math.round(analysis.score / 20) ? "text-yellow-400" : "text-neutral-600"}`}>★</span>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Feedback */}
                            <div className="card-glass p-6 bg-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <span className="bg-primary-500/20 p-2 rounded-lg mr-3 text-xl">📊</span>
                                    Detailed Feedback
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                        <span className="text-neutral-400">Pacing</span>
                                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${analysis.pacing === 'Good' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                            {analysis.pacing}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-neutral-400 block mb-1">Clarity</span>
                                        <p className="text-white text-sm">{analysis.clarity}</p>
                                    </div>

                                    <div>
                                        <span className="text-neutral-400 block mb-1">Positive Highlights</span>
                                        <p className="text-green-300 text-sm italic border-l-2 border-green-500 pl-3">"{analysis.positive_feedback}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Improvements */}
                            <div className="card-glass p-6 bg-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <span className="bg-orange-500/20 p-2 rounded-lg mr-3 text-xl">🚀</span>
                                    Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {(analysis.improvements || []).map((item, i) => (
                                        <li key={i} className="flex items-start text-sm text-neutral-300">
                                            <span className="text-orange-500 mr-2">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Missing Points */}
                            {analysis.missing_points && analysis.missing_points.length > 0 && (
                                <div className="card-glass p-6 bg-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                        <span className="bg-red-500/20 p-2 rounded-lg mr-3 text-xl">⚠️</span>
                                        Missing Key Points
                                    </h3>
                                    <ul className="space-y-2">
                                        {(analysis.missing_points || []).map((item, i) => (
                                            <li key={i} className="flex items-start text-sm text-neutral-300">
                                                <span className="text-red-500 mr-2">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-neutral-500 text-center p-8 border-2 border-dashed border-neutral-700/50 rounded-2xl">
                            <div>
                                <span className="text-4xl mb-4 block opacity-50">🎙️</span>
                                <p>Record your pitch to see AI analysis here.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHistory(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <span className="mr-2">📜</span> Practice History
                                </h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="text-neutral-400 hover:text-white transition-colors text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 custom-scrollbar">
                                {history.length === 0 ? (
                                    <div className="text-center text-neutral-500 py-12">
                                        No practice history yet. Start recording!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {history.map((attempt, index) => {
                                            const prevAttempt = history[index + 1];
                                            const scoreDiff = prevAttempt ? attempt.score - prevAttempt.score : 0;

                                            return (
                                                <div key={attempt.id} className="card-glass p-5 bg-white/5 flex flex-col hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-xs text-neutral-400 font-mono">
                                                            {new Date(attempt.date).toLocaleDateString()} • {new Date(attempt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <span className={`font-black text-2xl ${attempt.score >= 80 ? 'text-green-400' : attempt.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                {attempt.score}
                                                            </span>
                                                            {index < history.length - 1 && (
                                                                <span className={`ml-2 text-sm font-bold ${scoreDiff > 0 ? 'text-green-400' : scoreDiff < 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                                                                    {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-neutral-300 mb-3">
                                                        <span className={`px-2 py-1 rounded-md bg-black/30 border border-white/10`}>Pacing: {attempt.pacing}</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300 italic border-l-2 border-primary-500 pl-3 py-1">"{attempt.feedback_summary}"</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
