"use client";

import React, { useRef, useState } from "react";
import { Upload, Trash2, Save, RotateCcw, Loader2, CheckCircle2, AlertTriangle, ImageIcon } from "lucide-react";
import { ClientUser, UserPaperTemplate } from "@/lib/types";
import {
  DEFAULT_PAPER_TEMPLATE,
  DEFAULT_ENG_INSTRUCTION,
  sanitizePaperTemplate,
} from "@/lib/paper-template";

interface Props {
  client: ClientUser;
  onSaved?: (template: UserPaperTemplate | null) => void;
}

// Downscale an uploaded logo so it stays small enough to store with the profile.
function resizeLogo(file: File, maxSide = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const labelCls = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 block";

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-emerald-600 shrink-0"
      />
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-5 sm:p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

export function PaperTemplateSettings({ client, onSaved }: Props) {
  const saved = client.subscription?.paperTemplate ?? null;
  const [tpl, setTpl] = useState<UserPaperTemplate>(() =>
    sanitizePaperTemplate({
      ...DEFAULT_PAPER_TEMPLATE,
      institutionName: client.academyName || "",
      ...(saved || {}),
    })
  );
  const [hasSaved, setHasSaved] = useState(Boolean(saved));
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof UserPaperTemplate>(key: K, value: UserPaperTemplate[K]) =>
    setTpl((t) => ({ ...t, [key]: value }));

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      set("logoBase64", await resizeLogo(file));
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Logo upload failed.");
    }
  };

  const save = async () => {
    setBusy("save");
    try {
      const res = await fetch("/api/auth/client/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: tpl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template.");
      setHasSaved(true);
      onSaved?.(data.template);
      flash("ok", "Template saved. All new papers will use it.");
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Failed to save template.");
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    if (!confirm("Remove your template and go back to the default paper layout?")) return;
    setBusy("reset");
    try {
      const res = await fetch("/api/auth/client/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      if (!res.ok) throw new Error("Failed to reset template.");
      setTpl(sanitizePaperTemplate({ ...DEFAULT_PAPER_TEMPLATE, institutionName: client.academyName || "" }));
      setHasSaved(false);
      onSaved?.(null);
      flash("ok", "Template reset to default.");
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Failed to reset template.");
    } finally {
      setBusy(null);
    }
  };

  const instName = tpl.institutionName || client.academyName || "Your Institution Name";

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900">My Paper Template</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {hasSaved
              ? "Active: every new paper starts from your template."
              : "Not set: papers use the default layout. Save to make this your default."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasSaved && (
            <button
              type="button"
              onClick={reset}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-rose-600 disabled:opacity-60 cursor-pointer"
            >
              {busy === "reset" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Reset to default
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-teal-600 text-white text-xs font-black shadow-md disabled:opacity-60 cursor-pointer"
          >
            {busy === "save" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save template
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${
            msg.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card title="Branding">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {tpl.logoBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tpl.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> {tpl.logoBase64 ? "Change" : "Upload"}
                  </button>
                  {tpl.logoBase64 && (
                    <button
                      type="button"
                      onClick={() => set("logoBase64", null)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-500 hover:text-rose-600 cursor-pointer"
                      title="Remove logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <label className={labelCls}>Institution / Academy name</label>
                  <input
                    className={inputCls}
                    value={tpl.institutionName}
                    maxLength={150}
                    placeholder={client.academyName || "Your Institution Name"}
                    onChange={(e) => set("institutionName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Paper banner (e.g. exam name)</label>
                  <input
                    className={inputCls}
                    value={tpl.paperTypeBanner}
                    maxLength={80}
                    onChange={(e) => set("paperTypeBanner", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Logo size ({tpl.logoSize}px)</label>
                    <input
                      type="range"
                      min={30}
                      max={140}
                      value={tpl.logoSize}
                      onChange={(e) => set("logoSize", Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Institution font ({tpl.instFontSize}px)</label>
                    <input
                      type="range"
                      min={12}
                      max={40}
                      value={tpl.instFontSize}
                      onChange={(e) => set("instFontSize", Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Layout & Language">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Header style</label>
                <select className={inputCls} value={tpl.headerStyle} onChange={(e) => set("headerStyle", e.target.value as UserPaperTemplate["headerStyle"])}>
                  <option value="style1">Punjab Boards</option>
                  <option value="style2">Federal Board (FBISE)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Language</label>
                <select className={inputCls} value={tpl.languageMode} onChange={(e) => set("languageMode", e.target.value as UserPaperTemplate["languageMode"])}>
                  <option value="Bilingual">Bilingual (English + Urdu)</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Paper size</label>
                <select className={inputCls} value={tpl.paperSize} onChange={(e) => set("paperSize", e.target.value as UserPaperTemplate["paperSize"])}>
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Print density</label>
                <select className={inputCls} value={tpl.testDensity} onChange={(e) => set("testDensity", e.target.value as UserPaperTemplate["testDensity"])}>
                  <option value="1_per_page">1 paper per page</option>
                  <option value="2_per_page">2 papers per page (landscape)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Default time allowed</label>
                <input className={inputCls} value={tpl.timeDuration} maxLength={30} onChange={(e) => set("timeDuration", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>MCQ font ({tpl.objFontSize}px)</label>
                  <input type="range" min={8} max={20} value={tpl.objFontSize} onChange={(e) => set("objFontSize", Number(e.target.value))} className="w-full accent-emerald-600" />
                </div>
                <div>
                  <label className={labelCls}>Subjective font ({tpl.subFontSize}px)</label>
                  <input type="range" min={8} max={20} value={tpl.subFontSize} onChange={(e) => set("subFontSize", Number(e.target.value))} className="w-full accent-emerald-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Paper Content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Toggle label="Show header section" checked={tpl.includeHeaderSection} onChange={(v) => set("includeHeaderSection", v)} />
              <Toggle label="Student info (name / roll no.)" checked={tpl.includeStudentSection} onChange={(v) => set("includeStudentSection", v)} />
              <Toggle label="OMR bubble sheet" checked={tpl.includeBubbleSheet} onChange={(v) => set("includeBubbleSheet", v)} />
              <Toggle label="MCQ answer key" checked={tpl.includeMcqAnswerKey} onChange={(v) => set("includeMcqAnswerKey", v)} />
              <Toggle label="Paper code" checked={tpl.includePaperCode} onChange={(v) => set("includePaperCode", v)} />
              <Toggle label="Page border" checked={tpl.includePaperBorder} onChange={(v) => set("includePaperBorder", v)} />
              <Toggle label="Bold headings only" checked={tpl.boldHeadingsOnly} onChange={(v) => set("boldHeadingsOnly", v)} />
              <Toggle label="Bold entire content" checked={tpl.entireContentBold} onChange={(v) => set("entireContentBold", v)} />
              <Toggle label="Show instructions note" checked={tpl.includeInstructions} onChange={(v) => set("includeInstructions", v)} />
              <Toggle label="Watermark" checked={tpl.includeWatermark} onChange={(v) => set("includeWatermark", v)} />
            </div>

            {tpl.includeWatermark && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Watermark type</label>
                  <select className={inputCls} value={tpl.watermarkType} onChange={(e) => set("watermarkType", e.target.value as UserPaperTemplate["watermarkType"])}>
                    <option value="text">Institution name</option>
                    <option value="image">My logo</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Opacity ({Math.round(tpl.watermarkOpacity * 100)}%)</label>
                  <input type="range" min={3} max={40} value={Math.round(tpl.watermarkOpacity * 100)} onChange={(e) => set("watermarkOpacity", Number(e.target.value) / 100)} className="w-full accent-emerald-600 mt-2" />
                </div>
              </div>
            )}

            {tpl.includeInstructions && (
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>MCQ instructions note</label>
                  <button type="button" onClick={() => set("instructionText", DEFAULT_ENG_INSTRUCTION)} className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer">
                    Use default
                  </button>
                </div>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={tpl.instructionText}
                  onChange={(e) => set("instructionText", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Live header preview */}
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-24 space-y-3">
            <Card title="Header preview">
              <div
                className="bg-white text-black border-2 border-black p-3 text-center space-y-1.5 overflow-hidden"
                style={tpl.includePaperBorder ? { outline: "2px solid #000", outlineOffset: 3 } : undefined}
              >
                {tpl.includeHeaderSection ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                        {tpl.logoBase64 && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tpl.logoBase64} alt="" style={{ height: Math.min(tpl.logoSize, 56) }} className="max-w-full object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-black uppercase leading-tight break-words"
                          style={{ fontSize: Math.min(tpl.instFontSize, 20) }}
                        >
                          {instName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                          {tpl.paperTypeBanner} &bull; {tpl.headerStyle === "style2" ? "FBISE" : "BISE"}
                        </div>
                      </div>
                      {tpl.includePaperCode && (
                        <div className="w-14 shrink-0 border border-black p-1 text-[9px] font-bold">
                          CODE
                          <div className="font-mono text-xs">3041</div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold border-t border-black pt-1">
                      <span>Time: {tpl.timeDuration}</span>
                      <span>Size: {tpl.paperSize.toUpperCase()}</span>
                    </div>
                    {tpl.includeStudentSection && (
                      <div className="text-[10px] font-semibold text-left border-t border-black pt-1">
                        Name: ________ Roll No: ______
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] text-slate-400 py-6">Header hidden</div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Preview only. Your template is applied automatically when you open the paper editor.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
