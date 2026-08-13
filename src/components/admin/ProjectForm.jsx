"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/api";

export default function ProjectForm({ initialData, onSubmit, isEditing = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [order, setOrder] = useState(initialData?.order || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [badgeInput, setBadgeInput] = useState("");
  const [badges, setBadges] = useState(initialData?.badges || []);
  const [features, setFeatures] = useState(initialData?.features || []);
  const [techStack, setTechStack] = useState(initialData?.techStack || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image ? getImageUrl(initialData.image) : null);

  const addBadge = () => {
    const trimmed = badgeInput.trim();
    if (trimmed && !badges.includes(trimmed)) {
      setBadges([...badges, trimmed]);
      setBadgeInput("");
    }
  };

  const removeBadge = (index) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  const updateFeature = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addTechStack = () => {
    setTechStack([...techStack, { category: "", items: "" }]);
  };

  const updateTechStack = (index, field, value) => {
    const updated = [...techStack];
    updated[index][field] = value;
    setTechStack(updated);
  };

  const removeTechStack = (index) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("link", link);
      formData.append("order", order);
      formData.append("isActive", isActive);
      formData.append("badges", JSON.stringify(badges));
      formData.append("features", JSON.stringify(features.filter((f) => f.title && f.description)));
      formData.append("techStack", JSON.stringify(techStack.filter((t) => t.category && t.items)));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await onSubmit(formData);
      router.push("/admin/projects");
    } catch (err) {
      setError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Project title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          placeholder="Project description..."
          required
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">External Link</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="https://example.com"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Image {isEditing && "(upload new to replace)"}
        </label>
        <div className="flex items-start gap-4">
          {imagePreview && (
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-[#1a1a2a] flex-shrink-0">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-[#2a2a3a] rounded-lg p-6 text-center hover:border-indigo-500/50 transition-colors">
              <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-400">{imageFile ? imageFile.name : "Click to upload image"}</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP up to 10MB</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Badges */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tech Badges</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={badgeInput}
            onChange={(e) => setBadgeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBadge();
              }
            }}
            className="flex-1 px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type and press Enter (e.g., React.js)"
          />
          <button
            type="button"
            onClick={addBadge}
            className="px-4 py-2 bg-[#1a1a2a] hover:bg-[#222233] text-gray-300 text-sm rounded-lg border border-[#2a2a3a] transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a1a2a] text-gray-300 text-sm rounded-full">
              {badge}
              <button type="button" onClick={() => removeBadge(i)} className="text-gray-500 hover:text-red-400 ml-1">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Key Features</label>
          <button type="button" onClick={addFeature} className="text-xs text-indigo-400 hover:text-indigo-300">
            + Add Feature
          </button>
        </div>
        <div className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={feature.title}
                onChange={(e) => updateFeature(i, "title", e.target.value)}
                className="w-1/3 px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Feature title"
              />
              <input
                type="text"
                value={feature.description}
                onChange={(e) => updateFeature(i, "description", e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Description"
              />
              <button type="button" onClick={() => removeFeature(i)} className="px-2 text-gray-500 hover:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Tech Stack</label>
          <button type="button" onClick={addTechStack} className="text-xs text-indigo-400 hover:text-indigo-300">
            + Add Category
          </button>
        </div>
        <div className="space-y-3">
          {techStack.map((tech, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={tech.category}
                onChange={(e) => updateTechStack(i, "category", e.target.value)}
                className="w-1/3 px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Category (e.g., Frontend)"
              />
              <input
                type="text"
                value={tech.items}
                onChange={(e) => updateTechStack(i, "items", e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Items (e.g., React.js, Next.js, Tailwind)"
              />
              <button type="button" onClick={() => removeTechStack(i)} className="px-2 text-gray-500 hover:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Order & Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
              isActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            {isActive ? "✓ Active" : "○ Inactive"}
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#1e1e2e]">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>{isEditing ? "Update Project" : "Create Project"}</>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="px-6 py-2.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
