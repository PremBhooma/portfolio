"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl, enhanceProjectWithAI } from "@/lib/api";

export default function ProjectForm({ initialData, onSubmit, isEditing = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiNotice, setAiNotice] = useState("");

  // AI loading states for granular buttons
  const [aiLoadingField, setAiLoadingField] = useState(null); // 'title' | 'description' | 'features_gen' | 'badges_gen' | 'tech_gen' | `feat_${index}`
  const [suggestedBadges, setSuggestedBadges] = useState([]);

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

  const showAiFeedback = (msg) => {
    setAiNotice(msg);
    setTimeout(() => setAiNotice(""), 4000);
  };

  // Helper context for AI requests
  const getContext = () => ({
    title,
    description,
    badges,
    features,
  });

  // 1. AI Enhance Title
  const handleAiTitle = async () => {
    if (!title.trim() && !description.trim()) {
      alert("Please write a rough title or description first so Gemini can enhance it.");
      return;
    }
    setAiLoadingField("title");
    try {
      const res = await enhanceProjectWithAI({
        type: "title",
        text: title || description,
        context: getContext(),
      });
      if (res.enhancedText) {
        setTitle(res.enhancedText);
        showAiFeedback("✨ Title polished by Gemini AI!");
      }
    } catch (err) {
      alert("AI Title enhancement failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

  // 2. AI Enhance Description (Overview)
  const handleAiDescription = async (tone = "professional") => {
    if (!description.trim() && !title.trim()) {
      alert("Please write a rough overview or title first so Gemini can enhance it.");
      return;
    }
    setAiLoadingField("description");
    try {
      const res = await enhanceProjectWithAI({
        type: "description",
        text: description || title,
        context: getContext(),
        tone,
      });
      if (res.enhancedText) {
        setDescription(res.enhancedText);
        showAiFeedback("✨ Project Overview synthesized by Gemini AI!");
      }
    } catch (err) {
      alert("AI Description enhancement failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

  // 3. AI Enhance Single Feature Bullet Point
  const handleAiFeatureBullet = async (index) => {
    const currentFeat = features[index];
    if (!currentFeat?.description?.trim() && !currentFeat?.title?.trim()) {
      alert("Please enter a rough feature description first.");
      return;
    }
    setAiLoadingField(`feat_${index}`);
    try {
      const res = await enhanceProjectWithAI({
        type: "feature_desc",
        text: currentFeat.description || currentFeat.title,
        context: getContext(),
      });
      if (res.enhancedText) {
        const updated = [...features];
        updated[index] = {
          title: res.suggestedTitle || currentFeat.title || "Key Feature",
          description: res.enhancedText,
        };
        setFeatures(updated);
        showAiFeedback("✨ Feature bullet point enhanced with technical impact!");
      }
    } catch (err) {
      alert("AI Feature enhancement failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

  // 4. AI Generate 3-5 Features from Project Context
  const handleAiGenerateFeatures = async () => {
    if (!title.trim() && !description.trim()) {
      alert("Please provide a Project Title or Description first so Gemini knows what features to generate.");
      return;
    }
    setAiLoadingField("features_gen");
    try {
      const res = await enhanceProjectWithAI({
        type: "suggest_features",
        text: `${title}: ${description}`,
        context: getContext(),
      });
      if (res.features?.length > 0) {
        setFeatures((prev) => [...prev, ...res.features]);
        showAiFeedback(`✨ Generated ${res.features.length} key feature highlights with Gemini AI!`);
      }
    } catch (err) {
      alert("AI Feature generation failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

  // 5. AI Suggest Tech Badges
  const handleAiSuggestBadges = async () => {
    if (!title.trim() && !description.trim()) {
      alert("Please write a project title or description first.");
      return;
    }
    setAiLoadingField("badges_gen");
    try {
      const res = await enhanceProjectWithAI({
        type: "suggest_badges",
        text: `${title}: ${description}`,
        context: getContext(),
      });
      if (res.badges?.length > 0) {
        // Filter out already existing badges
        const newBadges = res.badges.filter((b) => !badges.includes(b));
        setSuggestedBadges(newBadges);
        showAiFeedback(`✨ Suggested ${newBadges.length} tech badges! Click any badge to add.`);
      }
    } catch (err) {
      alert("AI Badge suggestion failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

  const addSuggestedBadge = (b) => {
    if (!badges.includes(b)) {
      setBadges([...badges, b]);
      setSuggestedBadges(suggestedBadges.filter((item) => item !== b));
    }
  };

  // 6. AI Auto-Categorize Tech Stack Architecture
  const handleAiCategorizeTechStack = async () => {
    if (badges.length === 0 && !description.trim()) {
      alert("Please add some tech badges or write a description first.");
      return;
    }
    setAiLoadingField("tech_gen");
    try {
      const res = await enhanceProjectWithAI({
        type: "categorize_tech_stack",
        text: badges.join(", ") + " " + description,
        context: getContext(),
      });
      if (res.techStack?.length > 0) {
        setTechStack(res.techStack);
        showAiFeedback(`✨ Architecture categorized into ${res.techStack.length} technology groups!`);
      }
    } catch (err) {
      alert("AI Tech Stack categorization failed: " + err.message);
    } finally {
      setAiLoadingField(null);
    }
  };

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
    <form onSubmit={handleSubmit} className="max-w-full space-y-5 text-xs">
      {/* AI Floating Feedback Notification */}
      {aiNotice && (
        <div className="sticky top-2 z-30 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-900/90 border border-indigo-500/40 text-indigo-200 text-xs px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-md flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2 font-medium">
            <span className="animate-spin text-sm">✨</span> {aiNotice}
          </span>
          <button type="button" onClick={() => setAiNotice("")} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3.5 py-2.5">
          {error}
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TITLE INPUT WITH AI POLISH */}
      {/* ============================================================ */}
      <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-white tracking-wide">
            Project Title <span className="text-red-400">*</span>
          </label>

          <button
            type="button"
            onClick={handleAiTitle}
            disabled={aiLoadingField === "title"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium transition-all shadow-[0_0_10px_rgba(99,102,241,0.15)] disabled:opacity-50"
            title="Refine your rough title into an impactful, professional project name"
          >
            {aiLoadingField === "title" ? (
              <>
                <svg className="animate-spin h-3 w-3 text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Polishing...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>AI Polish Title</span>
              </>
            )}
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#222238] focus:border-indigo-500 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          placeholder="e.g. Creator Box – Full Stack Campaign Marketplace"
          required
        />
      </div>

      {/* ============================================================ */}
      {/* 2. DESCRIPTION (OVERVIEW) WITH AI WRITING ASSISTANT */}
      {/* ============================================================ */}
      <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-semibold text-white tracking-wide">
              Project Overview & Description <span className="text-red-400">*</span>
            </label>
            <p className="text-[10.5px] text-gray-400">
              Executive summary highlighting purpose, architecture, and business impact
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleAiDescription("professional")}
              disabled={aiLoadingField === "description"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/10 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all shadow-[0_0_10px_rgba(99,102,241,0.15)] disabled:opacity-50"
              title="Enhance sentence structure, grammar, and add technical punch with Gemini AI"
            >
              {aiLoadingField === "description" ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-indigo-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI Polish Overview</span>
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#222238] focus:border-indigo-500 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed transition-all"
          placeholder="Write your rough overview sentence here and click 'AI Polish Overview' to make it sound professional and impactful..."
          required
        />
      </div>

      {/* ============================================================ */}
      {/* 3. EXTERNAL LINK & IMAGE */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Link */}
        <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-1.5">
          <label className="block text-xs font-semibold text-white">External Link / Demo</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#222238] focus:border-indigo-500 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://example.com or github repo URL"
          />
        </div>

        {/* Image */}
        <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-1.5">
          <label className="block text-xs font-semibold text-white">
            Project Showcase Image {isEditing && "(upload to replace)"}
          </label>
          <div className="flex items-center gap-3">
            {imagePreview && (
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#1a1a2a] border border-[#2a2a3a] flex-shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <div className="border border-dashed border-[#26263e] hover:border-indigo-500/50 rounded-lg p-2 text-center transition-colors">
                <p className="text-xs text-gray-300 font-medium">{imageFile ? imageFile.name : "Choose image file"}</p>
                <p className="text-[10px] text-gray-500">PNG, JPG, WebP up to 10MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. TECH BADGES WITH AI AUTO-SUGGESTION */}
      {/* ============================================================ */}
      <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-white tracking-wide">Tech Badges</label>
            <p className="text-[10.5px] text-gray-400">Add keywords like React.js, Node.js, Zustand, AWS</p>
          </div>

          <button
            type="button"
            onClick={handleAiSuggestBadges}
            disabled={aiLoadingField === "badges_gen"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
            title="Analyze project overview and suggest relevant modern tech badges"
          >
            {aiLoadingField === "badges_gen" ? (
              <span>✨ Suggesting...</span>
            ) : (
              <>
                <span>✨</span>
                <span>AI Suggest Badges</span>
              </>
            )}
          </button>
        </div>

        {/* AI Suggested Badges Pills */}
        {suggestedBadges.length > 0 && (
          <div className="bg-[#0b0b14] border border-indigo-500/30 rounded-lg p-2.5 space-y-1.5 animate-fade-in">
            <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <span>✨</span> Gemini AI Suggested Badges (Click to add):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedBadges.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addSuggestedBadge(b)}
                  className="px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 hover:text-white text-[11px] font-medium rounded-full border border-indigo-500/40 transition-colors flex items-center gap-1"
                >
                  <span>+</span> {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
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
            className="flex-1 px-3 py-1.5 bg-[#0a0a0f] border border-[#222238] rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Type tech name and press Enter (e.g., Next.js)"
          />
          <button
            type="button"
            onClick={addBadge}
            className="px-3.5 py-1.5 bg-[#1a1a2c] hover:bg-[#24243e] text-gray-200 text-xs font-medium rounded-lg border border-[#2e2e4a] transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#161628] text-indigo-300 text-[11px] rounded-full border border-[#262640]"
            >
              {badge}
              <button
                type="button"
                onClick={() => removeBadge(i)}
                className="text-gray-400 hover:text-red-400 ml-0.5 text-xs font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. KEY FEATURES & HIGHLIGHTS WITH PER-FEATURE AI ENHANCEMENT */}
      {/* ============================================================ */}
      <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b1b2c] pb-2">
          <div>
            <label className="text-xs font-semibold text-white tracking-wide">
              Key Features & Highlights ({features.length})
            </label>
            <p className="text-[10.5px] text-gray-400">
              Detailed technical bullet points shown in project showcase
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAiGenerateFeatures}
              disabled={aiLoadingField === "features_gen"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
              title="Automatically generate 3-5 high-impact feature bullet points using Gemini AI"
            >
              {aiLoadingField === "features_gen" ? (
                <span>✨ Generating Features...</span>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI Generate 3-5 Features</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={addFeature}
              className="px-2.5 py-1 bg-[#1a1a2c] hover:bg-[#24243e] text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium border border-[#2e2e4a] transition-colors"
            >
              + Add Feature
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-[#0b0b14] border border-[#1e1e30] rounded-lg p-2.5 space-y-2 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  Feature #{i + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiFeatureBullet(i)}
                    disabled={aiLoadingField === `feat_${i}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white rounded text-[10.5px] font-medium transition-colors disabled:opacity-50"
                    title="Rewrite this bullet point to sound like an impactful engineering achievement"
                  >
                    {aiLoadingField === `feat_${i}` ? (
                      <span>✨ Enhancing...</span>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>AI Polish Bullet</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Remove feature"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateFeature(i, "title", e.target.value)}
                  className="w-full sm:w-1/3 px-3 py-1.5 bg-[#07070d] border border-[#222238] focus:border-indigo-500 rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  placeholder="Feature title (e.g. RBAC Auth)"
                />
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) => updateFeature(i, "description", e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#07070d] border border-[#222238] focus:border-indigo-500 rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Detailed description of what you implemented and the impact..."
                />
              </div>
            </div>
          ))}

          {features.length === 0 && (
            <div className="text-center py-4 text-gray-500 border border-dashed border-[#1e1e30] rounded-lg">
              <p>No features added yet.</p>
              <button
                type="button"
                onClick={handleAiGenerateFeatures}
                className="mt-1 text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                <span>✨</span> Click to Auto-Generate Features with Gemini AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. TECH STACK ARCHITECTURE WITH AI AUTO-CATEGORIZATION */}
      {/* ============================================================ */}
      <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b1b2c] pb-2">
          <div>
            <label className="text-xs font-semibold text-white tracking-wide">Tech Stack Architecture</label>
            <p className="text-[10.5px] text-gray-400">Organized into Frontend, Backend, Database, Cloud & DevOps</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAiCategorizeTechStack}
              disabled={aiLoadingField === "tech_gen"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
              title="Automatically organize tech badges and overview into clean architectural categories"
            >
              {aiLoadingField === "tech_gen" ? (
                <span>✨ Categorizing...</span>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI Auto-Categorize Stack</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={addTechStack}
              className="px-2.5 py-1 bg-[#1a1a2c] hover:bg-[#24243e] text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium border border-[#2e2e4a] transition-colors"
            >
              + Add Category
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {techStack.map((tech, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={tech.category}
                onChange={(e) => updateTechStack(i, "category", e.target.value)}
                className="w-1/3 px-3 py-1.5 bg-[#0a0a0f] border border-[#222238] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                placeholder="Category (e.g. Frontend)"
              />
              <input
                type="text"
                value={tech.items}
                onChange={(e) => updateTechStack(i, "items", e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#0a0a0f] border border-[#222238] rounded-md text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                placeholder="Items (e.g. React.js, Tailwind CSS, Vite)"
              />
              <button
                type="button"
                onClick={() => removeTechStack(i)}
                className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {techStack.length === 0 && (
            <div className="text-center py-3 text-gray-500 border border-dashed border-[#1e1e30] rounded-lg">
              <p>No tech stack categories yet.</p>
              <button
                type="button"
                onClick={handleAiCategorizeTechStack}
                className="mt-1 text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                <span>✨</span> Click to Auto-Categorize with Gemini AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. DISPLAY ORDER & ACTIVE STATUS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3 space-y-1">
          <label className="block text-xs font-semibold text-white">Display Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-[#0a0a0f] border border-[#222238] rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            min="0"
          />
        </div>

        <div className="bg-[#10101a] border border-[#1e1e30] rounded-xl p-3 space-y-1">
          <label className="block text-xs font-semibold text-white">Project Visibility</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            {isActive ? "✓ Public & Active" : "○ Hidden / Inactive"}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. FORM ACTIONS */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#1e1e2e]">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving Project...</span>
            </>
          ) : (
            <>{isEditing ? "Update Project" : "Create Project"}</>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="px-4 py-2 text-gray-400 hover:text-white text-xs font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
