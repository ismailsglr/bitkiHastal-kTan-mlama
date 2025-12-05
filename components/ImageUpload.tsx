"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemoveImage: () => void;
}

export default function ImageUpload({
  onImageSelect,
  selectedImage,
  onRemoveImage,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  if (selectedImage) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative rounded-lg overflow-hidden border-2 border-primary shadow-lg">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Seçilen bitki yaprağı"
            className="w-full h-auto max-h-96 object-contain bg-gray-50"
          />
          <button
            onClick={onRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
            aria-label="Görseli kaldır"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 text-center">
          {selectedImage.name}
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-2xl mx-auto
        border-2 border-dashed rounded-lg
        p-12 text-center
        transition-all duration-200
        ${
          isDragging
            ? "border-primary bg-primary/5 scale-105"
            : "border-gray-300 hover:border-primary/50 bg-gray-50"
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer flex flex-col items-center space-y-4"
      >
        <div
          className={`
          p-4 rounded-full
          transition-colors
          ${
            isDragging
              ? "bg-primary text-white"
              : "bg-primary/10 text-primary"
          }
        `}
        >
          {isDragging ? (
            <Upload className="h-12 w-12" />
          ) : (
            <ImageIcon className="h-12 w-12" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isDragging ? "Görselinizi buraya bırakın" : "Bitki yaprağı görseli yükleyin"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sürükle-bırak veya tıklayarak seçin
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Desteklenen formatlar: JPG, PNG, WEBP
          </p>
        </div>
      </label>
    </div>
  );
}

