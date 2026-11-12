# Submit checklist (deadline 1:30 AM IST)

Do these in parallel. Do not wait for polish.

## A. Credentials (you — now)

1. https://developer.paypal.com/dashboard/ → log in / create account
2. Apps & Credentials → **Sandbox** → Create App → copy **Client ID** + **Secret**
3. https://aistudio.google.com/apikey → create free Gemini API key
4. In `dealagent`, create `.env.local`:

```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

5. `npm run dev` → open http://localhost:3000 → run one full negotiate → approve → settle

## B. GitHub (required)

```bash
cd dealagent
gh repo create dealagent --public --source=. --remote=origin --push
```

Or create empty public repo on GitHub, then push. Ensure **LICENSE** is visible and set license in About.

## C. Devpost (submit early, edit until deadline)

1. https://paypalaihackathon.devpost.com/ → Enter a Submission
2. Paste repo URL + README description
3. Built with: PayPal, AI / Gemini, Next.js, PayPal Agent Toolkit
4. Select Agentic Commerce / PayPal+AI framing in description
5. Upload YouTube video when ready (under 3 min)

## D. Video script (~90 seconds)

1. Problem: freelancers waste time negotiating + invoicing
2. Show DealAgent dual agents negotiate
3. Human approves
4. PayPal invoice created via Agent Toolkit (show tool trace / sandbox)
5. Close: agent-to-agent commerce with human oversight

Upload to YouTube **public** immediately (processing takes time).
