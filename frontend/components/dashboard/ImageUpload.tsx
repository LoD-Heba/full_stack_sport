// frontend/components/dashboard/ImageUpload.tsx
"use client";
import { useState } from 'react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImages?: string[];
}

export default function ImageUpload({ onUploadSuccess, currentImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/v1/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al subir imagen');
      }

      const data = await response.json();
      console.log('Upload response:', data); // Debug
      
      // 🔹 El backend retorna { url: "http://localhost:3001/images/filename.webp" }
      onUploadSuccess(data.url);
      
      // Limpiar input
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      
      <label
        htmlFor="image-upload"
        className={`cursor-pointer inline-flex flex-col items-center ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">Subiendo imagen...</p>
          </>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-1">
              <span className="text-blue-600 font-medium">Haz clic para subir</span> o arrastra
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (máx. 5MB)</p>
          </>
        )}
      </label>

      {error && (
        <div className="mt-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Preview de imágenes actuales */}
      {currentImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {currentImages.map((url, idx) => (
            <div key={idx} className="relative">
              <img
                src={url}
                alt={`preview-${idx}`}
                className="h-20 w-full object-cover rounded"
                onError={(e) => {
                  console.error('Error loading preview:', url);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {url.split('/').pop()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}