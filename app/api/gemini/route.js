// app/api/gemini/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import clientPromise from '@/lib/mongodb';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper function to normalize form data
const normalizeFormData = (formJson) => {
  if (!formJson || typeof formJson !== 'object') {
    throw new Error('Invalid form structure received from AI');
  }

  if (!Array.isArray(formJson.fields)) {
    throw new Error('Form fields must be an array');
  }

  return {
    ...formJson,
    fields: formJson.fields.map(field => {
      // Convert option objects to strings
      if (field.options && Array.isArray(field.options)) {
        return {
          ...field,
          options: field.options.map(opt => {
            if (typeof opt === 'object') {
              return opt.label || opt.value || JSON.stringify(opt);
            }
            return String(opt);
          })
        };
      }
      return field;
    })
  };
};

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid text prompt describing your form requirements' },
        { status: 400 }
      );
    }

    // Enhanced system prompt with strict formatting rules
    const systemPrompt = `
You are an expert form designer creating JSON form structures. Follow these rules strictly:
1. Return ONLY pure JSON (no markdown, no code blocks)
2. Fields must include: name (snake_case), label, type, required
3. For select/radio/checkbox fields, provide options as STRINGS (not objects)
4. For file fields, include accept and maxSizeMB parameters
5. Never return HTML or any non-JSON content

Example valid structure:
{
  "fields": [
    {
      "name": "full_name",
      "label": "Full Name",
      "type": "text",
      "required": true
    },
    {
      "name": "gender",
      "label": "Gender",
      "type": "radio",
      "options": ["Male", "Female", "Other"],
      "required": true
    }
  ]
}

User Request:
${prompt}
    `.trim();

    const geminiResponse = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: systemPrompt }] }]
    });

    const fullText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Check for common AI response issues
    if (fullText.trim().startsWith('<') || fullText.includes('<html')) {
      return NextResponse.json(
        { error: 'AI returned HTML. Please rephrase your prompt to request only JSON output.' },
        { status: 400 }
      );
    }

    if (fullText.includes('```json')) {
      return NextResponse.json(
        { error: 'AI returned markdown. Please specify "Return ONLY pure JSON without any markdown formatting".' },
        { status: 400 }
      );
    }

    let formJson;
    try {
      formJson = JSON.parse(fullText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      return NextResponse.json(
        { 
          error: 'The AI response could not be parsed as JSON. Please try:',
          suggestions: [
            'Rephrase your prompt more clearly',
            'Add "Return ONLY valid JSON without any additional text"',
            'Simplify your request'
          ]
        },
        { status: 400 }
      );
    }

    // Normalize and validate form data
    const normalizedForm = normalizeFormData(formJson);

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection('forms').insertOne({
      prompt,
      formJson: normalizedForm,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Form generated successfully',
      formId: result.insertedId 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Failed to process your request';
    let suggestions = [
      'Check your prompt for clarity',
      'Simplify complex requirements',
      'Try breaking your request into smaller parts'
    ];

    if (error.message.includes('AI response')) {
      errorMessage = 'The AI response was not in the expected format';
      suggestions = [
        'Add "Return ONLY valid JSON without any additional text" to your prompt',
        'Be more specific about field requirements',
        'Avoid special characters in your prompt'
      ];
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        suggestions,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}