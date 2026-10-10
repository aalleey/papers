"use client";

import React, { useState, useEffect } from "react";
import { Chapter, Subject } from "@/lib/types";
import { Plus, Edit2, Trash2, Layers, Check, X, AlertCircle } from "lucide-react";

export default function ChaptersAdminPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const subjRes = await fetch("/api/subjects").then((r) => r.json());
      if (subjRes.subjects?.length) {
        setSubjects(subjRes.subjects);
        const subId = selectedSubjectId || subjRes.subjects[0].id;
        setSelectedSubjectId(subId);
        const chapRes = await fetch(`/api/chapters?subjectId=${subId}`).then((r) => r.json());
        if (chapRes.chapters) setChapters(chapRes.chapters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubjectFilterChange = async (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    setLoading(true);
    try {
      const res = await fetch(`/api/chapters?subjectId=${newSubjectId}`).then((r) => r.json());
      if (res.chapters) setChapters(res.chapters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdd = () => {
    setEditingChapter(null);
    setNumber(chapters.length + 1);
    setTitle("");
    setTitleUr("");
    setSubjectId(selectedSubjectId);
    setError(null);
    setIsAdding(true);
  };

  const handleStartEdit = (ch: Chapter) => {
    setIsAdding(false);
    setEditingChapter(ch);
    setNumber(ch.number);
    setTitle(ch.title);
    setTitleUr(ch.title_ur || "");
    setSubjectId(ch.subject_id);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingChapter(null);
    setTitle("");
    setTitleUr("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || number <= 0) {
      setError("Title, valid number, and Subject are required");
      return;
    }

    try {
      if (editingChapter) {
        const res = await fetch("/api/chapters", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingChapter.id, number, title, title_ur: titleUr, subject_id: subjectId }),
        });
        if (!res.ok) throw new Error("Failed to update chapter");
      } else {
        const res = await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number, title, title_ur: titleUr, subject_id: subjectId }),
        });
        if (!res.ok) throw new Error("Failed to create chapter");
      }

      handleCancel();
      handleSubjectFilterChange(subjectId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving chapter";
      setError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      handleSubjectFilterChange(selectedSubjectId);
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
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Chapters Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage chapters for selected subjects with chapter numbers and bilingual titles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectFilterChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleStartAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {(isAdding || editingChapter) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingChapter ? `Edit Chapter ${editingChapter.number}: ${editingChapter.title}` : "Create New Chapter"}
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

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Chapter # *
              </label>
              <input
                type="number"
                min={1}
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Chapter Title (English) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quadratic Equations"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-right font-urdu text-sm">
                سبق کا عنوان (اردو)
              </label>
              <input
                type="text"
                dir="rtl"
                value={titleUr}
                onChange={(e) => setTitleUr(e.target.value)}
                placeholder="مثال: دو درجی مساواتیں"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
              />
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
              Save Chapter
            </button>
          </div>
        </form>
      )}

      {/* Chapters Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Chapter Title (English)</th>
                <th className="py-3 px-4 text-right">عنوان (اردو)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {chapters.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 w-16">Ch {ch.number}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{ch.title}</td>
                  <td className="py-3.5 px-4 font-urdu text-base text-right text-slate-700">
                    {ch.title_ur || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(ch)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Edit Chapter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ch.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
