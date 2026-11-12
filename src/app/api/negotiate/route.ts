import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/llm";
import type { ChatMessage, DealTerms, NegotiateResponse } from "@/lib/types";

const DealSchema = z.object({
  title: z.string(),
  summary: z.string(),
  amount: z.string().describe("Numeric amount as string, e.g. 150.00"),
  currency: z.string().default("USD"),
  buyerEmail: z.string(),
  sellerName: z.string(),
  deliverables: z.array(z.string()),
  dueDate: z.string().optional(),
  agreed: z.boolean(),
  buyerOpening: z.string(),
  sellerReply: z.string(),
  buyerClose: z.string(),
  sellerClose: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brief = String(body.brief || "").trim();
    const budget = String(body.budget || "").trim();
    const buyerEmail = String(body.buyerEmail || "buyer@example.com").trim();

    if (!brief) {
      return NextResponse.json({ error: "Work brief is required" }, { status: 400 });
    }

    const model = getModel();

    const { object: output } = await generateObject({
      model,
      schema: DealSchema,
      system: `You simulate agent-to-agent commerce negotiation for freelance/gig work.
Roleplay TWO agents:
1) Buyer Agent — represents the client hiring for work.
2) Seller Agent — represents the freelancer/provider.
They must reach a concrete paid deal suitable for a PayPal invoice.
Keep dialogue short, professional, and specific.
Prefer USD. Amount must be a realistic number from the brief/budget.
buyerEmail should be: ${buyerEmail}
If budget is provided, stay near it.`,
      prompt: `Negotiate and finalize a deal.
Brief: ${brief}
Budget hint: ${budget || "not specified"}
Return opening/replies and final agreed terms.`,
    });

    const transcript: ChatMessage[] = [
      { role: "buyer", text: output.buyerOpening },
      { role: "seller", text: output.sellerReply },
      { role: "buyer", text: output.buyerClose },
      { role: "seller", text: output.sellerClose },
    ];

    const deal: DealTerms = {
      title: output.title,
      summary: output.summary,
      amount: output.amount,
      currency: output.currency || "USD",
      buyerEmail: output.buyerEmail || buyerEmail,
      sellerName: output.sellerName,
      deliverables: output.deliverables,
      dueDate: output.dueDate,
    };

    const payload: NegotiateResponse = {
      transcript,
      deal,
      agreed: output.agreed,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
