"use client";

import React, { useState, useEffect } from "react";
import { Subject, Course } from "@/lib/types";
import { Plus, Edit2, Trash2, Book, Check, X, AlertCircle } from "lucide-react";

export default function SubjectsAdminPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjRes, coursesRes] = await Promise.all([
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/courses").then((r) => r.json()),
      ]);

      if (subjRes.subjects) setSubjects(subjRes.subjects);
      if (coursesRes.courses) setCourses(coursesRes.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartAdd = () => {
    setEditingSubject(null);
    setName("");
    setNameUr("");
    setCourseId(courses[0]?.id || "");
    setError(null);
    setIsAdding(true);
  };

  const handleStartEdit = (s: Subject) => {
    setIsAdding(false);
    setEditingSubject(s);
    setName(s.name);
    setNameUr(s.name_ur || "");
    setCourseId(s.course_id);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingSubject(null);
    setName("");
    setNameUr("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseId) {
      setError("Subject name and Course are required");
      return;
    }

    try {
      if (editingSubject) {
        const res = await fetch("/api/subjects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSubject.id, name, name_ur: nameUr, course_id: courseId }),
        });
        if (!res.ok) throw new Error("Failed to update subject");
      } else {
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, name_ur: nameUr, course_id: courseId }),
        });
        if (!res.ok) throw new Error("Failed to create subject");
      }

      handleCancel();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving subject";
      setError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Book className="w-6 h-6 text-emerald-600" />
            <span>Subjects Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage course subjects with English and Urdu titles (e.g., Mathematics / ریاضی).
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingSubject) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingSubject ? `Edit Subject: ${editingSubject.name}` : "Create New Subject"}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Subject Name (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mathematics"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-right font-urdu text-sm">
                مضمون کا نام (اردو)
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameUr}
                onChange={(e) => setNameUr(e.target.value)}
                placeholder="مثال: ریاضی"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {courses.map((cr) => (
                  <option key={cr.id} value={cr.id}>
                    {cr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
            >
              Save Subject
            </button>
          </div>
        </form>
      )}

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4 text-right">مضمون (اردو)</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.map((s) => {
                const cr = courses.find((x) => x.id === s.course_id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-3.5 px-4 font-urdu text-base text-right text-slate-700">
                      {s.name_ur || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{cr?.name || "-"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
