import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'generated', 'agenda.pdf');
    
    // Check if file exists before trying to delete
    try {
      await fs.access(filePath);
    } catch (error) {
      // File doesn't exist, nothing to delete
      return NextResponse.json({ success: true });
    }
    
    // Delete the file
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting generated file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete generated file' },
      { status: 500 }
    );
  }
}
