"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2, Plus, Printer, ReceiptText, WalletCards } from "lucide-react";
import type { ClientUser, InvoiceRecord, SubscriptionPlanId } from "@/lib/types";

type Payment = { clientId: string; clientName: string; clientEmail: string; academyName?: string | null; amount?: string; transactionRef: string; submittedAt: string; planRequested?: SubscriptionPlanId; status: string; method: string };
const money = (value: number | string) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = (value?: string | null) => value ? new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(value)) : "—";

export default function FinancePage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ clientId: "", description: "PaperWala subscription", amount: "2000", dueDate: "", notes: "", status: "draft" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      if (!res.ok) throw new Error("Could not load finance data");
      const data = await res.json();
      setClients(data.clients); setInvoices(data.invoices); setPayments(data.paymentSubmissions);
      setForm((old) => ({ ...old, clientId: old.clientId || data.clients[0]?.id || "" }));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load finance data"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totals = useMemo(() => ({
    collected: invoices.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0),
    outstanding: invoices.filter((item) => item.status === "draft" || item.status === "sent").reduce((sum, item) => sum + item.amount, 0),
    pending: payments.filter((item) => item.status === "pending_verification").length,
  }), [invoices, payments]);

  const createInvoice = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not create invoice");
      setInvoices((old) => [data.invoice, ...old]); setMessage(`Invoice ${data.invoice.invoiceNumber} created.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create invoice"); }
    finally { setSaving(false); }
  };

  const markPaid = async (invoice: InvoiceRecord) => {
    const res = await fetch("/api/admin/finance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: invoice.id, status: "paid", paymentMethod: "Raast / manual" }) });
    const data = await res.json();
    if (res.ok) { setInvoices((old) => old.map((item) => item.id === invoice.id ? data.invoice : item)); setMessage(`${invoice.invoiceNumber} marked paid.`); }
    else setMessage(data.error || "Could not update invoice");
  };

  const printInvoice = (invoice: InvoiceRecord) => {
    const popup = window.open("", "_blank", "width=800,height=900"); if (!popup) return;
    popup.document.write(`<!doctype html><html><head><title>${invoice.invoiceNumber}</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:48px;max-width:720px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:3px solid #10b981;padding-bottom:24px}h1{margin:0;color:#047857}table{width:100%;border-collapse:collapse;margin-top:32px}td,th{padding:14px;border-bottom:1px solid #dbe3ee;text-align:left}.right{text-align:right}.total{font-size:22px;font-weight:bold}.muted{color:#64748b}</style></head><body><header><div><h1>PaperWala</h1><p class="muted">Invoice / Receipt</p></div><div class="right"><b>${invoice.invoiceNumber}</b><br><span class="muted">Issued ${date(invoice.issuedAt)}</span></div></header><section><h3>Bill to</h3><b>${invoice.clientName}</b><br>${invoice.academyName || ""}<br>${invoice.clientEmail}</section><table><thead><tr><th>Description</th><th class="right">Amount</th></tr></thead><tbody><tr><td>${invoice.description}</td><td class="right">${money(invoice.amount)}</td></tr><tr><td class="total">Total</td><td class="right total">${money(invoice.amount)}</td></tr></tbody></table><p><b>Status:</b> ${invoice.status.toUpperCase()}</p>${invoice.transactionRef ? `<p><b>Transaction reference:</b> ${invoice.transactionRef}</p>` : ""}<p class="muted">Thank you for choosing PaperWala.</p><script>window.print()<\/script></body></html>`);
    popup.document.close();
  };

  return <div className="space-y-6 pb-10">
    <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
      <div className="flex items-start gap-4"><div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300"><WalletCards /></div><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Administration</p><h1 className="mt-1 text-2xl font-black">Finance &amp; Invoices</h1><p className="mt-2 text-sm text-slate-300">Track payment submissions, issue invoices, and retain a clear payment record for every educator.</p></div></div>
    </div>
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
    <div className="grid gap-4 sm:grid-cols-3">
      {[{ label: "Collected", value: money(totals.collected), icon: CheckCircle2, color: "text-emerald-600" }, { label: "Outstanding invoices", value: money(totals.outstanding), icon: ReceiptText, color: "text-amber-600" }, { label: "Payments to verify", value: totals.pending, icon: WalletCards, color: "text-indigo-600" }].map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className={`mb-3 h-5 w-5 ${color}`} /><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-[.85fr_1.4fr]">
      <form onSubmit={createInvoice} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-600"/><h2 className="font-black text-slate-900">Create invoice</h2></div><div className="space-y-3 text-sm"><label className="block font-bold text-slate-700">Educator<select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5"><option value="">Select educator</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.fullName} — {client.email}</option>)}</select></label><label className="block font-bold text-slate-700">Description<input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"/></label><div className="grid grid-cols-2 gap-3"><label className="font-bold text-slate-700">Amount (PKR)<input required min="1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"/></label><label className="font-bold text-slate-700">Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"/></label></div><label className="block font-bold text-slate-700">Notes <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5" placeholder="Optional reference"/></label><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText className="h-4 w-4"/>}{saving ? "Creating…" : "Create invoice"}</button></div></form>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-black text-slate-900">Invoices</h2><p className="text-xs text-slate-500">Print an invoice or receipt whenever you need it.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Invoice</th><th className="p-4">Educator</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading finance data…</td></tr> : invoices.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">No invoices yet.</td></tr> : invoices.map((invoice) => <tr key={invoice.id} className="border-t border-slate-100"><td className="p-4 font-bold text-slate-900">{invoice.invoiceNumber}<span className="mt-1 block text-xs font-normal text-slate-500">{date(invoice.issuedAt)}</span></td><td className="p-4"><span className="font-semibold text-slate-800">{invoice.clientName}</span><span className="block text-xs text-slate-500">{invoice.academyName || invoice.clientEmail}</span></td><td className="p-4 font-bold">{money(invoice.amount)}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : invoice.status === "void" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>{invoice.status}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={() => printInvoice(invoice)} title="Print invoice" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Printer className="h-4 w-4"/></button>{invoice.status !== "paid" && <button onClick={() => markPaid(invoice)} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100">Mark paid</button>}</div></td></tr>)}</tbody></table></div></section>
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-black text-slate-900">Submitted payments</h2><p className="text-xs text-slate-500">Payment receipts submitted by educators for your review.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Educator</th><th className="p-4">Reference</th><th className="p-4">Plan / amount</th><th className="p-4">Submitted</th><th className="p-4">State</th></tr></thead><tbody>{payments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payment submissions waiting for review.</td></tr> : payments.map((payment) => <tr key={`${payment.clientId}-${payment.transactionRef}`} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-800">{payment.clientName}<span className="block text-xs font-normal text-slate-500">{payment.academyName || payment.clientEmail}</span></td><td className="p-4 font-mono text-xs">{payment.transactionRef}</td><td className="p-4">{payment.planRequested || "Subscription"}<span className="block font-bold">{money(payment.amount || 0)}</span></td><td className="p-4 text-slate-600">{date(payment.submittedAt)}</td><td className="p-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{payment.status.replace("_", " ")}</span></td></tr>)}</tbody></table></div></section>
  </div>;
}
