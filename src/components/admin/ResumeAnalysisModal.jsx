"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeResume, applyProjectSync } from "@/lib/api";

const AI_PHASES = [
  {
    title: "Document Ingestion & Text Extraction",
    detail: "Reading resume PDF buffer and extracting structured vector text...",
    badge: "STAGE 1/5",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Activating Gemini 2.5 Flash Neural Engine",
    detail: "Dispatching multi-turn reasoning context to Google Generative AI...",
    badge: "STAGE 2/5",
    color: "from-cyan-400 to-indigo-500",
  },
  {
    title: "Deep Project Architecture Deconstruction",
    detail: "Deconstructing project blocks, technical badges, and 80+ bullet points...",
    badge: "STAGE 3/5",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Executive Overview & Tech Stack Synthesis",
    detail: "Synthesizing high-impact summaries & organizing full-stack categories...",
    badge: "STAGE 4/5",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    title: "MongoDB Schema Diff & Alignment Matrix",
    detail: "Comparing AI extraction against database records to detect exact diffs...",
    badge: "STAGE 5/5",
    color: "from-fuchsia-500 to-emerald-400",
  },
];

const TERMINAL_MESSAGES = [
  "> [KERNEL]: Ingesting PDF file stream from server disk...",
  "> [PDF_PARSE]: Extracted 17,258 characters across 5 resume pages.",
  "> [GEMINI_CORE]: Connecting to Google Generative AI API (gemini-2.5-flash)...",
  "> [AUTH]: API credentials authenticated successfully.",
  "> [PROMPT]: Dispatched structured JSON portfolio extraction schema...",
  "> [NEURAL]: Analyzing Project Details & Key Highlights...",
  "> [SYNTHESIS]: Generating 2-4 sentence executive overview for each project...",
  "> [EXTRACTOR]: Detected tech badges: React.js, Node.js, Zustand, Prisma, Flutter...",
  "> [ARCH]: Categorizing Frontend, Backend, Database, Cloud & Mobile stacks...",
  "> [COMPARE]: Fetching existing MongoDB project records for diff matrix...",
  "> [DIFF]: Calculating normalized title matches and badge set difference...",
  "> [READY]: AI structuring complete. Loading review workbench...",
];

