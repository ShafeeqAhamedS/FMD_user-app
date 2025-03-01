import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projects';
import { ArrowLeft, ExternalLink, Download, Loader2 } from 'lucide-react';

export default function ProjectPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, selectedProject, downloadProjectZip, isLoading, error } = useProjectStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    console.log('🔄 ProjectPreview rendered for ID:', id);
    // Only make the API call if ID is defined
    if (id) {
      getProject(id);
    } else {
      console.warn('⚠️ No project ID provided in URL parameters');
      // Optionally redirect to dashboard or another fallback page
      navigate('/dashboard');
    }
  }, [id, getProject, navigate]);

  useEffect(() => {
    console.log('📊 Project data:', selectedProject || 'Loading...');
  }, [selectedProject]);

  const handleBack = () => {
    console.log('🔙 Navigating back to dashboard');
    navigate('/dashboard');
  };

  const handleDownload = async () => {
    if (!selectedProject?.zipFilePath) {
      setDownloadError('No ZIP file available for this project.');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError('');
      console.log('📥 Downloading project ZIP file');
      await downloadProjectZip(id);
      console.log('✅ Download successful');
    } catch (err) {
      console.error('❌ Download failed:', err);
      setDownloadError(err.message || 'Failed to download project files');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading project details...</span>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Project not found</p>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedProject.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedProject.description}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {selectedProject.zipFilePath && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Files</span>
                </>
              )}
            </button>
          )}
          
          {selectedProject.deployedIP && (
            <a
              href={"http://"+selectedProject.deployedIP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {downloadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700 dark:text-red-400">{downloadError}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                {selectedProject.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(selectedProject.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(selectedProject.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {selectedProject.tags && selectedProject.tags.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedProject.deployedIP && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Deployed IP:</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProject.deployedIP}</p>
            <iframe src={`http://${selectedProject.deployedIP}`} className="w-full h-64 mt-2 border rounded" title="Deployed Project"></iframe>
          </div>
        )}
      </div>
    </div>
  );
}