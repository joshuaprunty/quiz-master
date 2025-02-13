import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

// This is the required export for Next.js API routes
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Verify file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    const data = await pdf(buffer);

    // Extract and clean text
    const extractedText = data.text
      .replace(/\s+/g, ' ')
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return NextResponse.json({ 
      text: extractedText,
      pages: data.numpages
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}