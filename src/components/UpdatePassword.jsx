import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import LogoIcon from "../assets/logo-icon.svg";

export default function UpdatePassword({ onFullfill }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }
        setLoading(true);
        setMessage("");

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
            setMessage("Password updated successfully!");
            setTimeout(() => {
                onFullfill(); // Navigate back to main app or generate view
            }, 1500);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 relative overflow-hidden"
            role="main"
            style={{
                background: 'transparent' // Background handled by App.jsx Aurora
            }}
        >
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <div className="mx-auto mb-3 sm:mb-4 lg:mb-6 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 relative">
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 sm:p-3 lg:p-4 border border-white/20">
                            <img src={LogoIcon} alt="PitchCraft AI" className="w-full h-full filter drop-shadow-lg" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-primary font-bold mb-2 sm:mb-3">
                        <span className="bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Set New Password
                        </span>
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg lg:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        Secure your account with a new password
                    </p>
                </div>

                {/* Card */}
                <section
                    className="relative backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border shadow-2xl"
                    style={{
                        background: 'var(--dark-glass-bg)',
                        borderColor: 'var(--dark-border-primary)',
                        boxShadow: 'var(--dark-shadow-xl)'
                    }}
                >
                    <div className="relative z-10">
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: 'var(--dark-text-secondary)' }}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 sm:px-5 sm:py-4 lg:py-5 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ease-out pr-12 text-base sm:text-lg"
                                        placeholder="Enter new password"
                                        style={{
                                            background: 'var(--dark-input-bg)',
                                            borderColor: 'var(--dark-border-secondary)',
                                            color: 'var(--dark-text-primary)'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 focus:outline-none"
                                        style={{ color: 'var(--dark-text-muted)' }}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: 'var(--dark-text-secondary)' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 sm:px-5 sm:py-4 lg:py-5 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ease-out text-base sm:text-lg"
                                    placeholder="Confirm new password"
                                    style={{
                                        background: 'var(--dark-input-bg)',
                                        borderColor: 'var(--dark-border-secondary)',
                                        color: 'var(--dark-text-primary)'
                                    }}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 sm:py-5 lg:py-6 px-6 font-semibold text-base sm:text-lg lg:text-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 relative overflow-hidden group"
                                style={{
                                    background: 'var(--dark-button-primary-bg)',
                                    borderColor: 'var(--dark-border-primary)',
                                    color: 'var(--dark-text-primary)',
                                    border: '1px solid var(--dark-border-primary)'
                                }}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? "Updating..." : "Update Password"}
                                </span>
                            </button>
                        </form>

                        {/* Message */}
                        {message && (
                            <div className={`mt-6 p-4 rounded-xl text-center font-medium border ${message.includes("success")
                                    ? "bg-green-500/10 border-green-500/30 text-green-200"
                                    : "bg-red-500/10 border-red-500/30 text-red-200"
                                }`}>
                                {message}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
