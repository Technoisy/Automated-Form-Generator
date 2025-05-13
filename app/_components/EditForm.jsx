'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function FormEdit({ formData, onUpdate }) {
  const [fields, setFields] = useState(formData.fields || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editField, setEditField] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  const handleDelete = async (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    await onUpdate({ ...formData, fields: updated });
    setConfirmDeleteIndex(null);
    toast.success('Field deleted');
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditField({ ...fields[index] });
  };

  const startAddNew = () => {
    setEditingIndex(-1); // Use -1 to indicate new field
    setEditField({
      label: '',
      type: 'text',
      name: '',
      required: false,
      options: []
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async () => {
    let updated;
    if (editingIndex === -1) {
      // Add new field
      updated = [...fields, editField];
    } else {
      // Update existing field
      updated = fields.map((f, i) => (i === editingIndex ? editField : f));
    }
    
    setFields(updated);
    await onUpdate({ ...formData, fields: updated });
    setEditingIndex(null);
    setEditField(null);
    toast.success('Field saved');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Form Fields</h2>
        <button
          onClick={startAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaPlus /> Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No fields yet. Click "Add Field" to get started.
        </div>
      ) : (
        fields.map((field, index) => (
          <div
            key={index}
            className="relative border p-4 rounded bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <label className="block font-semibold mb-1">{field.label}</label>
                <p className="text-sm text-gray-500 mb-1">Type: {field.type}</p>
                {field.required && (
                  <span className="text-xs text-red-500">Required</span>
                )}
                {field.options && field.options.length > 0 && (
                  <ul className="text-sm list-disc pl-5 text-gray-600 mt-2">
                    {field.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-3 text-gray-600">
                <button
                  onClick={() => startEdit(index)}
                  className="hover:text-blue-600 p-1"
                  title="Edit Field"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => setConfirmDeleteIndex(index)}
                  className="hover:text-red-600 p-1"
                  title="Delete Field"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editField !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-bold">
              {editingIndex === -1 ? 'Add New Field' : 'Edit Field'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Label
              </label>
              <input
                name="label"
                value={editField.label}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                placeholder="Label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                name="name"
                value={editField.name}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
                placeholder="Field Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                name="type"
                value={editField.type}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              >
                <option value="text">Text Input</option>
                <option value="textarea">Text Area</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="select">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio Buttons</option>
                <option value="date">Date</option>
                <option value="file">File Upload</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="required"
                checked={editField.required}
                onChange={handleEditChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Required Field</label>
            </div>

            {['select', 'radio', 'checkbox'].includes(editField.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (comma separated)
                </label>
                <textarea
                  name="options"
                  value={editField.options?.join(', ') || ''}
                  onChange={(e) =>
                    setEditField(prev => ({
                      ...prev,
                      options: e.target.value.split(',').map(opt => opt.trim()),
                    }))
                  }
                  className="w-full border p-2 rounded"
                  rows={3}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditField(null);
                  setEditingIndex(null);
                }}
                className="text-sm px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-sm shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">Delete Field</h3>
            <p>Are you sure you want to delete this field?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteIndex)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}