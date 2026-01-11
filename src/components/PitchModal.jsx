import { motion } from "framer-motion";

export default function PitchModal({ pitch, onClose, onDelete, onPreview }) {
    const d = pitch.generated_data;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 z-50 overflow-y-auto mt-15"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-primary)",
                    boxShadow: "var(--shadow-modal)",
                    backdropFilter: "var(--glass-backdrop)",
                }}
                className="rounded-xl w-full max-w-6xl max-h-[80vh] sm:max-h-[92vh] lg:max-h-[95vh] overflow-hidden flex flex-col my-4 sm:my-6 lg:my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{
                        background: "var(--gradient-primary-bold)",
                        color: "var(--text-on-primary)",
                    }}
                    className="p-4 sm:p-6 lg:p-8 bg-clip-padding backdrop-filter backdrop-blur-sm mt-10 rounded-t-xl"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold mb-2 sm:mb-3 line-clamp-2">
                                {d?.name || "Untitled Pitch"}
                            </h2>
                            <p className="text-primary-100 text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-6 italic line-clamp-2">
                                {d?.tagline || "No tagline available"}
                            </p>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <span className="bg-white/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm backdrop-blur-sm font-medium border border-white/30">
                                    🏢 {pitch.industry || "General"}
                                </span>
                                <span className="bg-white/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm backdrop-blur-sm font-medium border border-white/30">
                                    📅 {new Date(pitch.created_at).toLocaleDateString()}
                                </span>
                                {d?.target_audience?.segments && (
                                    <span className="bg-white/20 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm backdrop-blur-sm font-medium border border-white/30">
                                        🎯 {d.target_audience.segments.length} segments
                                    </span>
                                )}
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors text-lg sm:text-xl lg:text-2xl border border-white/30 shrink-0"
                        >
                            ✕
                        </motion.button>
                    </div>
                </div>

                {/* Modal Content */}
                <div
                    style={{ background: "var(--bg-secondary)" }}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10"
                >
                    {/* Elevator Pitch */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3
                            style={{ color: "var(--text-primary)" }}
                            className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                        >
                            <span
                                style={{ background: "var(--gradient-primary-bold)" }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                            >
                                🎯
                            </span>
                            <span>Elevator Pitch</span>
                        </h3>
                        <div
                            style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-primary)",
                                boxShadow: "var(--shadow-card)",
                                backdropFilter: "var(--glass-backdrop)",
                            }}
                            className="p-8 rounded-xl"
                        >
                            <p
                                style={{ color: "var(--text-primary)" }}
                                className="text-lg leading-relaxed font-medium"
                            >
                                {d?.elevator_pitch || "No elevator pitch available"}
                            </p>
                        </div>
                    </motion.section>

                    {/* Problem & Solution */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3
                                style={{ color: "var(--text-primary)" }}
                                className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                            >
                                <span
                                    style={{ background: "var(--gradient-danger-bold)" }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                >
                                    🧩
                                </span>
                                <span>Problem</span>
                            </h3>
                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-danger)",
                                    boxShadow: "var(--shadow-card)",
                                    backdropFilter: "var(--glass-backdrop)",
                                }}
                                className="rounded-xl p-8"
                            >
                                <p
                                    style={{ color: "var(--text-primary)" }}
                                    className="leading-relaxed font-medium"
                                >
                                    {d?.problem || "No problem description available"}
                                </p>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3
                                style={{ color: "var(--text-primary)" }}
                                className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                            >
                                <span
                                    style={{ background: "var(--gradient-success-bold)" }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                >
                                    💡
                                </span>
                                <span>Solution</span>
                            </h3>
                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-success)",
                                    boxShadow: "var(--shadow-card)",
                                    backdropFilter: "var(--glass-backdrop)",
                                }}
                                className="rounded-xl p-8"
                            >
                                <p
                                    style={{ color: "var(--text-primary)" }}
                                    className="leading-relaxed font-medium"
                                >
                                    {d?.solution || "No solution description available"}
                                </p>
                            </div>
                        </motion.section>
                    </div>

                    {/* Unique Value Proposition */}
                    {d?.unique_value_proposition && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3
                                style={{ color: "var(--text-primary)" }}
                                className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                            >
                                <span
                                    style={{ background: "var(--gradient-warning-bold)" }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                >
                                    💎
                                </span>
                                <span>Value Proposition</span>
                            </h3>
                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-warning)",
                                    boxShadow: "var(--shadow-card)",
                                    backdropFilter: "var(--glass-backdrop)",
                                }}
                                className="rounded-xl p-8"
                            >
                                <p
                                    style={{ color: "var(--text-primary)" }}
                                    className="text-xl font-bold leading-relaxed"
                                >
                                    {d.unique_value_proposition}
                                </p>
                            </div>
                        </motion.section>
                    )}

                    {/* Target Audience */}
                    {d?.target_audience && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3
                                style={{ color: "var(--text-primary)" }}
                                className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                            >
                                <span
                                    style={{ background: "var(--gradient-accent-bold)" }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                >
                                    🎯
                                </span>
                                <span>Target Market</span>
                            </h3>
                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-accent)",
                                    boxShadow: "var(--shadow-card)",
                                    backdropFilter: "var(--glass-backdrop)",
                                }}
                                className="rounded-xl p-8"
                            >
                                <p
                                    style={{ color: "var(--text-primary)" }}
                                    className="mb-6 text-lg font-medium leading-relaxed"
                                >
                                    {d.target_audience.description}
                                </p>
                                {Array.isArray(d.target_audience.segments) && (
                                    <div className="flex flex-wrap gap-3">
                                        {d.target_audience.segments.map((seg, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.6 + i * 0.1 }}
                                                style={{
                                                    background: "var(--gradient-accent-subtle)",
                                                    color: "var(--text-accent)",
                                                    border: "1px solid var(--border-accent)",
                                                }}
                                                className="px-4 py-2 font-medium rounded-full"
                                            >
                                                {seg}
                                            </motion.span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* Branding Section */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Colors */}
                        {d?.colors && (
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3
                                    style={{ color: "var(--text-primary)" }}
                                    className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                                >
                                    <span
                                        style={{ background: "var(--gradient-error-bold)" }}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                    >
                                        🎨
                                    </span>
                                    <span>Color Palette</span>
                                </h3>
                                <div
                                    style={{
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--border-error)",
                                        boxShadow: "var(--shadow-card)",
                                        backdropFilter: "var(--glass-backdrop)",
                                    }}
                                    className="p-8 rounded-xl"
                                >
                                    <div className="grid grid-cols-2 gap-6">
                                        {Object.entries(d.colors).map(([name, color], i) => (
                                            <motion.div
                                                key={name}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.7 + i * 0.1 }}
                                                className="text-center"
                                            >
                                                <div
                                                    className="w-24 h-24 rounded-2xl shadow-xl mx-auto mb-3 hover:scale-110 transition-transform"
                                                    style={{
                                                        backgroundColor: color,
                                                        border: "4px solid var(--bg-primary)",
                                                    }}
                                                />
                                                <p
                                                    style={{ color: "var(--text-primary)" }}
                                                    className="text-sm font-primary font-bold capitalize mb-1"
                                                >
                                                    {name}
                                                </p>
                                                <p
                                                    style={{
                                                        color: "var(--text-secondary)",
                                                        background: "var(--bg-secondary)"
                                                    }}
                                                    className="text-xs font-mono px-2 py-1 rounded"
                                                >
                                                    {color}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Logo Ideas */}
                        {d?.logo_ideas && (
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <h3
                                    style={{ color: "var(--text-primary)" }}
                                    className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                                >
                                    <span
                                        style={{ background: "var(--gradient-info-bold)" }}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                    >
                                        🚀
                                    </span>
                                    <span>Logo Concepts</span>
                                </h3>
                                <div
                                    style={{
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--border-info)",
                                        boxShadow: "var(--shadow-card)",
                                        backdropFilter: "var(--glass-backdrop)",
                                    }}
                                    className="p-8 rounded-xl"
                                >
                                    <ul className="space-y-4">
                                        {d.logo_ideas.map((idea, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 + i * 0.1 }}
                                                style={{
                                                    background: "var(--gradient-info-subtle)",
                                                    border: "1px solid var(--border-info)",
                                                }}
                                                className="flex items-center space-x-4 p-4 rounded-xl hover:shadow-md transition-shadow"
                                            >
                                                <span
                                                    style={{ background: "var(--gradient-info-bold)" }}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                                                >
                                                    ✦
                                                </span>
                                                <span
                                                    style={{ color: "var(--text-primary)" }}
                                                    className="font-medium"
                                                >
                                                    {idea}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Landing Copy */}
                    {d?.landing_copy && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <h3
                                style={{ color: "var(--text-primary)" }}
                                className="text-3xl font-primary font-bold mb-6 flex items-center space-x-4"
                            >
                                <span
                                    style={{ background: "var(--gradient-secondary-bold)" }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                                >
                                    🌐
                                </span>
                                <span>Landing Page Copy</span>
                            </h3>
                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-secondary)",
                                    boxShadow: "var(--shadow-card)",
                                    backdropFilter: "var(--glass-backdrop)",
                                }}
                                className="rounded-xl p-8 space-y-6"
                            >
                                <div>
                                    <p
                                        style={{ color: "var(--text-secondary)" }}
                                        className="text-sm font-primary font-bold mb-3 flex items-center"
                                    >
                                        <span className="mr-2">📢</span>
                                        Headline
                                    </p>
                                    <p
                                        style={{ color: "var(--text-primary)" }}
                                        className="text-2xl font-primary font-bold leading-tight"
                                    >
                                        {d.landing_copy.headline}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        style={{ color: "var(--text-secondary)" }}
                                        className="text-sm font-primary font-bold mb-3 flex items-center"
                                    >
                                        <span className="mr-2">📝</span>
                                        Subheadline
                                    </p>
                                    <p
                                        style={{ color: "var(--text-primary)" }}
                                        className="text-lg font-medium leading-relaxed"
                                    >
                                        {d.landing_copy.subheadline}
                                    </p>
                                </div>
                                <div>
                                    <p
                                        style={{ color: "var(--text-secondary)" }}
                                        className="text-sm font-primary font-bold mb-3 flex items-center"
                                    >
                                        <span className="mr-2">🎯</span>
                                        Call to Action
                                    </p>
                                    <p
                                        style={{
                                            color: "var(--text-primary)",
                                            background: "var(--gradient-primary-subtle)",
                                            border: "1px solid var(--border-primary)"
                                        }}
                                        className="text-xl font-bold px-4 py-2 rounded-lg inline-block"
                                    >
                                        {d.landing_copy.call_to_action}
                                    </p>
                                </div>
                            </div>
                        </motion.section>
                    )}
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        background: "var(--bg-elevated)",
                        borderTop: "1px solid var(--border-primary)",
                    }}
                    className="p-1.5"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex space-x-1">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onPreview}
                                className="btn-primary px-6 py-4 text-lg font-primary font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-green-500 to-emerald-600 flex items-center space-x-2"
                            >
                                <span>🌐</span>
                                <span>Preview Landing Page</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (pitch.landing_code) {
                                        navigator.clipboard.writeText(pitch.landing_code);
                                        const el = document.createElement("div");
                                        el.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50";
                                        el.innerText = "✅ Code copied to clipboard!";
                                        document.body.appendChild(el);
                                        setTimeout(() => el.remove(), 3000);
                                    }
                                }}
                                className="btn-secondary px-6 py-3 text-lg font-primary font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-blue-500 to-purple-600 text-white border-0 flex items-center space-x-1"
                            >
                                <span>📋</span>
                                <span>Copy Code</span>
                            </motion.button>
                        </div>

                        <div className="flex space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onDelete}
                                className="px-6 py-3 ml-2 text-lg font-primary font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-red-500 to-pink-600 text-white border-0 flex items-center space-x-1"
                            >
                                <span>🗑️</span>
                                <span>Delete Pitch</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-6 py-4 text-lg font-primary font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-neutral-500 to-neutral-600 text-white border-0"
                            >
                                Close
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
