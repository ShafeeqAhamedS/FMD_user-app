import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projects';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    framework: '',
    modelType: '',
  });

  useEffect(() => {
    console.log('🔄 Deploy page rendered', { isLoading });
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      console.error('❌ Deploy error state:', error);
    }
  }, [error]);

  const handleFormChange = (field, value) => {
    console.log(`🖊️ Form field changed: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting deploy form", formData);
  
    try {
      // First create the project
      const projectData = {
        title: formData.name,
        description: formData.description,
        framework: formData.framework,
        modelType: formData.modelType,
      };
  
      console.log("📤 Creating project with data:", projectData);
      const project = await addProject(projectData);
      console.log("✅ Project created successfully:", project);
      console.log("🔄 Setting project ID:", project._id);
      localStorage.setItem('projectId', project._id);
  
      console.log("🔄 Redirecting to upload");
      navigate("/upload");
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium p- text-gray-700 dark:text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    handleFormChange('name', e.target.value)
                  }
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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
                  className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
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

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !formData.name || !formData.framework || !formData.modelType}
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
          </form>
        </div>
      </div>
    </div>
  );
}