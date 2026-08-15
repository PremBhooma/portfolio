"use client";

import { useState, useEffect } from "react";
import { analyzeResume, applyProjectSync } from "@/lib/api";

export default function ResumeAnalysisModal({ isOpen, onClose, onSyncSuccess }) {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  // Selection states
  const [selectedNew, setSelectedNew] = useState({}); // { [index]: boolean }
  const [selectedUpdates, setSelectedUpdates] = useState({}); // { [existingId]: { [field]: boolean } }

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setAnalysisData(null);

    try {
      const data = await analyzeResume();
      setAnalysisData(data);

      // Pre-select all detected new projects
      const newSel = {};
      data.newProjects?.forEach((_, idx) => {
        newSel[idx] = true;
      });
      setSelectedNew(newSel);

      // Pre-select all diff fields for updated projects
      const updateSel = {};
      data.updatedProjects?.forEach((upd) => {
        const fieldSel = {};
        upd.diffs?.forEach((diff) => {
          fieldSel[diff.field] = true;
        });
        updateSel[upd.existingId] = fieldSel;
      });
      setSelectedUpdates(updateSel);
    } catch (err) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleNewProject = (idx) => {
    setSelectedNew((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleUpdateField = (existingId, field) => {
    setSelectedUpdates((prev) => ({
      ...prev,
      [existingId]: {
        ...(prev[existingId] || {}),
        [field]: !prev[existingId]?.[field],
      },
    }));
  };

  const selectedNewCount = Object.values(selectedNew).filter(Boolean).length;
  const selectedUpdateCount = Object.values(selectedUpdates).reduce((acc, fields) => {
    const activeFields = Object.values(fields).filter(Boolean).length;
    return acc + (activeFields > 0 ? 1 : 0);
  }, 0);

  const totalApprovedActions = selectedNewCount + selectedUpdateCount;

  const handleApplySync = async () => {
    if (totalApprovedActions === 0) {
      alert("Please select at least one new project or update to apply.");
      return;
    }

    setApplying(true);
    setError("");

    try {
      // Build payload
      const approvedNewProjects = (analysisData.newProjects || []).filter(
        (_, idx) => selectedNew[idx]
      );

      const approvedUpdatedProjects = (analysisData.updatedProjects || [])
        .map((upd) => {
          const fieldsObj = selectedUpdates[upd.existingId] || {};
          const selectedFields = Object.keys(fieldsObj).filter((k) => fieldsObj[k]);
          if (selectedFields.length === 0) return null;
          return {
            existingId: upd.existingId,
            selectedFields,
            extractedProject: upd.extractedProject,
          };
        })
        .filter(Boolean);

      const res = await applyProjectSync({
        approvedNewProjects,
        approvedUpdatedProjects,
      });

      setSuccessMsg(res.message || "Project changes applied successfully!");
      setTimeout(() => {
        if (onSyncSuccess) onSyncSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to apply project sync.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between bg-[#14141f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Resume Project Analysis & Sync Workbench</h2>
                {analysisData?.engine && (
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold border border-indigo-500/30">
                    ✨ {analysisData.engine}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {analysisData?.resumeInfo?.fileName
                  ? `Analyzed: ${analysisData.resumeInfo.fileName}`
                  : "Intelligent Extraction & Comparison"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-gray-300 font-medium">Reading resume PDF & running project comparison engine...</p>
              <p className="text-[11px] text-gray-500">Scanning for new projects, tech badges, and updated descriptions</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-md p-4 space-y-2">
              <p className="font-semibold">Analysis Failed</p>
              <p>{error}</p>
              <button
                onClick={runAnalysis}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          ) : successMsg ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-md p-6 text-center space-y-2">
              <span className="text-2xl">✓</span>
              <p className="font-bold text-sm text-emerald-300">{successMsg}</p>
              <p className="text-[11px] text-gray-400">Your Project Module has been updated cleanly.</p>
            </div>
          ) : analysisData ? (
            <>
              {/* Status KPI Chips */}
              <div className="flex items-center gap-2 flex-wrap bg-[#0a0a0f] border border-[#1e1e2e] p-2.5 rounded-lg text-xs">
                <span className="text-gray-400">Extraction Results:</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium border border-emerald-500/20">
                  + {analysisData.newProjects?.length || 0} New Projects
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-medium border border-amber-500/20">
                  ⚡ {analysisData.updatedProjects?.length || 0} Project Updates
                </span>
                <span className="px-2 py-0.5 bg-[#1a1a2a] text-gray-400 rounded-full border border-[#2a2a3a]">
                  ✓ {analysisData.unchangedProjects?.length || 0} Up-To-Date
                </span>
              </div>

              {!analysisData.hasChanges && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-lg">
                    ✓
                  </div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    No Project Updates Required
                  </h3>
                  <p className="text-xs text-gray-300">
                    Your uploaded resume matches your Project Module completely! All projects, badges, and details are up to date.
                  </p>
                </div>
              )}

              {/* 1. NEW PROJECTS SECTION */}
              {analysisData.newProjects?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-1.5">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>+</span> New Projects Identified ({analysisData.newProjects.length})
                    </h3>
                    <span className="text-[10px] text-gray-500">Review & select to import into database</span>
                  </div>

                  <div className="space-y-2.5">
                    {analysisData.newProjects.map((proj, idx) => (
                      <div
                        key={idx}
                        className={`bg-[#0d0d14] border rounded-lg p-3 transition-all ${
                          selectedNew[idx]
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "border-[#1e1e2e] opacity-75"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!selectedNew[idx]}
                            onChange={() => toggleNewProject(idx)}
                            className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                          />
                          <div className="flex-1 space-y-1.5 min-w-0 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white font-bold text-xs">{proj.title}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-medium">
                                New Project
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">{proj.description}</p>

                            {proj.badges?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {proj.badges.map((b, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-indigo-300 rounded-full border border-[#2a2a3a]"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}

                            {proj.link && (
                              <p className="text-[10px] text-indigo-400 font-mono">
                                🔗 {proj.link}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. UPDATED PROJECTS SECTION */}
              {analysisData.updatedProjects?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-1.5">
                    <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Project Details Updates Identified ({analysisData.updatedProjects.length})
                    </h3>
                    <span className="text-[10px] text-gray-500">Compare diffs and selectively apply</span>
                  </div>

                  <div className="space-y-3">
                    {analysisData.updatedProjects.map((upd) => (
                      <div
                        key={upd.existingId}
                        className="bg-[#0d0d14] border border-[#1e1e2e] rounded-lg p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-2">
                          <span className="text-white font-bold">{upd.title}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-medium">
                            Existing DB Match
                          </span>
                        </div>

                        {/* Diffs List */}
                        <div className="space-y-2">
                          {upd.diffs?.map((diff, dIdx) => (
                            <div
                              key={dIdx}
                              className="bg-[#111118] border border-[#1e1e2e] rounded-md p-2.5 flex items-start gap-2.5"
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedUpdates[upd.existingId]?.[diff.field]}
                                onChange={() => toggleUpdateField(upd.existingId, diff.field)}
                                className="mt-1 accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                              />

                              <div className="flex-1 space-y-1 min-w-0">
                                <span className="text-[11px] font-semibold text-amber-300">
                                  {diff.fieldName}
                                </span>

                                {diff.field === "badges" && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    <span className="text-[10px] text-gray-500">Adding:</span>
                                    {diff.addedItems?.map((item, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30"
                                      >
                                        + {item}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {diff.field === "description" && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                    <div className="bg-red-500/5 border border-red-500/20 p-2 rounded text-red-300">
                                      <span className="block text-[9px] text-red-400 font-bold uppercase mb-0.5">Current DB:</span>
                                      {diff.oldValue}
                                    </div>
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 rounded text-emerald-300">
                                      <span className="block text-[9px] text-emerald-400 font-bold uppercase mb-0.5">AI Generated Overview:</span>
                                      {diff.newValue}
                                    </div>
                                  </div>
                                )}

                                {diff.field === "features" && (
                                  <div className="text-[11px] text-gray-300 pt-1 space-y-1">
                                    <p className="text-gray-400 text-[10px]">
                                      Syncing <span className="text-emerald-400 font-semibold">{Array.isArray(diff.newValue) ? diff.newValue.length : 0} detailed bullet points</span> as Key Features:
                                    </p>
                                    <div className="max-h-32 overflow-y-auto space-y-1 bg-[#0a0a0f] p-2 rounded border border-[#1e1e2e]">
                                      {Array.isArray(diff.newValue) && diff.newValue.map((f, fi) => (
                                        <div key={fi} className="text-[10px] text-gray-300 leading-relaxed">
                                          <span className="text-indigo-400 font-medium">• {f.title}: </span>
                                          <span className="text-gray-400">{f.description?.slice(0, 100)}{f.description?.length > 100 ? "..." : ""}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {diff.field === "techStack" && (
                                  <div className="text-[11px] text-gray-300 pt-1">
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(diff.newValue) && diff.newValue.map((t, ti) => (
                                        <span key={ti} className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-indigo-300 rounded border border-[#2a2a3a]">
                                          <strong className="text-gray-400">{t.category}:</strong> {t.items}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {diff.field === "link" && (
                                  <div className="text-[11px] text-gray-300">
                                    <span className="text-gray-500">Update Link to: </span>
                                    <span className="text-indigo-400 font-mono">{diff.newValue}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#1e1e2e] bg-[#14141f] flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {totalApprovedActions > 0 ? (
              <span className="text-indigo-400 font-medium">
                {totalApprovedActions} change(s) selected for sync
              </span>
            ) : (
              <span>No changes selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-400 hover:text-white text-xs font-medium rounded-md transition-colors"
            >
              Close
            </button>

            {analysisData?.hasChanges && (
              <button
                type="button"
                onClick={handleApplySync}
                disabled={applying || totalApprovedActions === 0}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                {applying ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Applying Sync...
                  </>
                ) : (
                  <>Apply Selected Changes ({totalApprovedActions})</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
