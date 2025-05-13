'use client';

import { useState } from 'react';

export default function PromptDialog({ onSubmit, onClose }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Generate a Form</h2>
        <textarea
          className="w-full p-3 border rounded mb-4"
          rows="4"
          placeholder="Describe the form you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Generate</button>
        </div>
      </div>
    </div>
  );
}
