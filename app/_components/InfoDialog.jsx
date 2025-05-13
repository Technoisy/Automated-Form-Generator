'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function InfoDialog({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          About AI Form Generator
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our AI Form Generator helps you create customizable web forms instantly.
          Just describe what kind of form you want, and our AI will generate it in seconds.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          📌 Tips for Writing Effective Prompts
        </h3>
        <ul className="text-gray-600 dark:text-gray-300 list-disc pl-6 space-y-1 mb-4">
          <li>Mention each field you want in the form clearly</li>
          <li>Specify field types like <code>text</code>, <code>email</code>, <code>textarea</code>, etc.</li>
          <li>State if a field is required</li>
          <li>Describe optional fields if needed</li>
        </ul>

        <div className="mb-4 text-gray-700 dark:text-gray-200">
          <strong>Example Prompt:</strong><br />
          <code>
            Create a registration form with full name (text), email (email), phone (number), and feedback (textarea).
          </code>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
