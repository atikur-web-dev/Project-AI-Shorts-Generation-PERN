// Frontend/src/pages/AdminProjects.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Globe,
  Lock,
  FolderKanban,
} from "lucide-react";
import api from "../services/api";

interface Project {
  id: string;
  projectName: string;
  productName: string;
  productDescription: string | null;
  userPrompt: string | null;
  productImage: string | null;
  modelImage: string | null;
  generatedImage: string | null;
  generatedVideo: string | null;
  aspectRatio: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_picture: string | null;
}

interface ProjectDetails extends Project {
  user_role?: string;
  user_login_type?: string;
}

interface ProjectAnalytics {
  total_projects: number;
  public_projects: number;
  private_projects: number;
  generated_images: number;
  generated_videos: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] =
    useState<ProjectAnalytics | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isPublic, setIsPublic] = useState("");
  const [hasGeneratedImage, setHasGeneratedImage] =
    useState("");
  const [hasGeneratedVideo, setHasGeneratedVideo] =
    useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedProject, setSelectedProject] =
    useState<ProjectDetails | null>(null);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(
    null,
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);

      const response = await api.get(
        "/admin/projects/analytics",
      );

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error(
        "Fetch project analytics error:",
        err,
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page: meta.page,
        limit: meta.limit,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (isPublic) params.isPublic = isPublic;
      if (hasGeneratedImage) {
        params.hasGeneratedImage = hasGeneratedImage;
      }
      if (hasGeneratedVideo) {
        params.hasGeneratedVideo = hasGeneratedVideo;
      }

      const response = await api.get(
        "/admin/projects",
        { params },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to fetch projects",
        );
      }

      setProjects(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      console.error("Fetch projects error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch projects",
      );
    } finally {
      setLoading(false);
    }
  }, [
    meta.page,
    meta.limit,
    search,
    isPublic,
    hasGeneratedImage,
    hasGeneratedVideo,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setMeta((previous) => ({
      ...previous,
      page: 1,
    }));

    setSearch(searchInput.trim());
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);

    setMeta((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handleSortChange = (
    field: string,
  ) => {
    setSortBy(field);

    setMeta((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handleSortOrderChange = (
    order: string,
  ) => {
    setSortOrder(order);

    setMeta((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setIsPublic("");
    setHasGeneratedImage("");
    setHasGeneratedVideo("");
    setSortBy("createdAt");
    setSortOrder("desc");

    setMeta((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  const handleRefresh = async () => {
    setSuccess("");
    setError("");

    await Promise.all([
      fetchProjects(),
      fetchAnalytics(),
    ]);
  };

  const handleViewProject = async (
    projectId: string,
  ) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await api.get(
        `/admin/projects/${projectId}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to fetch project details",
        );
      }

      setSelectedProject(response.data.data);
    } catch (err: any) {
      console.error(
        "Fetch project details error:",
        err,
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch project details",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteProject = async (
    project: Project,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(project.id);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/admin/projects/${project.id}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to delete project",
        );
      }

      setSuccess(
        "Project deleted successfully.",
      );

      if (
        projects.length === 1 &&
        meta.page > 1
      ) {
        setMeta((previous) => ({
          ...previous,
          page: previous.page - 1,
        }));
      } else {
        await fetchProjects();
      }

      await fetchAnalytics();
    } catch (err: any) {
      console.error(
        "Delete project error:",
        err,
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete project",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Projects
              </h1>

              <p className="mt-1 text-gray-600">
                Monitor and manage all generated projects.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || analyticsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Projects
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analyticsLoading
                      ? "—"
                      : analytics?.total_projects ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <FolderKanban
                    size={21}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Public
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analyticsLoading
                      ? "—"
                      : analytics?.public_projects ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-green-100 p-3">
                  <Globe
                    size={21}
                    className="text-green-700"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Private
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analyticsLoading
                      ? "—"
                      : analytics?.private_projects ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <Lock
                    size={21}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Generated Images
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analyticsLoading
                      ? "—"
                      : analytics?.generated_images ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-100 p-3">
                  <ImageIcon
                    size={21}
                    className="text-blue-700"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Generated Videos
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {analyticsLoading
                      ? "—"
                      : analytics?.generated_videos ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-purple-100 p-3">
                  <Video
                    size={21}
                    className="text-purple-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <form
                onSubmit={handleSearch}
                className="lg:col-span-2"
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Search
                </label>

                <div className="flex">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) =>
                        setSearchInput(
                          e.target.value,
                        )
                      }
                      placeholder="Project, product, user..."
                      className="w-full rounded-l-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-r-lg bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Visibility
                </label>

                <select
                  value={isPublic}
                  onChange={(e) =>
                    handleFilterChange(
                      setIsPublic,
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">
                    All Projects
                  </option>
                  <option value="true">
                    Public
                  </option>
                  <option value="false">
                    Private
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Image
                </label>

                <select
                  value={hasGeneratedImage}
                  onChange={(e) =>
                    handleFilterChange(
                      setHasGeneratedImage,
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">
                    All
                  </option>
                  <option value="true">
                    Has Image
                  </option>
                  <option value="false">
                    No Image
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Video
                </label>

                <select
                  value={hasGeneratedVideo}
                  onChange={(e) =>
                    handleFilterChange(
                      setHasGeneratedVideo,
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">
                    All
                  </option>
                  <option value="true">
                    Has Video
                  </option>
                  <option value="false">
                    No Video
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sort By
                  </label>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="createdAt">
                      Created Date
                    </option>
                    <option value="updatedAt">
                      Updated Date
                    </option>
                    <option value="projectName">
                      Project Name
                    </option>
                    <option value="productName">
                      Product Name
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Order
                  </label>

                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      handleSortOrderChange(
                        e.target.value,
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="desc">
                      Descending
                    </option>
                    <option value="asc">
                      Ascending
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[350px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                  <p className="text-sm text-gray-600">
                    Loading projects...
                  </p>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex min-h-[350px] items-center justify-center px-6 text-center">
                <div>
                  <FolderKanban
                    size={40}
                    className="mx-auto text-gray-300"
                  />

                  <h2 className="mt-4 text-lg font-semibold text-gray-900">
                    No projects found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Project
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          User
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Created
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr
                          key={project.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {project.generatedImage ? (
                                  <img
                                    src={
                                      project.generatedImage
                                    }
                                    alt={
                                      project.projectName
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon
                                      size={20}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-gray-900">
                                  {project.projectName}
                                </p>

                                <p className="truncate text-sm text-gray-500">
                                  {project.productName}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {project.user_name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {project.user_email}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  project.isPublic
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {project.isPublic ? (
                                  <Globe size={12} />
                                ) : (
                                  <Lock size={12} />
                                )}

                                {project.isPublic
                                  ? "Public"
                                  : "Private"}
                              </span>

                              {project.generatedImage && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  <ImageIcon size={12} />
                                  Image
                                </span>
                              )}

                              {project.generatedVideo && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                                  <Video size={12} />
                                  Video
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {formatDate(
                              project.createdAt,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewProject(
                                    project.id,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                              >
                                <Eye size={16} />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteProject(
                                    project,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  project.id
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 size={16} />

                                {deletingId ===
                                project.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    {projects.length > 0
                      ? (meta.page - 1) *
                          meta.limit +
                        1
                      : 0}{" "}
                    to{" "}
                    {(meta.page - 1) *
                      meta.limit +
                      projects.length}{" "}
                    of {meta.total} projects
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!meta.hasPrev}
                      onClick={() =>
                        setMeta((previous) => ({
                          ...previous,
                          page:
                            previous.page - 1,
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <span className="px-3 text-sm font-medium text-gray-700">
                      Page {meta.page} of{" "}
                      {Math.max(
                        meta.totalPages,
                        1,
                      )}
                    </span>

                    <button
                      type="button"
                      disabled={!meta.hasNext}
                      onClick={() =>
                        setMeta((previous) => ({
                          ...previous,
                          page:
                            previous.page + 1,
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8">
          <div className="mx-auto max-w-4xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedProject.projectName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProject(null)
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
              </div>
            ) : (
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Project Name
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.projectName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Product Name
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.productName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      User
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.user_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {selectedProject.user_email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Aspect Ratio
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.aspectRatio ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Visibility
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.isPublic
                        ? "Public"
                        : "Private"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Login Type
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedProject.user_login_type ||
                        "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Product Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {selectedProject.productDescription ||
                      "No description provided."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    User Prompt
                  </p>

                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                    {selectedProject.userPrompt ||
                      "No prompt provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {selectedProject.generatedImage && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Generated Image
                      </p>

                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={
                            selectedProject.generatedImage
                          }
                          alt="Generated"
                          className="max-h-80 w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {selectedProject.generatedVideo && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Generated Video
                      </p>

                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
                        <video
                          src={
                            selectedProject.generatedVideo
                          }
                          controls
                          className="max-h-80 w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        selectedProject.createdAt,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Updated
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        selectedProject.updatedAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProject(null)
                    }
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
