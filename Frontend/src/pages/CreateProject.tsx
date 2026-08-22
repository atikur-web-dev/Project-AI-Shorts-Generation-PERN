import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { Upload, ArrowLeft, Sparkles, X, CheckCircle, AlertCircle } from "lucide-react";

const CreateProject: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    productName: "",
    userPrompt: "",
    aspectRatio: "9:16",
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);

  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ----------------------------------------
  // Redirect unauthenticated users
  // ----------------------------------------

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // ----------------------------------------
  // Auto hide toast
  // ----------------------------------------

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ----------------------------------------
  // Toast helpers
  // ----------------------------------------

  const showSuccessToast = (message: string) => {
    setToast({
      type: "success",
      message,
    });
  };

  const showErrorToast = (message: string) => {
    setToast({
      type: "error",
      message,
    });
  };

  // ----------------------------------------
  // File validation
  // ----------------------------------------

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image file.");
      return false;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      showErrorToast("Image size must be less than 10MB.");
      return false;
    }

    return true;
  };

  // ----------------------------------------
  // Product image
  // ----------------------------------------

  const handleProductImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setProductImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProductPreview(previewUrl);
  };

  // ----------------------------------------
  // Model image
  // ----------------------------------------

  const handleModelImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setModelImage(file);

    const previewUrl = URL.createObjectURL(file);
    setModelPreview(previewUrl);
  };

  // ----------------------------------------
  // Remove product image
  // ----------------------------------------

  const removeProductImage = () => {
    if (productPreview) {
      URL.revokeObjectURL(productPreview);
    }

    setProductImage(null);
    setProductPreview(null);
  };

  // ----------------------------------------
  // Remove model image
  // ----------------------------------------

  const removeModelImage = () => {
    if (modelPreview) {
      URL.revokeObjectURL(modelPreview);
    }

    setModelImage(null);
    setModelPreview(null);
  };

  // ----------------------------------------
  // Form submit
  // ----------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showErrorToast("Please login to create an image.");
      navigate("/login");
      return;
    }

    if (!formData.projectName.trim()) {
      showErrorToast("Please enter a project name.");
      return;
    }

    if (!formData.productName.trim()) {
      showErrorToast("Please enter a product name.");
      return;
    }

    if (!productImage) {
      showErrorToast("Please upload a product image.");
      return;
    }

    if (!modelImage) {
      showErrorToast("Please upload a model image.");
      return;
    }

    const data = new FormData();

    data.append("projectName", formData.projectName.trim());
    data.append("productName", formData.productName.trim());

    if (formData.userPrompt.trim()) {
      data.append("userPrompt", formData.userPrompt.trim());
    }

    data.append("aspectRatio", formData.aspectRatio);

    data.append("productImage", productImage);
    data.append("modelImage", modelImage);

    setSubmitting(true);

    try {
      const response = await projectService.createProject(data);

      if (response.success) {
        showSuccessToast("AI image generated successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);

        return;
      }

      showErrorToast(
        response.message || "Failed to generate the image."
      );
    } catch (error: any) {
      console.error("Create project error:", error);

      const responseData = error?.response?.data;

      // Backend validation errors
      if (responseData?.errors?.length) {
        const firstError = responseData.errors[0];

        showErrorToast(
          firstError.message || responseData.message || "Validation failed."
        );

        return;
      }

      showErrorToast(
        responseData?.message ||
          error?.message ||
          "Something went wrong while generating the image."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------
  // Loading
  // ----------------------------------------

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />

          <p className="text-sm text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ---------------------------------- */}
      {/* Toast */}
      {/* ---------------------------------- */}

      {toast && (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-xl ${
              toast.type === "success"
                ? "border-green-200"
                : "border-red-200"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle
                  size={20}
                  className="text-green-600"
                />
              ) : (
                <AlertCircle
                  size={20}
                  className="text-red-600"
                />
              )}
            </div>

            <p
              className={`flex-1 text-sm font-medium ${
                toast.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------- */}
      {/* Main */}
      {/* ---------------------------------- */}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">

              <div className="bg-primary-100 p-2.5 rounded-lg">
                <Sparkles
                  className="text-primary-600"
                  size={24}
                />
              </div>

              <h1 className="text-3xl font-bold text-gray-900">
                Create AI Image
              </h1>

            </div>

            <p className="text-gray-600">
              Upload your product and model images and let Gemini
              generate a stunning AI-powered image.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>

              <input
                type="text"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g. Summer Product Campaign"
                required
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>

              <input
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g. Premium Sneakers"
                required
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Prompt{" "}
                <span className="text-gray-400 font-normal">
                  (Optional)
                </span>
              </label>

              <textarea
                value={formData.userPrompt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    userPrompt: e.target.value,
                  })
                }
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe the scene, lighting, background, pose, style, mood, etc..."
              />

              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.userPrompt.length}/500
              </p>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>

              <select
                value={formData.aspectRatio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aspectRatio: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="9:16">
                  9:16 — Portrait
                </option>

                <option value="16:9">
                  16:9 — Landscape
                </option>

                <option value="1:1">
                  1:1 — Square
                </option>

                <option value="4:5">
                  4:5 — Social Portrait
                </option>
              </select>
            </div>

            {/* Images */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary-500 transition-colors">

                  {productPreview ? (
                    <div className="relative">

                      <img
                        src={productPreview}
                        alt="Product preview"
                        className="w-full h-56 object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeProductImage}
                        className="absolute top-2 right-2 bg-white/95 text-red-600 rounded-full p-1.5 shadow hover:bg-white"
                      >
                        <X size={17} />
                      </button>

                      <div className="bg-white px-3 py-2">
                        <p className="text-sm text-gray-600 truncate">
                          {productImage?.name}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        onChange={handleProductImageChange}
                        accept="image/*"
                        className="hidden"
                        id="productImage"
                      />

                      <label
                        htmlFor="productImage"
                        className="cursor-pointer block p-6 text-center"
                      >
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />

                        <p className="text-sm text-gray-600">
                          Click to upload product image
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP — Max 10MB
                        </p>
                      </label>
                    </>
                  )}

                </div>
              </div>

              {/* Model Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary-500 transition-colors">

                  {modelPreview ? (
                    <div className="relative">

                      <img
                        src={modelPreview}
                        alt="Model preview"
                        className="w-full h-56 object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeModelImage}
                        className="absolute top-2 right-2 bg-white/95 text-red-600 rounded-full p-1.5 shadow hover:bg-white"
                      >
                        <X size={17} />
                      </button>

                      <div className="bg-white px-3 py-2">
                        <p className="text-sm text-gray-600 truncate">
                          {modelImage?.name}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        onChange={handleModelImageChange}
                        accept="image/*"
                        className="hidden"
                        id="modelImage"
                      />

                      <label
                        htmlFor="modelImage"
                        className="cursor-pointer block p-6 text-center"
                      >
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />

                        <p className="text-sm text-gray-600">
                          Click to upload model image
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP — Max 10MB
                        </p>
                      </label>
                    </>
                  )}

                </div>
              </div>
            </div>

            {/* Credit Info */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <strong>Note:</strong> Generating an AI image
                costs 5 credits. You have 30 free credits to get
                started.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} />

                {submitting
                  ? "Generating Image..."
                  : "Generate Image"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;