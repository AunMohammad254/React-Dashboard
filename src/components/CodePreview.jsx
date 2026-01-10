import { motion } from "framer-motion";

const CodePreview = ({ code, onOpenPreview, onShowNotification }) => {
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
        <div className="border-b border-(--border-secondary) p-4 flex items-center justify-between bg-(--bg-secondary)">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌐</span>
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg">Landing Page Generator</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onOpenPreview}
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
                if (onShowNotification) {
                    onShowNotification("Code copied to clipboard!", "success");
                }
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
          <pre className="text-sm p-4 overflow-x-auto font-mono text-gray-300 bg-[#1a1b26] leading-relaxed max-h-125 overflow-y-auto custom-scrollbar">
            {code}
          </pre>
        </div>
      </motion.div>

    </div>
  );
};

export default CodePreview;
