import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemoveImage: () => void;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onRemoveImage,
  isLoading
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isLoading
  });

  const handleRemove = () => {
    onRemoveImage();
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`
            border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-green-500 bg-green-50 scale-105' 
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragActive ? 'bg-green-200' : 'bg-gray-100'
            }`}>
              <Upload className={`w-12 h-12 transition-colors duration-300 ${
                isDragActive ? 'text-green-600' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {isDragActive ? 'Drop your apple leaf image here' : 'Upload Apple Leaf Image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select • JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            {preview && (
              <img
                src={preview}
                alt="Selected apple leaf"
                className="w-full h-64 object-cover image-zoom"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span className="truncate">{selectedImage.name}</span>
            <span className="text-gray-400">
              ({(selectedImage.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};