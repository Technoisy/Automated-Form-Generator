'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Hero from './_components/Hero';
import PromptDialog from './_components/PromptDialog';
import FormFiller from './_components/FormFiller';
import InfoDialog from './_components/InfoDialog';
import FormEdit from './_components/EditForm';

export default function Home() {
  const [showDialog, setShowDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const handlePromptSubmit = async (prompt) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      console.log('Gemini Response:', data);

      if (data.formId) {
        setFormId(data.formId);
        await fetchForm(data.formId);
        setShowDialog(false);
        toast.success('Form generated successfully! 🎉');
      } else {
        setError('Form generation failed. Please try again with a clearer prompt.');
        toast.error('Form generation failed.');
      }
    } catch (error) {
      console.error('Error generating form:', error);
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForm = async (id) => {
    try {
      const res = await fetch(`/api/form/${id}`);
      const data = await res.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('Failed to load form data.');
    }
  };

  const handleFormSubmit = async (answers) => {
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, answers })
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      const data = await res.json();
      toast.success('Form submitted successfully! ✅');
      console.log('Saved Response:', data);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error(error.message || 'Submission failed. Please try again.');
    }
  };

  const handleClearForm = () => {
    setFormData(null);
    setFormId(null);
    setError('');
    setEditMode(false);
    toast('Form cleared', { icon: '🗑️' });
  };

  const handleUpdateForm = async (updatedForm) => {
    try {
      setFormData(updatedForm);
      const res = await fetch(`/api/form/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForm)
      });

      if (!res.ok) {
        throw new Error('Failed to update form');
      }

      const data = await res.json();
      toast.success('Form updated successfully! ✏️');
      console.log('Update Response:', data);
    } catch (err) {
      console.error('Failed to update form:', err);
      toast.error(err.message || 'Failed to update form');
    }
  };

  return (
    <div>
      <Hero onLearnMore={() => setShowInfoDialog(true)} />

      {showInfoDialog && <InfoDialog onClose={() => setShowInfoDialog(false)} />}

      <div id="form-generator" className="p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-4 text-gray-900 dark:text-white">
          AI Form Builder
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Describe the form you want to create and let AI build it for you.
          Be specific with field names and types. For example:
          <em> "Create a feedback form with name (text), email (email), message (textarea), and rating (1–5)." </em>
        </p>

        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setShowDialog(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Create New Form
          </button>

          {formData && (
            <>
              <button
                onClick={() => setEditMode(false)}
                className={`px-4 py-2 rounded ${!editMode ? 'bg-indigo-600 text-white' : 'border'}`}
              >
                Fill Form
              </button>
              <button
                onClick={() => setEditMode(true)}
                className={`px-4 py-2 rounded ${editMode ? 'bg-blue-600 text-white' : 'border'}`}
              >
                Edit Form
              </button>
              <a
                href={`/preview/${formId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition"
              >
                Preview / Share
              </a>
              <button
                onClick={handleClearForm}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
              >
                Clear Form
              </button>
            </>
          )}
        </div>

        {loading && (
          <div className="text-center text-gray-500 font-medium">
            Generating your form... please wait.
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 font-semibold mb-4">
            {error}
          </div>
        )}

        {formData && (
          <div className="mt-8">
            {editMode ? (
              <FormEdit formData={formData} onUpdate={handleUpdateForm} />
            ) : (
              <FormFiller formData={formData} onSubmit={handleFormSubmit} />
            )}
          </div>
        )}

        {showDialog && (
          <PromptDialog
            onSubmit={handlePromptSubmit}
            onClose={() => {
              if (!loading) {
                setShowDialog(false);
                setError('');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
