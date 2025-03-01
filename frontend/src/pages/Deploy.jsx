import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { useProjectStore } from '../store/projects';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import JSZip from "jszip"; // Import JSZip

const frameworks = [
  { id: 'decisionTree', name: 'Decision Trees' },
  { id: 'linearRegression', name: 'Linear Regression' },
  { id: 'logisticRegression', name: 'Logistic Regression' },
];

const modelTypes = [
  { id: 'skl', name: 'Sckit Learn' },
];

export default function Deploy() {
  const navigate = useNavigate();
  const { addProject, isLoading, error } = useProjectStore((state) => ({
    addProject: state.addProject,
    isLoading: state.isLoading,
    error: state.error
  }));
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    framework: '',
    modelType: '',
    files: {
      notebook: null,
      requirements: null,
      model: null,
      dataset: null,
    },
  });
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    console.log('🔄 Deploy page rendered', { step, isLoading });
  }, [step, isLoading]);

  useEffect(() => {
    if (error) {
      console.error('❌ Deploy error state:', error);
    }
  }, [error]);

  const handleStepChange = (newStep) => {
    console.log(`⏭️ Changing step from ${step} to ${newStep}`);
    setStep(newStep);
  };

  const handleFormChange = (field, value) => {
    console.log(`🖊️ Form field changed: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (fileType, file) => {
    console.log(`📎 File changed: ${fileType}`, file ? `(${file.name}, ${file.size} bytes)` : 'null');
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileType]: file
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting deploy form", formData);
  
    try {
      // First create the project
      const projectData = {
        name: formData.name,
        description: formData.description,
        framework: formData.framework,
        modelType: formData.modelType,
      };
  
      console.log("📤 Creating project with data:", projectData);
      const project = await addProject(projectData);
      console.log("✅ Project created successfully:", project);
      console.log("🔄 Setting project ID:", project._id);
      setProjectId(project._id);
  
      // If files exist, zip and upload them
      if (project && Object.values(formData.files).some(Boolean)) {
        const zip = new JSZip();
        let fileCount = 0;
  
        // Add each file to the ZIP
        for (const [key, file] of Object.entries(formData.files)) {
          if (file) {
            zip.file(file.name, file);
            fileCount++;
          }
        }
  
        if (fileCount > 0) {
          console.log(`📦 Zipping ${fileCount} files...`);
          const zipBlob = await zip.generateAsync({ type: "blob" });
  
          // Create FormData and append ZIP file
          const fileFormData = new FormData();
          fileFormData.append("file", zipBlob, "project-files.zip");
  
          console.log(`📤 Uploading ZIP file for project ID: ${project._id}`);
          await useProjectStore.getState().uploadProjectZip(project._id, fileFormData);
          console.log("✅ ZIP file uploaded successfully");
        }
      }
  
      console.log("🔄 Redirecting to dashboard");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Failed to create project:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Deploy New Model</h1>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2].map((number) => (
                <div
                  key={number}
                  className={`flex items-center ${
                    number === 2 ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {number}
                  </div>
                  <div
                    className={`mx-4 text-sm font-medium ${
                      step >= number
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {number === 1 ? 'Project Details' : 'Upload Files'}
                  </div>
                </div>
              ))}
              <div
                className={`h-1 flex-1 mx-4 ${
                  step > 1
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      handleFormChange('name', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="My Awesome ML Model"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange('description', e.target.value)
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="Brief description of your model and its purpose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Framework
                  </label>
                  <select
                    required
                    value={formData.framework}
                    onChange={(e) =>
                      handleFormChange('framework', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                    <option value="">Select a framework</option>
                    {frameworks.map((framework) => (
                      <option key={framework.id} value={framework.id}>
                        {framework.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model Type
                  </label>
                  <select
                    required
                    value={formData.modelType}
                    onChange={(e) =>
                      handleFormChange('modelType', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                    <option value="">Select a model type</option>
                    {modelTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <FileUpload
                  label="Jupyter Notebook (.ipynb)"
                  accept=".ipynb"
                  file={formData.files.notebook}
                  onChange={(file) =>
                    handleFileChange('notebook', file)
                  }
                  description="Your model training notebook"
                />

                <FileUpload
                  label="Requirements (requirements.txt)"
                  accept=".txt"
                  file={formData.files.requirements}
                  onChange={(file) =>
                    handleFileChange('requirements', file)
                  }
                  description="Python package dependencies"
                />

                <FileUpload
                  label="Model Weights"
                  accept=".pt,.pth,.h5,.pkl,.bin"
                  file={formData.files.model}
                  onChange={(file) =>
                    handleFileChange('model', file)
                  }
                  description="Trained model weights file"
                />

                <FileUpload
                  label="Dataset"
                  accept=".csv,.json,.zip"
                  file={formData.files.dataset}
                  onChange={(file) =>
                    handleFileChange('dataset', file)
                  }
                  description="Your model's training or test dataset"
                />
              </div>
            )}

            <div className="mt-8 flex justify-end">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => handleStepChange(2)}
                  disabled={!formData.name || !formData.framework || !formData.modelType}
                  className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleStepChange(1)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !Object.values(formData.files).some(Boolean)}
                    className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <span>Deploy Model</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}