export default function ResumeAnalysisModal({ isOpen, onClose, onSyncSuccess }) {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  // Selection states
  const [selectedNew, setSelectedNew] = useState({});
  const [selectedUpdates, setSelectedUpdates] = useState({});

  // Cinematic AI Animation States
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(10);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const terminalBoxRef = useRef(null);
  const modalBodyRef = useRef(null);

  // Stream terminal logs during loading
  useEffect(() => {
    if (!loading) return;

    let logIndex = 0;
    setTerminalLogs([TERMINAL_MESSAGES[0]]);

    const logInterval = setInterval(() => {
      logIndex++;
      if (logIndex < TERMINAL_MESSAGES.length) {
        setTerminalLogs((prev) => [...prev, TERMINAL_MESSAGES[logIndex]]);
      }
    }, 1200);

    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev < AI_PHASES.length - 1 ? prev + 1 : prev));
    }, 3800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.floor(Math.random() * 4) + 2;
      });
    }, 600);

    return () => {
      clearInterval(logInterval);
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  // Auto-scroll ONLY the terminal box without affecting parent container
  useEffect(() => {
    if (terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setAnalysisData(null);
    setCurrentPhase(0);
    setProgress(15);
    setTerminalLogs([]);
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }

    try {
      const data = await analyzeResume();
      setProgress(100);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Outer Glow Halo */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0b12] border border-[#1f1f33] rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden">
        {/* Top Cyber Ambient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 animate-pulse" />

        {/* Modal Header */}
        <div className="p-4 border-b border-[#1b1b2a] flex items-center justify-between bg-[#0e0e18]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Animated AI Core Icon */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <span className="text-base animate-pulse">✨</span>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 opacity-20 blur-sm animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Resume Project Analysis & Sync Workbench
                </h2>
                {analysisData?.engine && (
                  <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-full font-semibold border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    {analysisData.engine}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {analysisData?.resumeInfo?.fileName
                  ? `Active File: ${analysisData.resumeInfo.fileName}`
                  : "Google Gemini 2.5 Flash Neural Extraction Engine"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div ref={modalBodyRef} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* ============================================================ */}
          {/* CINEMATIC AI LOADING SCREEN */}
          {/* ============================================================ */}
          {loading ? (
            <div className="py-2 px-2 sm:px-4 space-y-4 animate-fade-in">
              {/* Central Holographic Neural Core */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Outer Rotating Nebula Rings */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer Laser Ring */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/40 animate-[spin_8s_linear_infinite]" />
                  
                  {/* Reverse Ring */}
                  <div className="absolute inset-1.5 rounded-full border border-t-cyan-400 border-r-transparent border-b-fuchsia-500 border-l-transparent animate-[spin_4s_linear_infinite_reverse]" />

                  {/* Pulsing Glow Sphere */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-600/40 to-fuchsia-500/30 blur-md animate-pulse" />

                  {/* Center AI Nucleus */}
                  <div className="relative w-14 h-14 rounded-2xl bg-[#0d0d18] border border-indigo-400/60 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center">
                    <span className="text-xl animate-bounce">⚡</span>
                    <span className="text-[7.5px] font-mono text-cyan-300 font-bold uppercase tracking-widest mt-0.5">
                      GEMINI
                    </span>
                  </div>
                </div>

                {/* Live Status Headline */}
                <div className="text-center mt-2 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                      {AI_PHASES[currentPhase]?.badge || "PROCESSING"}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {AI_PHASES[currentPhase]?.title || "Analyzing Resume Data"}
                  </h3>
                  <p className="text-[11px] text-gray-400 max-w-md mx-auto line-clamp-2">
                    {AI_PHASES[currentPhase]?.detail}
                  </p>
                </div>
              </div>

              {/* Glowing High-Tech Progress Bar */}
              <div className="space-y-1 max-w-xl mx-auto">
                <div className="flex justify-between text-[10.5px] font-mono">
                  <span className="text-gray-400">NEURAL REASONING PROGRESS</span>
                  <span className="text-cyan-400 font-bold">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#141424] rounded-full overflow-hidden p-0.5 border border-[#22223a]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Sci-Fi Live Telemetry Terminal */}
              <div className="max-w-xl mx-auto bg-[#07070d] border border-[#1b1b2d] rounded-xl p-2.5 shadow-inner font-mono text-[11px] space-y-1 overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-[#181828] text-[9.5px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE AI TELEMETRY STREAM
                  </span>
                  <span>NODE: GEMINI-2.5-FLASH</span>
                </div>
                <div ref={terminalBoxRef} className="max-h-24 overflow-y-auto space-y-1 text-gray-300 pr-1 scrollbar-thin">
                  {terminalLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed text-[10px] ${
                        idx === terminalLogs.length - 1
                          ? "text-cyan-300 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <p className="font-bold text-sm">Resume Analysis Error</p>
              </div>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={runAnalysis}
                className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                🔄 Retry Analysis with Gemini
              </button>
            </div>
          ) : successMsg ? (
            /* Success State */
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-8 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                ✓
              </div>
              <p className="font-bold text-base text-emerald-300">{successMsg}</p>
              <p className="text-xs text-gray-400">
                Your portfolio projects and database have been updated cleanly.
              </p>
            </div>
          ) : analysisData ? (
            /* ============================================================ */
            /* RESULTS WORKBENCH */
            /* ============================================================ */
            <div className="space-y-4 animate-fade-in">
              {/* Status KPI Chips */}
              <div className="flex items-center justify-between gap-2 flex-wrap bg-[#0e0e1a] border border-[#1e1e32] p-3 rounded-xl text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-[11px] font-medium">Extraction Summary:</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    + {analysisData.newProjects?.length || 0} New Projects
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-semibold border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                    ⚡ {analysisData.updatedProjects?.length || 0} Project Updates
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#161626] text-gray-400 rounded-full border border-[#26263a]">
                    ✓ {analysisData.unchangedProjects?.length || 0} Up-To-Date
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 font-mono">
                  Engine: <span className="text-indigo-400 font-semibold">{analysisData.engine || "Gemini AI"}</span>
                </div>
              </div>

              {!analysisData.hasChanges && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-lg">
                    ✓
                  </div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    All Projects Up To Date
                  </h3>
                  <p className="text-xs text-gray-300">
                    Your portfolio project database matches all data extracted from your resume.
                  </p>
                </div>
              )}

              {/* 1. NEW PROJECTS SECTION */}
              {analysisData.newProjects?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e1e32] pb-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✨</span> New Projects Identified ({analysisData.newProjects.length})
                    </h3>
                    <span className="text-[10px] text-gray-500">Select projects to import into database</span>
                  </div>

                  <div className="space-y-3">
                    {analysisData.newProjects.map((proj, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-3.5 transition-all ${
                          selectedNew[idx]
                            ? "bg-[#0f151e] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "bg-[#0c0c14] border-[#1e1e30] opacity-75"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!selectedNew[idx]}
                            onChange={() => toggleNewProject(idx)}
                            className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                          />
                          <div className="flex-1 space-y-2 min-w-0 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white font-bold text-sm tracking-wide">
                                {proj.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
                                New Project
                              </span>
                            </div>

                            {/* AI Overview Banner */}
                            <div className="bg-[#121220] border border-[#22223a] rounded-lg p-2.5 space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                                <span>✨</span> AI Synthesized Project Overview
                              </span>
                              <p className="text-gray-300 text-xs leading-relaxed">
                                {proj.description}
                              </p>
                            </div>

                            {/* Features Count Preview */}
                            {proj.features?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-gray-400">
                                  ⚡ Key Features ({proj.features.length} bullet points extracted):
                                </span>
                                <div className="max-h-24 overflow-y-auto space-y-1 bg-[#090910] p-2 rounded-lg border border-[#1a1a28]">
                                  {proj.features.map((f, fi) => (
                                    <div key={fi} className="text-[10px] text-gray-300">
                                      <span className="text-indigo-400 font-medium">• {f.title}: </span>
                                      <span className="text-gray-400">{f.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Badges */}
                            {proj.badges?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {proj.badges.map((b, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className="text-[10px] px-2 py-0.5 bg-[#161628] text-indigo-300 rounded-md border border-[#24243e]"
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
                  <div className="flex items-center justify-between border-b border-[#1e1e32] pb-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Project Details Updates Identified ({analysisData.updatedProjects.length})
                    </h3>
                    <span className="text-[10px] text-gray-500">Select fields to synchronize</span>
                  </div>

                  <div className="space-y-3">
                    {analysisData.updatedProjects.map((upd) => (
                      <div
                        key={upd.existingId}
                        className="bg-[#0c0c14] border border-[#1e1e32] rounded-xl p-3.5 space-y-2.5 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[#1a1a2c] pb-2">
                          <span className="text-white font-bold text-sm">{upd.title}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-semibold border border-amber-500/30">
                            Existing DB Project
                          </span>
                        </div>

                        {/* Diffs List */}
                        <div className="space-y-2">
                          {upd.diffs?.map((diff, dIdx) => (
                            <div
                              key={dIdx}
                              className="bg-[#11111e] border border-[#202036] rounded-lg p-2.5 flex items-start gap-2.5"
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedUpdates[upd.existingId]?.[diff.field]}
                                onChange={() => toggleUpdateField(upd.existingId, diff.field)}
                                className="mt-1 accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
                              />

                              <div className="flex-1 space-y-1.5 min-w-0">
                                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                                  <span>⚡</span> {diff.fieldName}
                                </span>

                                {diff.field === "badges" && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    <span className="text-[10px] text-gray-500">Adding:</span>
                                    {diff.addedItems?.map((item, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-medium"
                                      >
                                        + {item}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {diff.field === "description" && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                    <div className="bg-red-500/5 border border-red-500/20 p-2.5 rounded-lg text-red-300">
                                      <span className="block text-[9px] text-red-400 font-bold uppercase mb-0.5">
                                        Current Overview in DB:
                                      </span>
                                      <p className="line-clamp-4">{diff.oldValue}</p>
                                    </div>
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-300">
                                      <span className="block text-[9px] text-emerald-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                                        <span>✨</span> AI Generated Overview:
                                      </span>
                                      <p className="line-clamp-4">{diff.newValue}</p>
                                    </div>
                                  </div>
                                )}

                                {diff.field === "features" && (
                                  <div className="text-[11px] text-gray-300 pt-1 space-y-1">
                                    <p className="text-gray-400 text-[10px]">
                                      Syncing <span className="text-emerald-400 font-semibold">{Array.isArray(diff.newValue) ? diff.newValue.length : 0} detailed bullet points</span> as Key Features:
                                    </p>
                                    <div className="max-h-32 overflow-y-auto space-y-1 bg-[#090910] p-2 rounded-lg border border-[#1a1a28]">
                                      {Array.isArray(diff.newValue) &&
                                        diff.newValue.map((f, fi) => (
                                          <div key={fi} className="text-[10px] text-gray-300 leading-relaxed">
                                            <span className="text-indigo-400 font-medium">• {f.title}: </span>
                                            <span className="text-gray-400">{f.description}</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {diff.field === "techStack" && (
                                  <div className="text-[11px] text-gray-300 pt-1">
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(diff.newValue) &&
                                        diff.newValue.map((t, ti) => (
                                          <span
                                            key={ti}
                                            className="text-[10px] px-2 py-0.5 bg-[#161628] text-indigo-300 rounded border border-[#26263e]"
                                          >
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
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#1b1b2a] bg-[#0e0e18]/90 backdrop-blur-md flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono">
            {totalApprovedActions > 0 ? (
              <span className="text-indigo-300 font-medium">
                ⚡ {totalApprovedActions} change(s) selected
              </span>
            ) : (
              <span>No changes selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-gray-400 hover:text-white text-xs font-medium rounded-lg transition-colors"
            >
              Close
            </button>

            {analysisData?.hasChanges && (
              <button
                type="button"
                onClick={handleApplySync}
                disabled={applying || totalApprovedActions === 0}
                className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-1.5"
              >
                {applying ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Applying Sync Matrix...
                  </>
                ) : (
                  <>✨ Apply Selected Changes ({totalApprovedActions})</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
