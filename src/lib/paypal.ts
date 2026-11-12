import { PayPalAgentToolkit } from "@paypal/agent-toolkit/ai-sdk";

export function createPayPalToolkit() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local (sandbox app credentials)"
    );
  }

  return new PayPalAgentToolkit({
    clientId,
    clientSecret,
    configuration: {
      actions: {
        invoices: {
          create: true,
          list: true,
          send: true,
          sendReminder: true,
          cancel: true,
          generateQRC: true,
        },
        orders: { create: true, get: true },
        products: { create: true, list: true, update: true },
        disputes: { list: true, get: true },
      },
      context: {
        sandbox: true,
      },
    },
  });
}
