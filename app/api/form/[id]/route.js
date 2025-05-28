import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Form ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const form = await db.collection('forms').findOne({ _id: new ObjectId(id) });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: form._id.toString(),
      ...form.formJson,
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = params.id;
    const updatedForm = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Form ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection('forms').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          formJson: updatedForm,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: 'Form updated successfully',
      updated: result.modifiedCount > 0,
      id,
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}
