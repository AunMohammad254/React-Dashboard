import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeminiAPIManager } from "../utils/geminiApi";
import { generateInvestorPrompt } from "../utils/prompts";

export default function InvestorChat({ pitch, onExit }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [queueStatus, setQueueStatus] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const apiManager = useRef(new GeminiAPIManager());

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Shark Greeting
    useEffect(() => {
        const startSimulation = async () => {
            setLoading(true);
            try {
                const prompt = generateInvestorPrompt(pitch.generated_data);
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

                const response = await apiManager.current.makeRequest(
                    { contents: [{ parts: [{ text: prompt }] }] },
                    apiKey,
                    "gemini-1.5-flash",
                    0,
                    setQueueStatus
                );

                if (response && response.candidates && response.candidates[0].content) {
                    const sharkMessage = response.candidates[0].content.parts[0].text;
                    setMessages([
                        {
                            id: 1,
                            sender: "shark",
                            text: sharkMessage,
                            timestamp: new Date()
                        }
                    ]);
                    setIsConnected(true);
                }
            } catch (error) {
                console.error("Failed to start simulation:", error);
                setMessages([{
                    id: 0,
                    sender: "system",
                    text: "⚠️ Connection to the Tank lost. Please try again.",
                    timestamp: new Date()
                }]);
            } finally {
                setLoading(false);
            }
        };

        startSimulation();
    }, [pitch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || loading) return;

        const userMsg = {
            id: Date.now(),
            sender: "user",
            text: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setLoading(true);

        try {
            // Construct conversation history for context
            // Note: In a real app, we'd pass the full chat history to the model properly.
            // Here we'll append the last few messages to maintain some context in a simple way
            // or if the API supports chat history objects (Gemini does), we should structure it.
            // For now, let's keep it simple with a running prompt or just the last response context.

            const chatHistory = messages.map(m =>
                `${m.sender === "shark" ? "Shark" : "Founder"}: ${m.text}`
            ).join("\n");

            const nextPrompt = `
      CONTEXT:
      ${chatHistory}
      
      Founder just said: "${userMsg.text}"

      Respond as the skeptical Shark named Marcus. Keep it short, tough, and ask another question.
      `;

            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const responseText = await apiManager.current.makeRequest(
                { contents: [{ parts: [{ text: nextPrompt }] }] },
                apiKey,
                "auto",
                0,
                setQueueStatus
            );

            if (responseText) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: "shark",
                    text: responseText,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Error getting response:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 mb-4 card-glass gap-4"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse shrink-0">
                        <span className="text-2xl">🦈</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white font-primary">The Tank</h2>
                        <p className="text-red-300 text-sm font-medium">Live simulation with Investor Marcus</p>
                    </div>
                </div>
                <button
                    onClick={onExit}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors font-medium text-sm border border-neutral-700"
                >
                    Exit Simulation
                </button>
            </motion.div>

            {/* Chat Area */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto mb-4 p-4 space-y-4 pr-2 custom-scrollbar"
            >
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl shadow-lg relative ${msg.sender === "user"
                                ? "bg-primary-600 text-white rounded-br-none bg-gradient-to-r from-primary-600 to-indigo-600"
                                : "bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700"
                                }`}
                        >
                            {msg.sender === "shark" && (
                                <div className="text-xs font-bold text-red-400 mb-1 mb-2">MARCUS</div>
                            )}
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <div className={`text-[10px] mt-2 opacity-60 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-800/50 p-4 rounded-2xl rounded-bl-none flex space-x-2 items-center">
                            {queueStatus ? (
                                <span className="text-sm text-neutral-400 font-mono animate-pulse">{queueStatus}</span>
                            ) : (
                                <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></span>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </motion.div>

            {/* Input Area */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="card-glass p-4"
            >
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 bg-black/40 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-neutral-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || loading}
                        className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        Send ↵
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
