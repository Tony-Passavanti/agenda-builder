export const uploadFile = async (file: File): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      success: false, 
      error: 'Failed to upload file. Please try again.' 
    };
  }
};
