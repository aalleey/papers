"use client";

import React, { useState, useEffect } from "react";
import { Course, Board, ClassItem } from "@/lib/types";
import { Plus, Edit2, Trash2, GraduationCap, Check, X, AlertCircle } from "lucide-react";

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState("");
  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, boardsRes, classesRes] = await Promise.all([
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/boards").then((r) => r.json()),
        fetch("/api/classes").then((r) => r.json()),
      ]);

      if (coursesRes.courses) setCourses(coursesRes.courses);
      if (boardsRes.boards) setBoards(boardsRes.boards);
      if (classesRes.classes) setClasses(classesRes.classes);
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
    setEditingCourse(null);
    setName("");
    setBoardId(boards[0]?.id || "");
    setClassId(classes[0]?.id || "");
    setIsActive(true);
    setError(null);
    setIsAdding(true);
  };

  const handleStartEdit = (cr: Course) => {
    setIsAdding(false);
    setEditingCourse(cr);
    setName(cr.name);
    setBoardId(cr.board_id);
    setClassId(cr.class_id);
    setIsActive(cr.is_active);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCourse(null);
    setName("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !boardId || !classId) {
      setError("Name, Board, and Class are required");
      return;
    }

    try {
      if (editingCourse) {
        const res = await fetch("/api/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCourse.id, name, board_id: boardId, class_id: classId, is_active: isActive }),
        });
        if (!res.ok) throw new Error("Failed to update course");
      } else {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, board_id: boardId, class_id: classId, is_active: isActive }),
        });
        if (!res.ok) throw new Error("Failed to create course");
      }

      handleCancel();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving course";
      setError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await fetch(`/api/courses?id=${id}`, { method: "DELETE" });
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
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            <span>Curriculum Courses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum versions within a class (e.g. "Class 10 (Old)", "10th (New) 2026-27", "9th Tech").
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingCourse) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingCourse ? `Edit Course: ${editingCourse.name}` : "Create New Course"}
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
                Course Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Class 10 (Old)"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Board *</label>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-active-check"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="is-active-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Active in question bank & curriculum selectors
            </label>
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
              Save Course
            </button>
          </div>
        </form>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Board</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {courses.map((cr) => {
                const b = boards.find((x) => x.id === cr.board_id);
                const c = classes.find((x) => x.id === cr.class_id);
                return (
                  <tr key={cr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{cr.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{b?.name || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{c?.name || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          cr.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cr.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(cr)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cr.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Course"
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
