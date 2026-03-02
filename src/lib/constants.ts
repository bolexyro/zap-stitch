export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
  packet: 1.5,
  packetStagger: 0.3,
} as const;

export const PAYSTACK = {
  name: "Paystack",
  color: "#0BA4DB",
  darkColor: "#011B33",
  label: "Paystack Virtual Account",
} as const;

export const SCENARIO_LABELS: Record<string, { label: string; description: string; emoji: string }> = {
  success: {
    label: "Success",
    description: "All legs succeed. Funds consolidate and disburse.",
    emoji: "✅",
  },
  partial_failure: {
    label: "Partial Failure",
    description: "One leg fails. Successful legs auto-refund.",
    emoji: "⚠️",
  },
  ghost_transaction: {
    label: "Ghost Transaction",
    description: "Late arrival after session expired. Auto-reversed.",
    emoji: "👻",
  },
  race_condition: {
    label: "Race Condition",
    description: "Balance drops before execution completes.",
    emoji: "🏎️",
  },
  refund_failure: {
    label: "Refund Failure",
    description: "Refund blocked. Funds held in Stitch Escrow.",
    emoji: "🔒",
  },
};
