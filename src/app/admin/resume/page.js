"use client";

import { useEffect, useState } from "react";
import { getResume, uploadResume, deleteResume, getResumeDownloadUrl, getImageUrl } from "@/lib/api";

export default function AdminResumePage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchResume = async () => {
    try {
      const data = await getResume();
      setResume(data);
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const data = await uploadResume(formData);
      setResume(data);
    } catch (err) {
      alert("Failed to upload resume: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    handleUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the active resume?")) return;
    setDeleting(true);

    try {
      await deleteResume();
      setResume(null);
    } catch (err) {
      alert("Failed to delete resume: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const fileUrl = resume?.filePath ? getImageUrl(resume.filePath) : null;
  const isPdf = resume?.fileName?.toLowerCase().endsWith(".pdf") || resume?.originalName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e2e] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Management</h1>
          <p className="text-gray-400 text-xs mt-0.5">Upload, inspect, and manage your active resume</p>
        </div>

        {resume && (
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2a] hover:bg-[#222233] text-gray-300 text-xs font-medium rounded-md border border-[#2a2a3a] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Fullscreen
            </a>

            <a
              href={getResumeDownloadUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-64 bg-[#111118] border border-[#1e1e2e] rounded-lg animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Upload Dropzone & Metadata */}
          <div className="space-y-4">
            {/* Active Resume Card */}
            {resume ? (
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-xs font-semibold truncate" title={resume.originalName}>
                      {resume.originalName}
                    </h3>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e2e]">
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium border border-emerald-500/20">
                    ● Active on Website
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#1a1a2a] text-gray-400 rounded-full border border-[#2a2a3a]">
                    {isPdf ? "PDF Document" : "Document File"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 text-center">
                <p className="text-gray-400 text-xs">No active resume uploaded.</p>
              </div>
            )}

            {/* Upload Zone */}
            <label
              className="block cursor-pointer"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div
                className={`border border-dashed rounded-lg p-6 text-center transition-all ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-500/5"
                    : "border-[#2a2a3a] hover:border-indigo-500/50 bg-[#111118]"
                } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-gray-400 text-xs">Uploading new resume...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-gray-200 text-xs font-semibold mb-0.5">
                      {resume ? "Replace Current Resume" : "Upload Resume File"}
                    </p>
                    <p className="text-gray-500 text-[11px]">Drag & drop or click to browse</p>
                    <p className="text-gray-600 text-[10px] mt-1.5">PDF, DOC, DOCX up to 10MB</p>
                  </>
                )}
              </div>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {/* Right Column: Live Document Preview */}
          <div className="lg:col-span-2">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 h-[580px] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e1e2e] mb-3 px-1">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Document Preview
                </span>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Open in tab ↗
                  </a>
                )}
              </div>

              <div className="flex-1 w-full rounded-md overflow-hidden bg-[#0a0a0f] border border-[#1e1e2e] flex items-center justify-center">
                {resume && fileUrl ? (
                  isPdf ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-full border-none"
                      title="Resume Preview"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <svg className="w-12 h-12 text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-white text-xs font-semibold">{resume.originalName}</p>
                        <p className="text-gray-500 text-[11px] mt-1">Direct browser preview is optimized for PDF files.</p>
                      </div>
                      <a
                        href={getResumeDownloadUrl()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        Download File to View
                      </a>
                    </div>
                  )
                ) : (
                  <div className="text-center p-6 text-gray-500 space-y-2">
                    <svg className="w-10 h-10 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs">No resume document uploaded to preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
