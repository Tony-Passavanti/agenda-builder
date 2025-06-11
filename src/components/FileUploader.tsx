'use client';

import { useState, useRef, ChangeEvent, DragEvent, useCallback } from 'react';
import { uploadFile } from '@/lib/file-utils';

interface FileUploadResponse {
  success: boolean;
  filePath?: string;
  fileName?: string;
    error?: string;
}

interface FileUploaderProps {
  onUploadSuccess: (filePath: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUploader({ 
  onUploadSuccess, 
  accept = '.xlsx,.xls',
  maxSizeMB = 10 
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
    }
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
      setError('Only Excel files (.xlsx, .xls) are supported');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile(file);
      
      if (result.success && result.filePath) {
        onUploadSuccess(result.filePath);
      } else {
        setError(result.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload');
    } finally {
      setIsUploading(false);
      // Reset file input if there was an error
      if (fileInputRef.current && error) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`flex items-center justify-center w-full ${isUploading ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
            transition-colors ${
              error 
                ? 'border-red-500 bg-red-50' 
                : isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg
              className={`w-12 h-12 mb-3 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.toUpperCase()} (max {maxSizeMB}MB)
              </p>
            </div>
          </div>
          <input
            id="file-upload"
            ref={fileInputRef}
            name="file-upload"
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {isUploading && (
        <div className="mt-6 space-y-2 text-center">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-sm font-medium text-gray-700">Uploading your file...</p>
          <p className="text-xs text-gray-500">Please wait while we process your file</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0 text-red-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
