import { NextRequest, NextResponse } from "next/server";
import { createPayPalToolkit } from "@/lib/paypal";
import type { DealTerms } from "@/lib/types";

type PayPalTool = {
  execute?: (
    args: Record<string, unknown>,
    options: { toolCallId: string; messages: unknown[] }
  ) => Promise<unknown>;
};

async function runPayPalTool(
  tool: PayPalTool | undefined,
  args: Record<string, unknown>
) {
  if (!tool?.execute) {
    throw new Error("PayPal Agent Toolkit tool is not available");
  }
  return tool.execute(args, { toolCallId: "dealagent", messages: [] });
}

function extractInvoiceId(createResult: unknown): string | null {
  if (typeof createResult === "string") {
    try {
      const parsed = JSON.parse(createResult) as { href?: string };
      const match = parsed.href?.match(/invoices\/([^/?]+)/);
      if (match?.[1]) return match[1];
      return createResult;
    } catch {
      const match = createResult.match(/INV[A-Z0-9-]+/);
      return match?.[0] ?? createResult;
    }
  }
  if (createResult && typeof createResult === "object") {
    const obj = createResult as Record<string, unknown>;
    if (typeof obj.id === "string") return obj.id;
    if (typeof obj.href === "string") {
      const match = obj.href.match(/invoices\/([^/?]+)/);
      if (match?.[1]) return match[1];
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deal = body.deal as DealTerms | undefined;
    const approved = Boolean(body.approved);

    if (!approved) {
      return NextResponse.json(
        { error: "Human approval required before PayPal settlement" },
        { status: 400 }
      );
    }

    if (!deal?.title || !deal?.amount || !deal?.buyerEmail) {
      return NextResponse.json({ error: "Incomplete deal terms" }, { status: 400 });
    }

    const paypalToolkit = createPayPalToolkit();
    const tools = paypalToolkit.getTools();

    const deliverables = (deal.deliverables || []).join("; ");
    const note = [
      deal.summary,
      deliverables ? `Deliverables: ${deliverables}` : "",
      deal.dueDate ? `Due: ${deal.dueDate}` : "",
      "Settled by DealAgent after human approval (agent-to-agent commerce).",
    ]
      .filter(Boolean)
      .join(" | ");

    const createArgs = {
      currency_code: deal.currency || "USD",
      note,
      reference: `dealagent-${Date.now()}`,
      invoicer_business_name: deal.sellerName || "DealAgent Seller",
      primary_recipients: [
        {
          billing_info: {
            email_address: deal.buyerEmail,
          },
        },
      ],
      items: [
        {
          name: deal.title.slice(0, 120),
          description: deal.summary?.slice(0, 200) || "Agent-negotiated freelance work",
          quantity: "1",
          unit_amount: {
            currency_code: deal.currency || "USD",
            value: Number(deal.amount).toFixed(2),
          },
          unit_of_measure: "QUANTITY",
        },
      ],
    };

    const createRaw = await runPayPalTool(
      tools.create_invoice as PayPalTool,
      createArgs
    );
    const invoiceId = extractInvoiceId(createRaw);

    let sendRaw: unknown = null;
    if (invoiceId && tools.send_invoice) {
      sendRaw = await runPayPalTool(
        tools.send_invoice as PayPalTool,
        {
          invoice_id: invoiceId,
          send_to_recipient: true,
          note: "Your DealAgent negotiated invoice is ready.",
        }
      );
    }

    const toolTrace = [
      { tool: "create_invoice", args: createArgs, result: createRaw },
      ...(invoiceId
        ? [
            {
              tool: "send_invoice",
              args: { invoice_id: invoiceId, send_to_recipient: true },
              result: sendRaw,
            },
          ]
        : []),
    ];

    const settlement = [
      "Settlement Agent executed PayPal Agent Toolkit tools in sandbox.",
      `Invoice ID: ${invoiceId || "unknown"}`,
      `Amount: ${deal.currency || "USD"} ${Number(deal.amount).toFixed(2)}`,
      `Buyer: ${deal.buyerEmail}`,
      `Title: ${deal.title}`,
      invoiceId
        ? `Sandbox invoice URL: https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`
        : "Invoice created; open PayPal sandbox invoicing to view.",
      "Human approval was required before these PayPal calls ran.",
    ].join("\n");

    return NextResponse.json({
      settlement,
      toolTrace,
      invoiceId,
      deal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
