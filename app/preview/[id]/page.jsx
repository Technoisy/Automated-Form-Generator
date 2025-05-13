// app/preview/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import FormFiller from '@/app/_components/FormFiller';

export default function PreviewPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/form/${id}`);
        const data = await res.json();

        if (data?.fields) {
          setFormData({ ...data, id }); // ensure id is included
        } else {
          toast.error('Invalid or missing form data.');
        }
      } catch (err) {
        console.error('Error loading preview:', err);
        toast.error('Failed to load form.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/preview/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied to clipboard!');
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading preview...</p>;
  }

  if (!formData) {
    return <p className="text-center mt-10 text-red-500">Form not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Live Form Preview</h1>
          <button
            onClick={handleShareClick}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700"
          >
            Copy Share Link
          </button>
        </div>

        <FormFiller formData={formData} onSubmit={() => toast('This is a preview. Submission is disabled.')} />
      </div>
    </div>
  );
}
