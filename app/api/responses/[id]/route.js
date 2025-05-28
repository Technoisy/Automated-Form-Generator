import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  try {
    const formId = params.id;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const responses = await db.collection('responses')
      .find({ formId: formId })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json(responses);
  } catch (err) {
    console.error('Error fetching responses:', err);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
