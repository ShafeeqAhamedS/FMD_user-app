import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { projectService } from '../services/api';

export default function ModelUpload({ projectId, onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    console.log('🔄 ModelUpload rendered for project ID:', projectId);
  }, [projectId]);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      console.log('❌ No file was dropped/selected');
      return;
    }
    console.log('📎 File dropped:', file.name, file.size, 'bytes');
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      // Use 'projectZip' as the field name as expected by the API
      formData.append('projectZip', file);
      
      console.log('📤 Uploading file to project:', projectId);
      // Use the project service for consistent API handling
      const response = await projectService.uploadProjectZip(projectId, formData);
      
      console.log('✅ File uploaded successfully:', response);
      if (onUploadComplete) {
        console.log('📣 Calling upload complete callback');
        onUploadComplete(response);
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload project files');
    } finally {
      console.log('🔄 Upload state reset');
      setIsUploading(false);
    }
  }, [projectId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          } 
          ${isUploading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`
        }
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              Uploading project files...
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Drag & drop your project ZIP file here, or click to select
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              ZIP file can be up to 50MB in size
            </p>
          </>
        )}
      </div>
    </div>
  );
}