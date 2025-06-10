import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/uploads');
    const filePath = join(uploadDir, file.name);
    
    // Ensure the uploads directory exists
    await require('fs').promises.mkdir(uploadDir, { recursive: true });
    
    // Save the file
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      filePath: `/uploads/${file.name}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
