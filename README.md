# DealAgent

**Agent-to-agent commerce for freelance work — negotiate with AI, settle with PayPal.**

Built for the [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/).

## What it does

1. You describe a freelance/gig job and budget.
2. **Buyer Agent** and **Seller Agent** negotiate scope, price, and deliverables.
3. You (human) approve the deal.
4. A **Settlement Agent** uses the **PayPal Agent Toolkit** to create and send a **sandbox invoice**.

PayPal integration is central: invoices/orders are created through PayPal APIs via the official Agent Toolkit — not mocked UI.

## Stack

- Next.js (App Router)
- Vercel AI SDK + Google Gemini or OpenAI
- `@paypal/agent-toolkit` (AI SDK adapter, sandbox mode)

## Setup (judges)

### 1. Prerequisites

- Node.js 18+
- PayPal Developer sandbox app ([dashboard](https://developer.paypal.com/dashboard/))
- One LLM key: free [Google AI Studio](https://aistudio.google.com/apikey) **or** OpenAI

### 2. Install

```bash
cd dealagent
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Demo path

1. Enter a work brief + budget + a sandbox buyer email.
2. Click **Start agent negotiation**.
3. Review the dual-agent transcript and proposed deal.
4. Click **Approve & settle with PayPal**.
5. Confirm invoice/tool trace in the settlement panel (PayPal sandbox).

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## How AI + PayPal are used

| Piece | Role |
| --- | --- |
| Negotiate API | LLM produces structured A2A negotiation + deal terms |
| Settle API | LLM + PayPal Agent Toolkit tools create/send sandbox invoice |
| Human approval | Required before any PayPal settlement call |

## Security notes

- Never commit `.env.local` or real secrets.
- Sandbox only (`context.sandbox: true`).
- Human-in-the-loop before money movement.

## License

MIT — see `LICENSE`.
