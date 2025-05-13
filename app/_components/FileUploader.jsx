'use client';

import { useState } from 'react';
import { FaFileUpload } from 'react-icons/fa'; // only file icon

export default function FileUploader({ field, onFileSelect }) {
  const [fileName, setFileName] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = field.maxSizeMB || 2;
    const allowedTypes = Array.isArray(field.accept)
      ? field.accept
      : typeof field.accept === 'string'
      ? [field.accept]
      : [];

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`❌ File exceeds ${maxSizeMB}MB`);
      return;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setError(`❌ Invalid type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    setFileName(file.name);
    setError('');
    onFileSelect(file);

    if (file.type.startsWith('image/')) {
      setPreviewURL(URL.createObjectURL(file));
    } else {
      setPreviewURL('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full">
        <FaFileUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="file"
          name={field.name}
          accept={
            Array.isArray(field.accept)
              ? field.accept.join(',')
              : typeof field.accept === 'string'
              ? field.accept
              : ''
          }
          onChange={handleFileChange}
          className="w-full border p-2 pl-10 rounded bg-white"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {fileName && <p className="text-sm text-gray-700">✅ Selected: {fileName}</p>}
      {previewURL && (
        <img src={previewURL} alt="Preview" className="mt-2 max-w-xs border rounded" />
      )}
    </div>
  );
}
