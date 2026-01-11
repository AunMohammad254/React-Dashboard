import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
        <div className="border-b border-(--border-secondary) p-4 flex flex-col sm:flex-row items-center justify-between bg-(--bg-secondary) gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-2xl">🌐</span>
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg">Landing Page Generator</h3>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
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
          <div className="rounded-xl overflow-hidden border border-[var(--border-secondary)] shadow-inner">
            <SyntaxHighlighter
              language="html"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: '#1a1b26',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                maxHeight: '500px',
                overflowY: 'auto'
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default CodePreview;
