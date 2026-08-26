// Frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import type { Project } from "../types";
import {
  Plus,
  Image,
  CheckCircle,
  Sparkles,
  Download,
  Trash2,
  X,
  Eye,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Project selected for delete confirmation modal
  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * LocalStorage key for hidden projects.
   *
   * Important:
   * We are NOT deleting anything from the database.
   * We only store hidden project IDs in this browser.
   */
  const getHiddenProjectsKey = () => {
    return `hidden_projects_${user?.id}`;
  };

  /**
   * Get hidden project IDs from localStorage.
   */
  const getHiddenProjectIds = (): string[] => {
    if (!user?.id) return [];

    try {
      const stored = localStorage.getItem(getHiddenProjectsKey());

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to read hidden projects:", error);
      return [];
    }
  };

  /**
   * Save hidden project IDs to localStorage.
   */
  const saveHiddenProjectIds = (projectIds: string[]) => {
    if (!user?.id) return;

    try {
      localStorage.setItem(
        getHiddenProjectsKey(),
        JSON.stringify(projectIds)
      );
    } catch (error) {
      console.error("Failed to save hidden projects:", error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, loading, navigate]);

  /**
   * Load projects from backend.
   *
   * Projects are still fetched from DB.
   * We only filter out the projects that the user
   * previously removed from their dashboard.
   */
  const loadProjects = async () => {
    try {
      setLoadingProjects(true);

      const response = await projectService.getProjects();

      console.log("GET PROJECTS RESPONSE:", response);
      console.log("PROJECT DATA:", response.data);

      if (response.success && Array.isArray(response.data)) {
        const hiddenProjectIds = getHiddenProjectIds();

        const visibleProjects = response.data.filter(
          (project) => !hiddenProjectIds.includes(project.id)
        );

        setProjects(visibleProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  /**
   * Open delete confirmation modal.
   */
  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
  };

  /**
   * Close delete confirmation modal.
   */
  const closeDeleteModal = () => {
    if (isDeleting) return;

    setProjectToDelete(null);
  };

  /**
   * Remove project from user's dashboard.
   *
   * IMPORTANT:
   * This does NOT delete the project from the database.
   * The project ID is simply stored in localStorage.
   */
  const handleDeleteProject = async () => {
    if (!projectToDelete || !user?.id) {
      return;
    }

    try {
      setIsDeleting(true);

      const hiddenProjectIds = getHiddenProjectIds();

      // Prevent duplicate IDs
      if (!hiddenProjectIds.includes(projectToDelete.id)) {
        hiddenProjectIds.push(projectToDelete.id);
      }

      saveHiddenProjectIds(hiddenProjectIds);

      // Immediately remove it from current UI
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project.id !== projectToDelete.id
        )
      );

      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to remove project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * View generated image in a new tab.
   */
  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * Download generated image.
   *
   * First attempts to download the image as a Blob.
   * If the remote server blocks the request, it falls back
   * to opening the image in a new tab.
   */
  const handleDownloadImage = async (
    imageUrl: string,
    projectName: string
  ) => {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${projectName || "ai-generated-image"}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Image download failed:", error);

      // Fallback
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading || loadingProjects) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>

              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>

            <button
              onClick={() => navigate("/create-project")}
              className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus size={20} />
              <span>New Image</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {/* Total Projects */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">
                    Total Projects
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {projects.length}
                  </p>
                </div>

                <div className="bg-primary-100 p-3 rounded-lg">
                  <Image
                    className="text-primary-600"
                    size={24}
                  />
                </div>
              </div>
            </div>

            {/* Images Generated */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">
                    Images Generated
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {
                      projects.filter(
                        (project) => project.generatedImage
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle
                    className="text-green-600"
                    size={24}
                  />
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">
                    AI Credits
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {user?.userSubscription?.credits ?? 0}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Available credits
                  </p>
                </div>

                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Sparkles
                    className="text-yellow-600"
                    size={24}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">

            {/* Projects Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Projects
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your AI-generated image projects
                </p>
              </div>

              <button
                onClick={() => navigate("/create-project")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Create New
              </button>
            </div>

            {/* Empty State */}
            {projects.length === 0 ? (
              <div className="p-12 text-center">

                <Image
                  className="mx-auto text-gray-400 mb-4"
                  size={48}
                />

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>

                <p className="text-gray-600 mb-4">
                  Create your first AI-generated image project
                  to get started.
                </p>

                <button
                  onClick={() => navigate("/create-project")}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={18} />
                  Create Project
                </button>
              </div>
            ) : (

              /* Project Grid */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >

                    {/* Image */}
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      {project.generatedImage ? (
                        <img
                          src={project.generatedImage}
                          alt={project.projectName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image size={40} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">

                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {project.projectName}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 truncate">
                        {project.productName}
                      </p>

                      {/* Status */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle size={12} />
                          Image Generated
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {project.generatedImage && (
                        <div className="grid grid-cols-3 gap-2">

                          {/* View */}
                          <button
                            onClick={() =>
                              handleViewImage(
                                project.generatedImage!
                              )
                            }
                            className="flex items-center justify-center gap-1.5 bg-primary-600 text-white px-2 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            title="View Image"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>

                          {/* Download */}
                          <button
                            onClick={() =>
                              handleDownloadImage(
                                project.generatedImage!,
                                project.projectName
                              )
                            }
                            className="flex items-center justify-center gap-1.5 bg-gray-800 text-white px-2 py-2.5 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                            title="Download Image"
                          >
                            <Download size={16} />
                            <span>Download</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              openDeleteModal(project)
                            }
                            className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2 py-2.5 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            title="Remove Project"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}

                      {/* If no generated image */}
                      {!project.generatedImage && (
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() =>
                              openDeleteModal(project)
                            }
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2.5 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================= */}

      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
        >

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Close Button */}
            <button
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-7">

              {/* Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-5">
                <Trash2
                  size={26}
                  className="text-red-600"
                />
              </div>

              {/* Title */}
              <h2
                id="delete-project-title"
                className="text-xl font-bold text-gray-900 mb-2"
              >
                Remove this project?
              </h2>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-2">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-900">
                  "{projectToDelete.projectName}"
                </span>{" "}
                from your Dashboard?
              </p>

              <p className="text-sm text-gray-500 mb-6">
                Your project will not be deleted from our
                database. It will only be hidden from your
                Dashboard.
              </p>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">

                {/* Cancel */}
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 px-5 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* Remove */}
                <button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={17} />
                      <span>Yes, Remove</span>
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
