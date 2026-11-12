export type AgentRole = "buyer" | "seller";

export type ChatMessage = {
  role: AgentRole | "system" | "human";
  text: string;
};

export type DealTerms = {
  title: string;
  summary: string;
  amount: string;
  currency: string;
  buyerEmail: string;
  sellerName: string;
  deliverables: string[];
  dueDate?: string;
};

export type NegotiateResponse = {
  transcript: ChatMessage[];
  deal: DealTerms;
  agreed: boolean;
};
