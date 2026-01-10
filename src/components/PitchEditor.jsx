import React, { useState, useEffect } from 'react';

const PitchEditor = ({ data, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1a1f2e] border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#1a1f2e] z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Pitch Details</h2>
            <p className="text-sm text-gray-400">Refine your generated pitch content</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Startup Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. PitchCraft"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Catchy one-liner"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Elevator Pitch</label>
            <textarea
              name="elevator_pitch"
              value={formData.elevator_pitch || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">The Problem</label>
            <textarea
              name="problem"
              value={formData.problem || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">The Solution</label>
            <textarea
              name="solution"
              value={formData.solution || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Unique Value Proposition</label>
            <textarea
              name="unique_value_proposition"
              value={formData.unique_value_proposition || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end space-x-4 sticky bottom-0 bg-[#1a1f2e]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center"
          >
            <span className="mr-2">💾</span> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchEditor;
