import api from './api';
import { Project, ApiResponse } from '../types';

export const projectService = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await api.get('/projects');
    return response.data;
  },

  createProject: async (formData: FormData): Promise<ApiResponse<Project>> => {
    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateVideo: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await api.post('/projects/generate-video', { projectId });
    return response.data;
  },
};
