import { create } from 'zustand';
import { projectService } from '../services/api';
import { info, error, debug } from '../utils/logger';

export const useProjectStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async (queryParams = {}) => {
    debug('STORE', 'Projects: Fetching all projects', queryParams);
    set({ isLoading: true, error: null });
    try {
      const data = await projectService.getProjects(queryParams);
      info('STORE', `Projects: Fetched ${data.projects?.length || 0} projects`);
      console.log('📂 Projects fetched:', data.projects);
      set({ projects: data.projects || [], isLoading: false });
      return data.projects;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch projects';
      error('STORE', 'Projects: Failed to fetch projects', { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  getProject: async (id) => {
    debug('STORE', 'Projects: Fetching project details', { id });
    set({ isLoading: true, error: null });
    try {
      const data = await projectService.getProject(id);
      info('STORE', 'Projects: Project details fetched successfully', { id, title: data.project?.title });
      set({ selectedProject: data.project, isLoading: false });
      return data.project;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch project';
      error('STORE', `Projects: Failed to fetch project with ID ${id}`, { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  setSelectedProject: (project) => {
    debug('STORE', 'Projects: Setting selected project', { id: project?.id, title: project?.title });
    set({ selectedProject: project });
  },
  
  addProject: async (projectData) => {
    debug('STORE', 'Projects: Creating new project', { title: projectData.title });
    set({ isLoading: true, error: null });
    try {
      const data = await projectService.createProject(projectData);
      info('STORE', 'Projects: Project created successfully', { id: data.project.id, title: data.project.title });
      set((state) => ({ 
        projects: [...state.projects, data.project],
        isLoading: false
      }));
      return data.project;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create project';
      error('STORE', 'Projects: Failed to create project', { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  updateProject: async (id, projectData) => {
    debug('STORE', 'Projects: Updating project', { id, title: projectData.title });
    set({ isLoading: true, error: null });
    try {
      const data = await projectService.updateProject(id, projectData);
      info('STORE', 'Projects: Project updated successfully', { id, title: data.project.title });
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? data.project : p),
        selectedProject: state.selectedProject?.id === id ? data.project : state.selectedProject,
        isLoading: false
      }));
      return data.project;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update project';
      error('STORE', `Projects: Failed to update project with ID ${id}`, { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  deleteProject: async (id) => {
    debug('STORE', 'Projects: Deleting project', { id });
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteProject(id);
      info('STORE', 'Projects: Project deleted successfully', { id });
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete project';
      error('STORE', `Projects: Failed to delete project with ID ${id}`, { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  uploadProjectZip: async (id, formData) => {
    debug('STORE', 'Projects: Uploading project ZIP file', { id });
    set({ isLoading: true, error: null });
    try {
      console.log('📤 Uploading project ZIP file:', formData);
      const data = await projectService.uploadProjectZip(id, formData);
      info('STORE', 'Projects: Project ZIP uploaded successfully', { id });
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? data.project : p),
        selectedProject: state.selectedProject?.id === id ? data.project : state.selectedProject,
        isLoading: false
      }));
      return data.project;
    } catch (err) {
      console.error('❌ Failed to upload project ZIP file:', err);
      const errorMessage = err.response?.data?.message || 'Failed to upload project files';
      error('STORE', `Projects: Failed to upload project ZIP for ID ${id}`, { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  downloadProjectZip: async (id) => {
    debug('STORE', 'Projects: Downloading project ZIP file', { id });
    set({ isLoading: true, error: null });
    try {
      const downloadData = await projectService.downloadProjectZip(id);
      info('STORE', 'Projects: Project ZIP downloaded successfully', { id, filename: downloadData.filename });
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.setAttribute('download', downloadData.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL to free up memory
      setTimeout(() => URL.revokeObjectURL(downloadData.url), 100);
      
      set({ isLoading: false });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to download project files';
      error('STORE', `Projects: Failed to download project ZIP for ID ${id}`, { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  }
}));