"use client";

import { useEffect, useState } from "react";
import { getResume, uploadResume, deleteResume, getResumeDownloadUrl } from "@/lib/api";

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
      alert("Failed to upload: " + err.message);
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
    if (!confirm("Are you sure you want to delete the resume?")) return;
    setDeleting(true);

    try {
      await deleteResume();
      setResume(null);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Resume</h1>
        <p className="text-gray-400 text-sm mt-1">Upload and manage your resume</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Current Resume */}
        {loading ? (
          <div className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
        ) : resume ? (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">{resume.originalName}</h3>
                  <p className="text-gray-500 text-sm">
                    Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getResumeDownloadUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Upload Area */}
        <label
          className={`block cursor-pointer`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragOver
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-[#2a2a3a] hover:border-[#3a3a4a]"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-400 text-sm">Uploading...</p>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-gray-300 font-medium mb-1">
                  {resume ? "Upload new resume (replaces current)" : "Upload your resume"}
                </p>
                <p className="text-gray-500 text-sm">Drag & drop or click to browse</p>
                <p className="text-gray-600 text-xs mt-2">PDF, DOC, DOCX up to 10MB</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>
    </div>
  );
}
