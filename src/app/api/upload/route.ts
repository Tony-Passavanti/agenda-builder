import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    // Use Vercel's temporary directory
    const tempDir = '/tmp';
    const uniqueId = uuidv4();
    const tempFileName = `${uniqueId}-${file.name}`;
    const tempFilePath = join(tempDir, tempFileName);
    
    // Save the file to temporary storage
    await writeFile(tempFilePath, buffer);
    
    // In a real app, you might want to upload this to a persistent storage like S3
    // For now, we'll just return the temp file path
    // Note: This file will be deleted when the serverless function ends
    
    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      tempFilePath: tempFilePath,
      // This URL won't be directly accessible, you'll need to implement a download endpoint
      // or upload to a persistent storage service
      message: 'File uploaded to temporary storage. In production, upload to a persistent storage service.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
