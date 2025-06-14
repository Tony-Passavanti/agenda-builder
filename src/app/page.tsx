'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import * as XLSX from 'xlsx';

export default function Home() {
  //const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    workbook: XLSX.WorkBook;
    fileData: ArrayBuffer;
  } | null>(null);

  const handleUploadSuccess = (workbook: XLSX.WorkBook, fileData: ArrayBuffer) => {
    setUploadedFile({ workbook, fileData });
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    try {
      // Convert ArrayBuffer to Uint8Array for sending
      const fileData = new Uint8Array(uploadedFile.fileData);
      
      // Call the process-file API to generate PDF
      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: fileData
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error processing file:', result.error);
        return;
      }
      
      // Show success modal with download link
      setShowSuccessModal(true);
      
      // Keep the PDF path for download
      setPdfPath(result.pdfPath);
      
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    try {
      // Delete the generated PDF file
      await fetch('/api/delete-generated-file', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error cleaning up generated file:', error);
    } finally {
      setUploadedFile(null);
      setPdfPath(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/media/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -10
      }} />
      
      {/* Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: -5
      }} />
      
      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Agenda Builder</h1>
            <p className="text-gray-200 text-lg">Upload your Excel file to generate beautiful agendas</p>
          </div>

          <div className="bg-white/50 shadow-xl rounded-2xl overflow-hidden">
          {!uploadedFile ? (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your File</h2>
                <p className="text-gray-500">
                  Upload an Excel file to process your agenda
                </p>
              </div>
              
              <FileUploader 
                onUploadSuccess={handleUploadSuccess}
                accept=".xlsx,.xls"
                maxSizeMB={10}
              />
            </div>
          ) : (
            <div className="p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-50 mb-6">
                  <svg
                    className="h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  File Uploaded Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your file is ready to be processed.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-8 max-w-md mx-auto">
                  <div className="flex items-center">
                    <svg
                      className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.workbook.SheetNames[0]}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ready for processing
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Another File
                  </button>
                  <button
                    onClick={handleProcessFile}
                    disabled={isProcessing}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Process File'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-200">
            <p>Supported formats: .xlsx, .xls (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Success!</h3>
              <p className="text-gray-700 mb-6">Your agenda has been generated successfully!</p>
              <div className="flex flex-col space-y-3">
                <a
                  href={pdfPath || '#'}
                  download
                  onClick={() => {
                    // Reset the form and close the modal after a small delay
                    setTimeout(() => {
                      setShowSuccessModal(false);
                      handleReset();
                    }, 100);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Download Agenda
                </a>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleReset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-gray-300 text-sm">
        <div className="flex items-center justify-center space-x-1">
          <span>©</span>
          <span>2025 Avant Creative</span>
        </div>
      </footer>
    </div>
  );
}
