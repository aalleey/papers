"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, ShieldCheck, Building2, MessageCircle } from "lucide-react";

export const HBL_ACCOUNT_TITLE = "Ali Iada";
export const HBL_ACCOUNT_NUMBER = "11727901764099";
export const HBL_IBAN = "PK09HABB0011727901764099";
export const OFFICIAL_WHATSAPP = "03473576122";
export const OFFICIAL_WHATSAPP_INTL = "923473576122";

function CopyDetailRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 hover:bg-white border border-slate-200/90 hover:border-emerald-300 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] transition-all">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          {badge && (
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase">
              {badge}
            </span>
          )}
        </div>
        <div className="font-mono font-black text-slate-900 text-xs sm:text-sm tracking-tight break-all mt-0.5">
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
          copied
            ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
            : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80"
        }`}
        title={`Copy ${label}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

/** Premium HBL QR Code + Bank Details + Official WhatsApp Payment Card */
export function PaymentQr({ amount = "2,000" }: { amount?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 border border-emerald-400/30 shadow-[0_24px_60px_-15px_rgba(6,95,70,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)] space-y-5">
      {/* Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-teal-400/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Header Strip */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
            <QrCode className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
              Official HBL &amp; Raast QR Payment
            </span>
            <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
              Scan to Pay &bull; {HBL_ACCOUNT_TITLE}
            </h4>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 text-xs font-black">
          <span>Rs. {amount}</span>
        </span>
      </div>

      {/* Centered Framed QR Code Showcase */}
      <div className="relative flex flex-col items-center">
        <div className="p-3 rounded-3xl bg-white shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] border-4 border-emerald-400/40">
          <div
            role="img"
            aria-label="HBL payment QR code for Ali Iada"
            className="w-48 sm:w-52 rounded-2xl bg-no-repeat mx-auto"
            style={{
              aspectRatio: "494 / 510",
              backgroundImage: "url(/hbl-qr.jpg)",
              backgroundSize: "168.8% auto",
              backgroundPosition: "50% 33.1%",
            }}
          />
        </div>
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-emerald-200">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>HBL / Any Bank App / JazzCash / Easypaisa QR</span>
        </div>
      </div>

      {/* Copyable Bank Account & IBAN Rows */}
      <div className="relative space-y-2.5 text-slate-900">
        <CopyDetailRow label="Account Title" value={HBL_ACCOUNT_TITLE} badge="HBL Bank" />
        <CopyDetailRow label="HBL Account Number" value={HBL_ACCOUNT_NUMBER} />
        <CopyDetailRow label="IBAN Number" value={HBL_IBAN} />
      </div>

      {/* Official WhatsApp 03473576122 Highlight Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25 border border-emerald-400/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official WhatsApp for Buy &amp; Payment Receipt</span>
          </div>
          <div className="font-mono text-base sm:text-lg font-black text-white tracking-wide">
            {OFFICIAL_WHATSAPP}
          </div>
        </div>
        <a
          href={`https://wa.me/${OFFICIAL_WHATSAPP_INTL}?text=${encodeURIComponent(
            `Assalam-o-Alaikum, I want to buy the PaperWala subscription (Rs. ${amount}). Sending my payment screenshot here.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 transition-all shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>WhatsApp {OFFICIAL_WHATSAPP}</span>
        </a>
      </div>

      <div className="relative flex items-center justify-center gap-1.5 text-[11px] text-slate-300/90 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Instant activation once you send your payment screenshot on WhatsApp {OFFICIAL_WHATSAPP}</span>
      </div>
    </div>
  );
}
