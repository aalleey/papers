"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const ACCOUNT_TITLE = "Ali Iada";
const ACCOUNT_NUMBER = "11727901764099";
const IBAN = "PK09HABB0011727901764099";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200">
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
        <div className="font-mono font-bold text-slate-900 text-xs break-all">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
        title={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

/** HBL QR code + bank details for paying by scanning in any banking app. */
export function PaymentQr() {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
      <p className="font-bold text-slate-900">Or scan this HBL QR code ({ACCOUNT_TITLE})</p>
      <div
        role="img"
        aria-label="HBL payment QR code"
        className="mx-auto w-full max-w-[220px] rounded-xl border border-slate-300 bg-no-repeat"
        style={{
          aspectRatio: "494 / 510",
          backgroundImage: "url(/hbl-qr.jpg)",
          backgroundSize: "168.8% auto",
          backgroundPosition: "50% 33.1%",
        }}
      />
      <div className="space-y-2">
        <CopyRow label="Account number (HBL)" value={ACCOUNT_NUMBER} />
        <CopyRow label="IBAN" value={IBAN} />
      </div>
    </div>
  );
}
