import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, unlink, mkdir, writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// Type for Excel row data
type ExcelRow = (string | number | boolean | null)[];

export async function POST(request: Request) {
  try {
    // Read the raw file data from the request
    const arrayBuffer = await request.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'No file data provided' },
        { status: 400 }
      );
    }
    
    // Convert to Uint8Array and read as workbook
    const workbookData = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(workbookData, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to array of rows
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 }) as ExcelRow[];
    
    // Get event name from cell A1 (0,0)
    const eventName = (data[0]?.[0]?.toString() || 'Event Agenda').trim();
    
    // Create a simple PDF with just the event name and date
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Center content vertically and horizontally
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    // Add title (centered, moved up 2 inches/50.8mm from center)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(eventName);
    doc.text(
      eventName,
      centerX - (titleWidth / 2),
      centerY - 60.8  // Moved up 2 inches (50.8mm) from previous position
    );
    
    // Add date below title (centered, moved up accordingly)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const today = new Date();
    const dateText = `Generated on: ${today.toLocaleDateString()}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(
      dateText,
      centerX - (dateWidth / 2),
      centerY - 40.8  // Moved up 2 inches (50.8mm) from previous position
    );
    
    // Add a simple line separator below the date (moved up 2 inches/50.8mm)
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(
      centerX - 30,  // Start 30mm left of center
      centerY - 35.8, // Moved up 2 inches (50.8mm) from previous position
      centerX + 30,  // End 30mm right of center
      centerY - 35.8  // Same Y position as start to make it horizontal
    );
    
    // Add AVANT logo at the bottom center
    try {
      // Get the logo from the public URL
      const logoResponse = await fetch('https://images.squarespace-cdn.com/content/v1/65cd12b87b6f902ede6eae13/680f1d02-82ff-41f3-9fbf-8cdca5cbd9e3/2022_01_04+-+AVANT+LOGO+-+OUTLINE.png');
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString('base64');
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;
      
      // Add logo with width of 90mm (50% larger than 60mm) and maintain aspect ratio
      doc.addImage(
        logoDataUrl,
        'PNG',
        centerX - 45,  // Center the logo (90mm width / 2 = 45mm offset from center)
        pageHeight - 45,  // Position 45mm from bottom
        90,  // Width in mm (50% larger than 60mm)
        0,   // Height will maintain aspect ratio
        undefined,
        'FAST'  // Fast rendering
      );
    } catch (error) {
      console.error('Error adding logo:', error);
      // Continue without logo if there's an error
    }
    
    // Save the PDF
    const pdfPath = join(process.cwd(), 'public', 'generated', 'agenda.pdf');
    const uploadDir = join(process.cwd(), 'public', 'generated');
    await mkdir(uploadDir, { recursive: true });
    
    const pdfBytes = doc.output('arraybuffer');
    await writeFile(pdfPath, Buffer.from(pdfBytes));
    
    return NextResponse.json({ 
      success: true, 
      pdfPath: '/generated/agenda.pdf',
      eventName
    });
    
  } catch (error: unknown) {
    console.error('Error processing file:', error);
    
    // Type guard to check if error is an Error object
    const isError = (e: unknown): e is Error => {
      return e instanceof Error;
    };
    
    // Type guard to check if error has a code property
    const isErrorWithCode = (e: unknown): e is { code: string } => {
      return typeof e === 'object' && e !== null && 'code' in e;
    };
    
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    const errorStack = isError(error) ? error.stack : undefined;
    const errorName = isError(error) ? error.name : undefined;
    const errorCode = isErrorWithCode(error) ? error.code : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName,
      code: errorCode
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error processing file',
        details: process.env.NODE_ENV === 'development' ? {
          message: errorMessage,
          stack: errorStack,
          name: errorName,
          code: errorCode
        } : undefined
      },
      { status: 500 }
    );
  }
}
