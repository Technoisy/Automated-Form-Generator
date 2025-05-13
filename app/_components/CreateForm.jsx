'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function FormEdit({ formData, onUpdate }) {
  const [fields, setFields] = useState(formData.fields || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editField, setEditField] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  // Add new field
  const handleAddField = () => {
    setEditField({
      label: '',
      type: 'text',
      name: '',
      required: false,
      options: [],
      accept: '', // For file fields
      maxSizeMB: 5 // Default max file size
    });
    setEditingIndex(-1);
  };

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

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async () => {
    // Validate field name (no spaces)
    if (editField.name && /\s/.test(editField.name)) {
      toast.error('Field name cannot contain spaces');
      return;
    }

    let updated;
    if (editingIndex === -1) {
      updated = [...fields, { 
        ...editField, 
        id: Date.now().toString(),
        // Clear options if not needed
        options: ['select', 'radio', 'checkbox'].includes(editField.type) 
          ? editField.options || [] 
          : undefined
      }];
    } else {
      updated = fields.map((f, i) => 
        i === editingIndex ? { 
          ...editField,
          // Clear options if not needed
          options: ['select', 'radio', 'checkbox'].includes(editField.type) 
            ? editField.options || [] 
            : undefined
        } : f
      );
    }
    
    setFields(updated);
    await onUpdate({ ...formData, fields: updated });
    setEditingIndex(null);
    setEditField(null);
    toast.success('Field saved');
  };

  const moveField = async (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === fields.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFields(updated);
    await onUpdate({ ...formData, fields: updated });
    toast.success(`Field moved ${direction}`);
  };

  const renderFieldPreview = (field) => {
    return (
      <div className="flex justify-between items-start">
        <div>
          <label className="block font-semibold mb-1">{field.label}</label>
          <p className="text-sm text-gray-500 mb-1">
            Type: {field.type} {field.required && '(Required)'}
          </p>
          {field.options && (
            <ul className="text-sm list-disc pl-5 text-gray-600">
              {field.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          )}
          {field.type === 'file' && (
            <div className="text-sm text-gray-600 mt-1">
              <p>Accepts: {field.accept || 'Any file type'}</p>
              <p>Max size: {field.maxSizeMB || 5}MB</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {/* ... existing move/edit/delete buttons ... */}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ... existing header and add field button ... */}

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No fields yet. Click "Add Field" to get started.
        </div>
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id || index}
            className="relative border p-4 rounded bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {renderFieldPreview(field)}
          </div>
        ))
      )}

      {/* Edit/Add Field Modal */}
      {editField !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-bold">
              {editingIndex === -1 ? 'Add New Field' : 'Edit Field'}
            </h2>

            <div className="space-y-4">
              {/* ... existing label and name fields ... */}

              <div>
                <label className="block text-sm font-medium mb-1">Field Type</label>
                <select
                  name="type"
                  value={editField.type}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                  <option value="file">File Upload</option>
                </select>
              </div>

              {/* File-specific settings */}
              {editField.type === 'file' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Accepted File Types (comma separated)
                    </label>
                    <input
                      name="accept"
                      value={editField.accept || ''}
                      onChange={handleEditChange}
                      placeholder="e.g., image/*,.pdf,.docx"
                      className="w-full border p-2 rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank for any file type
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maximum File Size (MB)
                    </label>
                    <input
                      type="number"
                      name="maxSizeMB"
                      value={editField.maxSizeMB || 5}
                      onChange={handleEditChange}
                      min="0.1"
                      step="0.1"
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </>
              )}

              {/* ... existing required field checkbox ... */}

              {['select', 'radio', 'checkbox'].includes(editField.type) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options</label>
                  <textarea
                    name="options"
                    value={editField.options?.join(', ') || ''}
                    onChange={(e) =>
                      setEditField(prev => ({
                        ...prev,
                        options: e.target.value.split(',').map(opt => opt.trim()),
                      }))
                    }
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full border p-2 rounded"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                </div>
              )}
            </div>

            {/* ... existing modal buttons ... */}
          </div>
        </div>
      )}

      {/* ... existing delete confirmation dialog ... */}
    </div>
  );
}