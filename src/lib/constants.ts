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
    description: "All legs succeed.",
    emoji: "✅",
  },
  partial_failure: {
    label: "Partial Failure",
    description: "One or more legs fail.",
    emoji: "⚠️",
  },
};
