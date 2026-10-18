import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InvoiceStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const admin = await getCurrentUser();
  return admin?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [clients, invoices] = await Promise.all([db.getClients(), db.getInvoices()]);
  const paymentSubmissions = clients.flatMap((client) => client.paymentSubmission ? [{
    clientId: client.id, clientName: client.fullName, clientEmail: client.email,
    academyName: client.academyName, ...client.paymentSubmission,
    status: client.subscription.status,
  }] : []).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return NextResponse.json({ clients, invoices, paymentSubmissions });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.clientId || !body.description || !Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0) {
    return NextResponse.json({ error: "Client, description, and a valid amount are required." }, { status: 400 });
  }
  const client = await db.getClientById(body.clientId);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const invoice = await db.createInvoice({
    clientId: client.id, clientName: client.fullName, clientEmail: client.email, academyName: client.academyName,
    description: String(body.description).trim(), amount: Number(body.amount), status: (body.status || "draft") as InvoiceStatus,
    dueDate: body.dueDate || null, notes: body.notes?.trim() || null,
    paidAt: body.status === "paid" ? new Date().toISOString() : null,
    paymentMethod: body.paymentMethod || null, transactionRef: body.transactionRef?.trim() || null,
  });
  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
  const status = body.status as InvoiceStatus | undefined;
  const invoice = await db.updateInvoice(body.id, {
    status, paidAt: status === "paid" ? new Date().toISOString() : body.paidAt,
    paymentMethod: body.paymentMethod, transactionRef: body.transactionRef, notes: body.notes,
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  return NextResponse.json({ invoice });
}
