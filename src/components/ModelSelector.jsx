import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODELS } from "../utils/geminiApi";

const CustomModelSelector = ({ selectedModel, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.custom-model-selector')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selected = MODELS[selectedModel] || MODELS['auto'];

  return (
    <div className="relative mb-8 z-30 custom-model-selector">
      <label className="text-xs font-bold uppercase tracking-wider text-(--accent-primary) mb-2 block pl-1">
        Select Brain Power
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-(--bg-secondary) text-(--text-primary) border transition-all duration-300 rounded-xl px-4 py-3.5 font-medium shadow-sm hover:shadow-md
            ${isOpen ? 'border-(--accent-primary) ring-2 ring-(--accent-primary)/20' : 'border-(--border-secondary) hover:border-(--accent-primary)'}
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{selected.name.split(' ')[0]}</span>
            <span className="text-[15px]">{selected.name.substring(selected.name.indexOf(' ') + 1)}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-(--text-tertiary)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 bg-(--bg-elevated) border border-(--border-primary) rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
            >
              <div className="max-h-75 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                {Object.values(MODELS).map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 group
                        ${isSelected
                          ? 'bg-(--accent-primary) text-white shadow-md'
                          : 'text-(--text-primary) hover:bg-(--bg-tertiary) hover:translate-x-1'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{model.name.split(' ')[0]}</span>
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-(--text-primary)'}`}>
                          {model.name.substring(model.name.indexOf(' ') + 1)}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-white/20 p-1 rounded-full"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomModelSelector;
