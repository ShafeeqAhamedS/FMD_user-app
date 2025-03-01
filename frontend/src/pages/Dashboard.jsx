import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projects';
import { ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const statusIcons = {
  uploading: Clock,
  processing: Loader2,
  deployed: CheckCircle,
  failed: XCircle,
};

export default function Dashboard() {
  const { projects, fetchProjects, setSelectedProject, isLoading } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Dashboard mounted - fetching projects');
    fetchProjects().then(() => {
      console.log('📂 Projects fetched successfully');
    }).catch(err => {
      console.error('❌ Failed to fetch projects:', err);
    });
  }, [fetchProjects]);

  useEffect(() => {
    console.log('📊 Dashboard projects state:', { count: projects.length, isLoading });
  }, [projects, isLoading]);

  const handleProjectClick = (project) => {
    console.log('🖱️ Project clicked:', project._id);
    setSelectedProject(project);
    navigate(`/projects/${project._id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h1>
        <Link
          to="/deploy"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Deploy New Model
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-lg">
            You don't have any projects yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Deploy your first ML model to get started
          </p>
          <Link
            to="/deploy"
            className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Deploy Model
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Framework
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => {
                console.log('📂 Selected Project:', project._id);
                const StatusIcon = statusIcons[project.status] || Clock;
                return (
                  <tr
                    key={project._id} // Add this unique key prop
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.title || project.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {project.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {project.framework}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {project.deployedUrl && (
                      <a
                          href={project.deployedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                      </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}