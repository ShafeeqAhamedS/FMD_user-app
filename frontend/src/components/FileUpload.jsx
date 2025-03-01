import React, { useEffect } from 'react';
import { Upload, X, FileText } from 'lucide-react';

export function FileUpload({
  label,
  accept,
  description,
  file,
  onChange,
}) {
  useEffect(() => {
    console.log(`🔄 FileUpload "${label}" rendered:`, file ? `${file.name} (${file.size} bytes)` : 'no file');
  }, [label, file]);

  const handleDrop = (e) => {
    e.preventDefault();
    console.log(`📎 File dropped on "${label}" uploader`);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && accept.split(',').some(type => droppedFile.name.endsWith(type.replace('*', '')))) {
      console.log(`✅ Accepting dropped file: ${droppedFile.name}`);
      onChange(droppedFile);
    } else {
      console.log(`❌ Rejected dropped file: incorrect type or no file`);
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log(`📎 File selected for "${label}":`, selectedFile.name, selectedFile.size, 'bytes');
      onChange(selectedFile);
    }
  };

  const handleRemove = () => {
    console.log(`🗑️ Removing file from "${label}" uploader`);
    onChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors border-gray-300 dark:border-gray-700"
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            id={`file-${label}`}
          />
          <label
            htmlFor={`file-${label}`}
            className="cursor-pointer"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Drag & drop or click to upload
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}