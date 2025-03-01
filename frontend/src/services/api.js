import axios from 'axios';
import { info, error as logError, debug } from '../utils/logger';

const API_URL = 'http://localhost:5000/api/v1';

// Create logger function to standardize log format
const logAPI = (type, endpoint, data) => {
  debug('API', `${type} | ${endpoint}`, data);
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logAPI('REQUEST', config.url, { method: config.method, data: config.data });
    return config;
  },
  (err) => {
    logError('API', `Request Error: ${err.message || 'Unknown error'}`, err);
    return Promise.reject(err);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    logAPI('RESPONSE', response.config.url, { 
      status: response.status, 
      statusText: response.statusText,
      data: response.data 
    });
    return response;
  },
  (err) => {
    const errorDetails = {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    };
    
    logError('API', `Response Error: ${errorDetails.status} ${errorDetails.statusText || 'Unknown error'}`, errorDetails);
    return Promise.reject(err);
  }
);

export const authService = {
  login: async (email, password) => {
    info('AUTH', `Login attempt for: ${email}`);
    try {
      const response = await api.post('/users/login', { email, password });
      info('AUTH', 'Login successful', { userId: response.data.user?.id });
      return response.data;
    } catch (err) {
      logError('AUTH', `Login failed for ${email}`, err.response?.data || err.message);
      throw err;
    }
  },
  register: async (userData) => {
    info('AUTH', 'Registration attempt', { email: userData.email });
    try {
      const response = await api.post('/users/register', userData);
      info('AUTH', 'Registration successful', { userId: response.data.user?.id });
      return response.data;
    } catch (err) {
      logError('AUTH', 'Registration failed', err.response?.data || err.message);
      throw err;
    }
  },
  getMe: async () => {
    debug('AUTH', 'Fetching current user profile');
    try {
      const response = await api.get('/users/me');
      debug('AUTH', 'User profile fetched successfully', { userId: response.data.user?.id });
      return response.data;
    } catch (err) {
      logError('AUTH', 'Failed to fetch user profile', err.response?.data || err.message);
      throw err;
    }
  },
  updateProfile: async (userData) => {
    info('AUTH', 'Updating user profile', { userId: userData.id });
    try {
      const response = await api.put('/users/update', userData);
      info('AUTH', 'Profile updated successfully', { userId: response.data.user?.id });
      return response.data;
    } catch (err) {
      logError('AUTH', 'Profile update failed', err.response?.data || err.message);
      throw err;
    }
  },
  updatePassword: async (passwordData) => {
    info('AUTH', 'Password update requested');
    try {
      const response = await api.put('/users/update-password', passwordData);
      info('AUTH', 'Password updated successfully');
      return response.data;
    } catch (err) {
      logError('AUTH', 'Password update failed', err.response?.data || err.message);
      throw err;
    }
  },
  updateProfilePic: async (formData) => {
    info('AUTH', 'Profile picture update requested');
    try {
      const response = await api.put('/users/update-profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      info('AUTH', 'Profile picture updated successfully');
      return response.data;
    } catch (err) {
      logError('AUTH', 'Profile picture update failed', err.response?.data || err.message);
      throw err;
    }
  },
};

export const projectService = {
  getProjects: async (queryParams = {}) => {
    const params = new URLSearchParams();
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.tag) params.append('tag', queryParams.tag);
    if (queryParams.sort) params.append('sort', queryParams.sort);
    if (queryParams.order) params.append('order', queryParams.order);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    info('PROJECTS', `Fetching projects with filters: ${queryString || 'none'}`);
    try {
      const response = await api.get(`/projects${queryString}`);
      info('PROJECTS', `Fetched ${response.data.projects?.length || 0} projects`);
      return response.data;
    } catch (err) {
      logError('PROJECTS', 'Failed to fetch projects', err.response?.data || err.message);
      throw err;
    }
  },
  getProject: async (id) => {
    info('PROJECTS', `Fetching project details`, { id });
    try {
      const response = await api.get(`/projects/${id}`);
      info('PROJECTS', `Project fetched successfully`, { id, title: response.data.project?.title });
      return response.data;
    } catch (err) {
      logError('PROJECTS', `Failed to fetch project with ID ${id}`, err.response?.data || err.message);
      throw err;
    }
  },
  createProject: async (projectData) => {
    info('PROJECTS', 'Creating new project', { title: projectData.title });
    try {
      const response = await api.post('/projects', projectData);
      info('PROJECTS', 'Project created successfully', { id: response.data.project?.id, title: response.data.project?.title });
      return response.data;
    } catch (err) {
      logError('PROJECTS', 'Failed to create project', err.response?.data || err.message);
      throw err;
    }
  },
  updateProject: async (id, projectData) => {
    info('PROJECTS', `Updating project`, { id, title: projectData.title });
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      info('PROJECTS', 'Project updated successfully', { id, title: response.data.project?.title });
      return response.data;
    } catch (err) {
      logError('PROJECTS', `Failed to update project with ID ${id}`, err.response?.data || err.message);
      throw err;
    }
  },
  deleteProject: async (id) => {
    info('PROJECTS', `Deleting project`, { id });
    try {
      const response = await api.delete(`/projects/${id}`);
      info('PROJECTS', 'Project deleted successfully', { id });
      return response.data;
    } catch (err) {
      logError('PROJECTS', `Failed to delete project with ID ${id}`, err.response?.data || err.message);
      throw err;
    }
  },
  uploadProjectZip: async (id, formData) => {
    info('PROJECTS', `Uploading project ZIP file`, { id });
    try {
      console.log('📤 Uploading project ZIP file:', formData);
      const response = await api.post(`/projects/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [(data, headers) => {
          return data;
        }],
      });
      info('PROJECTS', 'Project ZIP upload successful', { id });
      return response.data;
    } catch (err) {
      console.error('❌ Failed to upload project ZIP file:', err);
      logError('PROJECTS', `Failed to upload project ZIP for ID ${id}`, err.response?.data || err.message);
      throw err;
    }
  },
  downloadProjectZip: async (id) => {
    info('PROJECTS', `Downloading project ZIP file`, { id });
    try {
      // Using axios with responseType blob to handle the file download
      const response = await api.get(`/projects/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let filename = `project-${id}.zip`;
      
      // Try to extract filename from Content-Disposition header if available
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      info('PROJECTS', 'Project ZIP download successful', { id, filename });
      
      return {
        url,
        filename,
        data: response.data
      };
    } catch (err) {
      logError('PROJECTS', `Failed to download project ZIP for ID ${id}`, err.response?.data || err.message);
      throw err;
    }
  }
};

export default api;
