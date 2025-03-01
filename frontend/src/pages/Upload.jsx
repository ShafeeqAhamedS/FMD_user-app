import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { FileUpload } from '../components/FileUpload';

const Upload = () => {
  const [files, setFiles] = useState({
    notebook: null,
    requirements: null,
    model: null,
    dataset: null,
  });
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    const storedProjectId = localStorage.getItem('projectId');
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  const handleFileChange = (fileType, file) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.notebook || !files.requirements || !files.model || !files.dataset) {
      setMessage('Please select all four files.');
      return;
    }

    const zip = new JSZip();
    Object.values(files).forEach((file) => {
      zip.file(file.name, file);
    });

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('projectZip', zipBlob, 'project.zip');
      const response = await axios.post(`http://localhost:5000/api/v1/projects/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('Files uploaded successfully!');
      localStorage.setItem('projectId', projectId);
      window.location.href = '/deploying_page'; // Redirect to the new page after upload
    } catch (error) {
      setMessage('Error uploading files.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Upload Project Files</h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <FileUpload
            label="Jupyter Notebook (.ipynb)"
            accept=".ipynb"
            file={files.notebook}
            onChange={(file) => handleFileChange('notebook', file)}
            description="Your model training notebook"
          />
          <FileUpload
            label="Requirements (requirements.txt)"
            accept=".txt"
            file={files.requirements}
            onChange={(file) => handleFileChange('requirements', file)}
            description="Python package dependencies"
          />
          <FileUpload
            label="Model Weights"
            accept=".pt,.pth,.h5,.pkl,.bin,.pickle"
            file={files.model}
            onChange={(file) => handleFileChange('model', file)}
            description="Trained model weights file"
          />
          <FileUpload
            label="Dataset"
            accept=".csv,.json,.zip"
            file={files.dataset}
            onChange={(file) => handleFileChange('dataset', file)}
            description="Your model's training or test dataset"
          />
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Files
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{message}</p>}
    </div>
  );
};

export default Upload;
