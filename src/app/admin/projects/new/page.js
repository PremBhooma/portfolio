"use client";

import ProjectForm from "@/components/admin/ProjectForm";
import { createProject } from "@/lib/api";

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Project</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new portfolio project</p>
      </div>
      <ProjectForm onSubmit={(formData) => createProject(formData)} />
    </div>
  );
}
