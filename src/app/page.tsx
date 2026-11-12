"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ChatMessage, DealTerms, NegotiateResponse } from "@/lib/types";

type SettleResponse = {
  settlement: string;
  toolTrace: { tool: string; args?: unknown; result?: unknown }[];
  invoiceId?: string;
  deal: DealTerms;
  error?: string;
};

function sandboxInvoiceUrl(invoiceId?: string) {
  if (!invoiceId) return null;
  return `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`;
}

const EXAMPLES = [
  "Need a landing page redesign for a student fintech club. Prefer clean UI, 5 days.",
  "Hire a video editor for a 60s product demo. Include captions and 2 revisions.",
  "Logo + brand kit for a campus food-delivery startup. Budget around $180.",
];

export default function Home() {
  const [brief, setBrief] = useState(EXAMPLES[0]);
  const [budget, setBudget] = useState("150");
  const [buyerEmail, setBuyerEmail] = useState("buyer@example.com");
  const [loading, setLoading] = useState<"idle" | "negotiate" | "settle">("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [deal, setDeal] = useState<DealTerms | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [settlement, setSettlement] = useState<SettleResponse | null>(null);

  const canSettle = Boolean(
    deal && agreed && loading === "idle" && !settlement
  );

  const statusLabel = useMemo(() => {
    if (loading === "negotiate") return "Agents negotiating…";
    if (loading === "settle") return "Settlement agent calling PayPal…";
    if (settlement) return "Settled via PayPal sandbox";
    if (deal) return "Deal ready — human approval required";
    return "Waiting for a work brief";
  }, [loading, settlement, deal]);

  async function onNegotiate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSettlement(null);
    setLoading("negotiate");
    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, budget, buyerEmail }),
      });
      const data = (await res.json()) as NegotiateResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Negotiation failed");
      setTranscript(data.transcript);
      setDeal(data.deal);
      setAgreed(data.agreed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Negotiation failed");
    } finally {
      setLoading("idle");
    }
  }

  async function onSettle() {
    if (!deal) return;
    setError(null);
    setLoading("settle");
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal, approved: true }),
      });
      const data = (await res.json()) as SettleResponse;
      if (!res.ok) throw new Error(data.error || "Settlement failed");
      setSettlement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Settlement failed");
    } finally {
      setLoading("idle");
    }
  }

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-5 md:px-8 md:py-10">
      <header className="rise flex flex-col gap-4 border-b border-[var(--line)] pb-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-[var(--mint)] uppercase">
          Agentic Commerce · PayPal Sandbox
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="text-4xl leading-none text-[var(--sand)] md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              DealAgent
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--fog)] md:text-base">
              Two AI agents negotiate freelance work. A human approves. PayPal
              Agent Toolkit creates the invoice and settles the deal.
            </p>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-xs text-[var(--mint)] backdrop-blur">
            <span className="pulse mr-2 inline-block h-2 w-2 rounded-full bg-[var(--mint)]" />
            {statusLabel}
          </div>
        </div>
      </header>

      <section
        className="rise grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        style={{ animationDelay: "80ms" }}
      >
        <form
          onSubmit={onNegotiate}
          className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 backdrop-blur"
        >
          <h2 className="text-sm font-semibold tracking-wide text-[var(--sand)]">
            1. Describe the work
          </h2>
          <label className="flex flex-col gap-2 text-sm text-[var(--fog)]">
            Work brief
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              className="resize-y rounded-xl border border-[var(--line)] bg-[#061216] px-3 py-3 text-[var(--foreground)] outline-none focus:border-[var(--mint)]"
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[var(--fog)]">
              Budget (USD)
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rounded-xl border border-[var(--line)] bg-[#061216] px-3 py-2.5 outline-none focus:border-[var(--mint)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--fog)]">
              Buyer email (sandbox)
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="rounded-xl border border-[var(--line)] bg-[#061216] px-3 py-2.5 outline-none focus:border-[var(--mint)]"
                required
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setBrief(ex)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--fog)] hover:border-[var(--mint)] hover:text-[var(--mint)]"
              >
                {ex.slice(0, 42)}…
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading !== "idle"}
            className="mt-1 rounded-xl bg-[var(--mint)] px-4 py-3 text-sm font-semibold text-[#042018] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading === "negotiate" ? "Negotiating…" : "Start agent negotiation"}
          </button>
        </form>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--sand)]">
              2. Agent-to-agent transcript
            </h2>
            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
              {transcript.length === 0 && (
                <p className="text-sm text-[var(--fog)]">
                  Buyer Agent and Seller Agent will appear here after negotiation.
                </p>
              )}
              {transcript.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`rounded-xl border px-3 py-3 text-sm ${
                    msg.role === "buyer"
                      ? "border-[rgba(125,224,188,0.35)] bg-[rgba(125,224,188,0.08)]"
                      : "border-[rgba(255,122,89,0.35)] bg-[rgba(255,122,89,0.08)]"
                  }`}
                >
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.16em] uppercase opacity-80">
                    {msg.role === "buyer" ? "Buyer Agent" : "Seller Agent"}
                  </p>
                  <p className="leading-relaxed text-[var(--foreground)]">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--sand)]">
              3. Human approval → PayPal settle
            </h2>
            {deal ? (
              <div className="space-y-3 text-sm text-[var(--fog)]">
                <p>
                  <span className="text-[var(--sand)]">{deal.title}</span> ·{" "}
                  {deal.currency} {deal.amount}
                </p>
                <p>{deal.summary}</p>
                <ul className="list-disc space-y-1 pl-5">
                  {deal.deliverables?.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!canSettle}
                  onClick={onSettle}
                  className="w-full rounded-xl bg-[var(--coral)] px-4 py-3 text-sm font-semibold text-[#2a0f08] transition hover:brightness-110 disabled:opacity-50"
                >
                  {settlement
                    ? "Settled — see PayPal result below"
                    : loading === "settle"
                      ? "Creating PayPal invoice…"
                      : "Approve & settle with PayPal"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--fog)]">
                Proposed deal terms will show here for your approval.
              </p>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {settlement && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--sand)]">
            4. PayPal settlement result
          </h2>
          {sandboxInvoiceUrl(settlement.invoiceId) && (
            <a
              href={sandboxInvoiceUrl(settlement.invoiceId)!}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex items-center rounded-lg border border-[var(--mint)] px-3 py-2 text-sm font-semibold text-[var(--mint)] hover:bg-[rgba(125,224,188,0.08)]"
            >
              View invoice in PayPal sandbox
            </a>
          )}
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#061216] p-4 text-sm text-[var(--fog)]">
            {settlement.settlement}
          </pre>
          {settlement.toolTrace?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-[var(--mint)] uppercase">
                Tool trace (PayPal Agent Toolkit)
              </p>
              <div className="space-y-2">
                {settlement.toolTrace.map((t, i) => (
                  <div
                    key={`${t.tool}-${i}`}
                    className="rounded-lg border border-[var(--line)] bg-[#061216] px-3 py-2 text-xs text-[var(--fog)]"
                  >
                    <span className="font-semibold text-[var(--mint)]">{t.tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <footer className="border-t border-[var(--line)] pt-4 text-xs text-[var(--fog)]">
        PayPal Agent Toolkit · AI agent negotiation · Sandbox only · Human approval
        before settlement
      </footer>
    </main>
  );
}
