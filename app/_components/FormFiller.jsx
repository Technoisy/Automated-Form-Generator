'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function FormFiller({ formData, onSubmit }) {
  const [formValues, setFormValues] = useState(() => {
    const initialValues = {};
    formData.fields?.forEach(field => {
      initialValues[field.name] = field.type === 'checkbox' && field.options 
        ? [] 
        : field.type === 'file' 
        ? null 
        : '';
    });
    return initialValues;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type if specified
    const fieldConfig = formData.fields.find(f => f.name === fieldName);
    if (fieldConfig.accept && !fieldConfig.accept.split(',').includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${fieldConfig.accept}`);
      return;
    }

    // Validate file size (default 5MB)
    const maxSize = fieldConfig.maxSizeMB || 5;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Max size: ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviews(prev => ({
          ...prev,
          [fieldName]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }

    setFormValues(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheckboxGroupChange = (fieldName, optionValue, isChecked) => {
    setFormValues(prev => {
      const currentValues = prev[fieldName] || [];
      return {
        ...prev,
        [fieldName]: isChecked
          ? [...currentValues, optionValue]
          : currentValues.filter(v => v !== optionValue)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const missingFields = formData.fields
      .filter(field => field.required && (
        field.type === 'file' 
          ? !formValues[field.name]
          : !formValues[field.name] || 
            (Array.isArray(formValues[field.name]) && formValues[field.name].length === 0)
      ))
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare FormData for file uploads
      const formDataToSubmit = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSubmit.append(key, value);
        } else {
          formDataToSubmit.append(key, JSON.stringify(value));
        }
      });
      formDataToSubmit.append('formId', formData.id);

      await onSubmit(formDataToSubmit);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit form');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      required: field.required,
      className: "w-full border p-2 rounded mt-1"
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            value={formValues[field.name] || ''}
            onChange={handleChange}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formValues[field.name] || ''}
            onChange={handleChange}
            rows={4}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <select 
            value={formValues[field.name] || ''} 
            onChange={handleChange}
            {...commonProps}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2 mt-1">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={formValues[field.name] === option}
                  onChange={handleChange}
                  className="mr-2 w-auto"
                  required={field.required && i === 0}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          return (
            <div className="space-y-2 mt-1">
              {field.options?.map((option, i) => (
                <label key={i} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(formValues[field.name] || []).includes(option)}
                    onChange={(e) => handleCheckboxGroupChange(field.name, option, e.target.checked)}
                    className="mr-2 w-auto"
                  />
                  {option}
                </label>
              ))}
            </div>
          );
        }
        return (
          <input
            type="checkbox"
            checked={formValues[field.name] || false}
            onChange={handleChange}
            className="mr-2"
          />
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleFileChange(field.name, e)}
              accept={field.accept}
              className="w-full border p-2 rounded mt-1"
              required={field.required}
            />
            {filePreviews[field.name] && (
              <div className="mt-2">
                <img 
                  src={filePreviews[field.name]} 
                  alt="Preview" 
                  className="max-w-xs max-h-40 object-contain border rounded"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formValues[field.name]?.name}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={formValues[field.name] || ''}
            onChange={handleChange}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{formData.title}</h1>
      {formData.description && (
        <p className="text-gray-600 mb-6">{formData.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {formData.fields?.map((field, index) => (
          <div key={field.id || index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
    </div>
  );
}