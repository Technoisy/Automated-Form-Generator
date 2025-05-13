import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { formId, answers } = await request.json();
    
    // Validate input
    if (!formId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Validate form exists
    const formExists = await db.collection('forms').countDocuments({ 
      _id: new ObjectId(formId) 
    });
    
    if (!formExists) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Save response
    const result = await db.collection('responses').insertOne({
      formId: new ObjectId(formId),
      answers,
      submittedAt: new Date(),
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      responseId: result.insertedId,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save response', details: error.message },
      { status: 500 }
    );
  }
}