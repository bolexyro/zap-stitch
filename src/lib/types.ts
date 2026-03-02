export interface BankAccount {
  id: string;
  name: string;
  shortName: string;
  balance: number;
  accountNumber: string;
  color: string;
  icon: string; // Lucide icon name
}

export interface Recipient {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
}

export type SessionState =
  | "idle"
  | "collecting"
  | "collected"
  | "disbursing"
  | "success"
  | "partial_failure"
  | "ghost_transaction"
  | "race_condition"
  | "refund_failure";

export interface TransactionLeg {
  id: string;
  sourceAccountId: string;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded" | "ghost";
}

export interface StitchSession {
  id: string;
  targetAmount: number;
  recipientId: string;
  legs: TransactionLeg[];
  state: SessionState;
  createdAt: Date;
}

export type SimulationScenario =
  | "success"
  | "partial_failure"
  | "ghost_transaction"
  | "race_condition"
  | "refund_failure";
