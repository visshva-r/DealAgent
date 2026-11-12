import { NextResponse } from "next/server";

export async function GET() {
  const paypal = Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET)
  );
  const llm = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.OPENAI_API_KEY
  );

  return NextResponse.json({
    ok: true,
    product: "DealAgent",
    paypalConfigured: paypal,
    llmConfigured: llm,
    sandbox: true,
  });
}
