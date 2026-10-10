"use client";

import React, { useState, useEffect } from "react";
import { Board } from "@/lib/types";
import { Plus, Edit2, Trash2, Globe2, Check, X, AlertCircle } from "lucide-react";

export default function BoardsAdminPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/boards").then((r) => r.json());
      if (res.boards) setBoards(res.boards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleStartAdd = () => {
    setEditingBoard(null);
    setName("");
    setNameUr("");
    setError(null);
    setIsAdding(true);
  };

  const handleStartEdit = (b: Board) => {
    setIsAdding(false);
    setEditingBoard(b);
    setName(b.name);
    setNameUr(b.name_ur || "");
    setError(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBoard(null);
    setName("");
    setNameUr("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Board name in English is required");
      return;
    }

    try {
      if (editingBoard) {
        // Update
        const res = await fetch("/api/boards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBoard.id, name, name_ur: nameUr }),
        });
        if (!res.ok) throw new Error("Failed to update board");
      } else {
        // Create
        const res = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, name_ur: nameUr }),
        });
        if (!res.ok) throw new Error("Failed to create board");
      }

      handleCancel();
      loadBoards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving board";
      setError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this board?")) return;
    try {
      await fetch(`/api/boards?id=${id}`, { method: "DELETE" });
      loadBoards();
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
            <Globe2 className="w-6 h-6 text-emerald-600" />
            <span>Educational Boards</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Pakistani examination boards (Punjab, Federal, KPK, Sindh, etc.) with bilingual names.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Board</span>
        </button>
      </div>

      {/* Form Drawer / Box (if adding or editing) */}
      {(isAdding || editingBoard) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingBoard ? `Edit Board: ${editingBoard.name}` : "Create New Board"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Board Name (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Punjab Board"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-urdu text-sm text-right">
                بورڈ کا نام (اردو)
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameUr}
                onChange={(e) => setNameUr(e.target.value)}
                placeholder="مثال: پنجاب بورڈ"
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
              Save Board
            </button>
          </div>
        </form>
      )}

      {/* Boards Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Board Name (English)</th>
                <th className="py-3 px-4 text-right">بورڈ کا نام (اردو)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {boards.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{b.name}</td>
                  <td className="py-3.5 px-4 font-urdu text-base text-right text-slate-700">
                    {b.name_ur || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Edit Board"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Board"
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
