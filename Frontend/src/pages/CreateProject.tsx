// Frontend/src/pages/CreateProject.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { Upload, ArrowLeft, Sparkles } from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productImage || !modelImage) {
      alert("Please select both product and model images");
      return;
    }

    const data = new FormData();

    data.append("projectName", formData.projectName);
    data.append("productName", formData.productName);
    data.append("userPrompt", formData.userPrompt);
    data.append("aspectRatio", formData.aspectRatio);

    data.append("productImage", productImage);
    data.append("modelImage", modelImage);

    setSubmitting(true);

    try {
      const response = await projectService.createProject(data);

      if (response.success) {
        alert("Image generated successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      alert(
        "Error generating image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button
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

          <form onSubmit={handleSubmit} className="space-y-6">

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
                AI Prompt
                <span className="text-gray-400 font-normal">
                  {" "}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe the scene, lighting, background, pose, style, mood, etc..."
              />
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
              </select>
            </div>

            {/* Images */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) =>
                      setProductImage(
                        e.target.files?.[0] || null
                      )
                    }
                    accept="image/*"
                    className="hidden"
                    id="productImage"
                    required
                  />

                  <label
                    htmlFor="productImage"
                    className="cursor-pointer"
                  >
                    <Upload
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />

                    <p className="text-sm text-gray-600">
                      {productImage
                        ? productImage.name
                        : "Click to upload product image"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Model Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Image
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) =>
                      setModelImage(
                        e.target.files?.[0] || null
                      )
                    }
                    accept="image/*"
                    className="hidden"
                    id="modelImage"
                    required
                  />

                  <label
                    htmlFor="modelImage"
                    className="cursor-pointer"
                  >
                    <Upload
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />

                    <p className="text-sm text-gray-600">
                      {modelImage
                        ? modelImage.name
                        : "Click to upload model image"}
                    </p>
                  </label>
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
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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