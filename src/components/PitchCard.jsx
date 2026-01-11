import { motion } from "framer-motion";

export default function PitchCard({ pitch, index, onView, onDelete, onPreview }) {
    const data = pitch.generated_data;
    const createdDate = new Date(pitch.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-card)",
                backdropFilter: "var(--glass-backdrop)",
            }}
            className="rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            onClick={onView}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                    <h3
                        style={{ color: "var(--text-primary)" }}
                        className="text-lg sm:text-xl font-primary font-bold mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors line-clamp-2"
                    >
                        {data?.name || "Untitled Pitch"}
                    </h3>
                    <p
                        style={{ color: "var(--text-secondary)" }}
                        className="text-sm sm:text-base font-medium line-clamp-2 leading-relaxed"
                    >
                        {data?.tagline || "No tagline available"}
                    </p>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 shrink-0">
                    <span
                        style={{
                            background: "var(--gradient-accent-subtle)",
                            color: "var(--text-accent)",
                            border: "1px solid var(--border-accent)",
                        }}
                        className="text-xs px-2 py-1 rounded-full font-medium"
                    >
                        🚀 <span className="hidden sm:inline">Active</span>
                    </span>
                </div>
            </div>

            {/* Industry & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <span
                    style={{
                        background: "var(--gradient-primary-subtle)",
                        color: "var(--text-primary-accent)",
                        border: "1px solid var(--border-primary)",
                    }}
                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm w-fit"
                >
                    <span className="mr-1 sm:mr-2">🏢</span>
                    {pitch.industry || "General"}
                </span>
                <span
                    style={{ color: "var(--text-tertiary)" }}
                    className="text-xs sm:text-sm font-medium"
                >
                    {createdDate}
                </span>
            </div>

            {/* Pitch Preview */}
            <div className="mb-4 sm:mb-6">
                <p
                    style={{ color: "var(--text-secondary)" }}
                    className="text-xs sm:text-sm line-clamp-3 leading-relaxed"
                >
                    {data?.elevator_pitch || data?.problem || "No preview available"}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    className="btn-primary flex-1 text-xs sm:text-sm py-2 flex items-center justify-center"
                >
                    <span className="mr-1 sm:mr-2">👁️</span>
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                </motion.button>

                <div className="flex items-center space-x-2 sm:space-x-3">
                    {pitch.landing_code && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview();
                            }}
                            className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 flex-1 sm:flex-none"
                            title="Preview Landing Page"
                        >
                            🌐 <span className="ml-1 sm:hidden">Preview</span>
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            background: "var(--gradient-danger-subtle)",
                            color: "var(--text-danger)",
                            border: "1px solid var(--border-danger)",
                        }}
                        className="p-2 rounded-lg transition-all duration-200 shrink-0 hover:shadow-md"
                        title="Delete Pitch"
                    >
                        🗑️
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
