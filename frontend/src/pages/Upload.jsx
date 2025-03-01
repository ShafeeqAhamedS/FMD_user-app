import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { FileUpload } from '../components/FileUpload';
import logger from '../utils/logger';

const Upload = () => {
  const [files, setFiles] = useState({
    notebook: null,
    requirements: null,
    model: null,
    dataset: null,
  });
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const storedProjectId = localStorage.getItem('projectId');
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (message === 'Files uploaded successfully, Initiating deployment...' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [message, countdown]);

  const handleFileChange = (fileType, file) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const triggerJenkinsJob = async (projectId) => {
    try {
      logger.info('Fetching Jenkins crumb');
      const crumbResponse = await axios.get('http://localhost:8080/crumbIssuer/api/json', {
        auth: {
          username: 'admin',
          password: '1196611b0d87af2b9d9df124ec2d755b21'
        }
      });
      const crumb = crumbResponse.data.crumb;
      const crumbField = crumbResponse.data.crumbRequestField;

      await axios.post(`http://localhost:8080/job/FMD/buildWithParameters?token=token&PROJECT_ID=${projectId}&AUTH_TOKEN=${localStorage.getItem('token')}`, {}, {
        headers: {
          [crumbField]: crumb
        },
        auth: {
          username: 'admin',
          password: '1196611b0d87af2b9d9df124ec2d755b21'
        }
      });

      logger.info('Triggered Jenkins job');
      return true;
    } catch (error) {
      logger.error('Error triggering Jenkins job:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setMessage('Project ID not found. Please try again.');
      return;
    }

    if (!files.notebook || !files.requirements || !files.model || !files.dataset) {
      setMessage('Please select all four files.');
      return;
    }

    try {
      const zip = new JSZip();
      Object.values(files).forEach((file) => {
        zip.file(file.name, file);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('projectZip', zipBlob, 'project.zip');
      const response = await axios.post(`http://localhost:5000/api/v1/projects/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setMessage('Files uploaded successfully, Initiating deployment...');
      localStorage.setItem('projectId', projectId);
      
      // Trigger Jenkins job after successful upload
      const jobTriggered = await triggerJenkinsJob(projectId);
      // Add a delay of 10 seconds to let the job start
      await new Promise((resolve) => setTimeout(resolve, 10000));
      if (jobTriggered) {
        const buildInfoResponse = await axios.get('http://localhost:8080/job/FMD/api/json', {
          auth: {
            username: 'admin',
            password: '1196611b0d87af2b9d9df124ec2d755b21'
          }
        });
        const buildNumber = buildInfoResponse.data.lastBuild.number;
        localStorage.setItem('buildNumber', buildNumber);
        window.location.href = '/deploying_page';
      } else {
        setMessage('Files uploaded but failed to trigger deployment. Please try deploying manually.');
      }
    } catch (error) {
      setMessage('Error uploading files.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Upload Project Files</h1>
      {message === 'Files uploaded successfully, Initiating deployment...' ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-500">{message}</p>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {countdown > 0 ? `Redirecting in ${countdown}...` : 'Redirecting...'}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && message !== 'Files uploaded successfully, Initiating deployment...' && (
            <div className="text-red-500 mb-4">{message}</div>
          )}
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
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Files
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;