// app/components/UploadForm.tsx
'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setImageUrl(url);
        // You can also pass this URL to a parent component or handle it as needed
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {isUploading && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Uploaded image:</p>
          <img 
            src={imageUrl} 
            alt="Uploaded preview" 
            className="mt-2 max-w-xs rounded border"
          />
        </div>
      )}
    </div>
  );
}