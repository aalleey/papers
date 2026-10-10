"use client";

import React, { useState, useEffect } from "react";
import { Topic, Chapter, Subject } from "@/lib/types";
import { Plus, Edit2, Trash2, Bookmark, Check, X, AlertCircle } from "lucide-react";

export default function TopicsAdminPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const subjRes = await fetch("/api/subjects").then((r) => r.json());
      if (subjRes.subjects?.length) {
        setSubjects(subjRes.subjects);
        const subId = subjRes.subjects[0].id;
        setSelectedSubjectId(subId);

        const chapRes = await fetch(`/api/chapters?subjectId=${subId}`).then((r) => r.json());
        if (chapRes.chapters?.length) {
          setChapters(chapRes.chapters);
          const chId = chapRes.chapters[0].id;
          setSelectedChapterId(chId);

          const topRes = await fetch(`/api/topics?chapterId=${chId}`).then((r) => r.json());
          if (topRes.topics) setTopics(topRes.topics);
        }
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

  const handleSubjectChange = async (newSubId: string) => {
    setSelectedSubjectId(newSubId);
    try {
      const chapRes = await fetch(`/api/chapters?subjectId=${newSubId}`).then((r) => r.json());
      if (chapRes.chapters?.length) {
        setChapters(chapRes.chapters);
        const chId = chapRes.chapters[0].id;
        setSelectedChapterId(chId);
        const topRes = await fetch(`/api/topics?chapterId=${chId}`).then((r) => r.json());
        if (topRes.topics) setTopics(topRes.topics);
      } else {
        setChapters([]);
        setTopics([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChapterChange = async (newChapId: string) => {
    setSelectedChapterId(newChapId);
    try {
      const topRes = await fetch(`/api/topics?chapterId=${newChapId}`).then((r) => r.json());
      if (topRes.topics) setTopics(topRes.topics);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartAdd = () => {
    setEditingTopic(null);
    setNumber(topics.length + 1);
    setTitle("");
    setTitleUr("");
    setChapterId(selectedChapterId);
    setError(null);
    setIsAdding(true);
  };

  const handleStartEdit = (t: Topic) => {
    setIsAdding(false);
    setEditingTopic(t);
    setNumber(t.number);
    setTitle(t.title);
    setTitleUr(t.title_ur || "");
    setChapterId(t.chapter_id);
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTopic(null);
    setTitle("");
    setTitleUr("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chapterId || number <= 0) {
      setError("Title, valid number, and Chapter are required");
      return;
    }

    try {
      if (editingTopic) {
        const res = await fetch("/api/topics", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTopic.id, number, title, title_ur: titleUr, chapter_id: chapterId }),
        });
        if (!res.ok) throw new Error("Failed to update topic");
      } else {
        const res = await fetch("/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number, title, title_ur: titleUr, chapter_id: chapterId }),
        });
        if (!res.ok) throw new Error("Failed to create topic");
      }

      handleCancel();
      handleChapterChange(chapterId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving topic";
      setError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
      handleChapterChange(selectedChapterId);
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
            <Bookmark className="w-6 h-6 text-emerald-600" />
            <span>Topics Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage subtopics within chapters with bilingual naming.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Chapter</label>
          <select
            value={selectedChapterId}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch {ch.number}: {ch.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form */}
      {(isAdding || editingTopic) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingTopic ? `Edit Topic ${editingTopic.number}: ${editingTopic.title}` : "Create New Topic"}
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic # *</label>
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
                Topic Title (English) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solution by Factorization"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-right font-urdu text-sm">
                موضوع کا عنوان (اردو)
              </label>
              <input
                type="text"
                dir="rtl"
                value={titleUr}
                onChange={(e) => setTitleUr(e.target.value)}
                placeholder="مثال: بذریعہ تجزی حل"
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
              Save Topic
            </button>
          </div>
        </form>
      )}

      {/* Topics Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Topic Title (English)</th>
                <th className="py-3 px-4 text-right">عنوان (اردو)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topics.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 w-16">#{t.number}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{t.title}</td>
                  <td className="py-3.5 px-4 font-urdu text-base text-right text-slate-700">
                    {t.title_ur || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Edit Topic"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Topic"
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
