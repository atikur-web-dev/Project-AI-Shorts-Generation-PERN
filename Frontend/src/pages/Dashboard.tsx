import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { Plus, Video, Clock, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    loadProjects();
  }, [user, loading, navigate]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectService.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleGenerateVideo = async (projectId: string) => {
    if (!confirm('This will cost 10 credits. Do you want to continue?')) {
      return;
    }

    try {
      const response = await projectService.generateVideo(projectId);
      if (response.success) {
        alert('Video generation started! It may take a few minutes.');
        loadProjects();
      }
    } catch (error: any) {
      alert('Error generating video: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading || loadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={() => navigate('/create-project')}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{projects.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Video className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Videos Generated</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {projects.filter((p) => p.generatedVideo).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Videos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {projects.filter((p) => !p.generatedVideo).length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <button
                onClick={() => navigate('/create-project')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {project.generatedImage ? (
                      <img
                        src={project.generatedImage}
                        alt={project.projectName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{project.projectName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{project.productName}</p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        project.generatedVideo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {project.generatedVideo ? 'Video Ready' : 'Image Generated'}
                    </span>

                    {!project.generatedVideo && (
                      <button
                        onClick={() => handleGenerateVideo(project.id)}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                      >
                        Generate Video
                      </button>
                    )}

                    {project.generatedVideo && (
                      <button
                        onClick={() => window.open(project.generatedVideo, '_blank')}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                      >
                        View Video
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
