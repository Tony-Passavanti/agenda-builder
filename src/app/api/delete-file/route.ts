import { unlink } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';

export async function DELETE(request: Request) {
  try {
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Remove the leading slash to make it a relative path
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = join(process.cwd(), 'public', relativePath);
    
    // Delete the file
    await unlink(fullPath);
    
    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting file' },
      { status: 500 }
    );
  }
}
