"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SCENARIO_LABELS } from "@/lib/constants";
import { bankAccounts, formatNaira, sampleRecipients } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface VisualizationProps {
    targetAmount: number;
    allocations: Record<string, number>;
    recipientId: string;
    scenario: string;
}

// Phase definitions for storytelling
type Phase =
    | "intro"
    | "collecting"
    | "leg_progress"
    | "buffer_filling"
    | "buffer_full"
    | "disbursing"
    | "complete"
    | "leg_failed"
    | "refunding"
    | "refund_done"
    | "ghost_arriving"
    | "ghost_reversed"
    | "race_failed"
    | "escrow_held";

interface PhaseInfo {
    label: string;
    description: string;
}

const PHASE_TEXT: Record<string, PhaseInfo> = {
    intro: {
        label: "Initiating Stitch",
        description: "Preparing to collect funds from your linked accounts...",
    },
    collecting: {
        label: "Collecting Funds",
        description:
            "Pulling money from each source account into the Paystack Virtual Account.",
    },
    leg_progress: {
        label: "Transfer in Progress",
        description: "Each bank is processing its transfer to the virtual account.",
    },
    buffer_filling: {
        label: "Virtual Account Receiving",
        description:
            "The Paystack buffer is receiving funds. Waiting for all legs to complete.",
    },
    buffer_full: {
        label: "All Funds Collected ✓",
        description:
            "The virtual account has received the full target amount. Ready to disburse.",
    },
    disbursing: {
        label: "Disbursing Payment",
        description:
            "Sending the full amount as a single, clean transfer to the recipient.",
    },
    complete: {
        label: "Payment Complete ✓",
        description:
            "The recipient received one alert for the full amount. Clean and professional.",
    },
    leg_failed: {
        label: "Transfer Failed ✗",
        description:
            "One of the source transfers failed. The session cannot be completed.",
    },
    refunding: {
        label: "Auto-Refunding",
        description:
            "Stitch is returning the successful transfers back to their source accounts.",
    },
    refund_done: {
        label: "Refund Complete",
        description: "All funds have been safely returned to their original accounts.",
    },
    ghost_arriving: {
        label: "Stale Fund Detected ⚠",
        description:
            "A delayed transfer just arrived after the session expired. Auto-reversing...",
    },
    ghost_reversed: {
        label: "Ghost Reversed",
        description:
            "The late-arriving funds were automatically sent back. Ledger is clean.",
    },
    race_failed: {
        label: "Insufficient Balance ✗",
        description:
            "A source balance changed between allocation and execution. Transfer rejected.",
    },
    escrow_held: {
        label: "Funds in Escrow 🔒",
        description:
            "Refund to source failed. Funds are held safely in Stitch Escrow.",
    },
};

export default function MoneyFlowVisualization({
    targetAmount,
    allocations,
    recipientId,
    scenario,
}: VisualizationProps) {
    const [phase, setPhase] = useState<Phase>("intro");
    const [activeLeg, setActiveLeg] = useState(-1);
    const [collectedAmount, setCollectedAmount] = useState(0);
    const [legStatuses, setLegStatuses] = useState<
        Record<number, "pending" | "sending" | "done" | "failed" | "refunding" | "refunded" | "ghost">
    >({});
    // Track bank colors that have deposited into the buffer (for fill layers)
    const [bufferColors, setBufferColors] = useState<{ color: string; amount: number }[]>([]);
    // Track active money packets for animation
    const [packets, setPackets] = useState<
        { id: string; direction: "to-buffer" | "to-recipient" | "refund"; legIndex: number; color: string }[]
    >([]);

    const activeSources = Object.entries(allocations)
        .filter(([_, amt]) => amt > 0)
        .map(([id, amt]) => {
            const account = bankAccounts.find((a) => a.id === id)!;
            return { account, amount: amt };
        });

    const recipient = sampleRecipients.find((r) => r.id === recipientId)!;

    const isSuccess = scenario === "success";
    const isPartialFail = scenario === "partial_failure";
    const isGhost = scenario === "ghost_transaction";
    const isRace = scenario === "race_condition";
    const isRefundFail = scenario === "refund_failure";

    const failingLegIndex = activeSources.length - 1;

    // ── Orchestrate the phases ──────────────────────
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        let elapsed = 0;

        const after = (ms: number, fn: () => void) => {
            elapsed += ms;
            timers.push(setTimeout(fn, elapsed));
        };

        // Reset
        setPhase("intro");
        setActiveLeg(-1);
        setCollectedAmount(0);
        setLegStatuses({});
        setBufferColors([]);
        setPackets([]);

        // Intro
        after(1500, () => setPhase("collecting"));

        // Process each leg one by one
        activeSources.forEach((source, i) => {
            // Mark as sending + launch packet
            after(1200, () => {
                setActiveLeg(i);
                setLegStatuses((prev) => ({ ...prev, [i]: "sending" }));
                setPhase("leg_progress");
                setPackets((prev) => [
                    ...prev,
                    { id: `to-${i}`, direction: "to-buffer", legIndex: i, color: source.account.color },
                ]);
            });

            // Check scenario-specific behavior
            if (isPartialFail && i === failingLegIndex) {
                // This leg fails
                after(2000, () => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "failed" }));
                    setPhase("leg_failed");
                });
            } else if (isRace && i === 0) {
                // Race condition on first leg
                after(2000, () => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "failed" }));
                    setPhase("race_failed");
                });
            } else if (isGhost && i === failingLegIndex) {
                // Ghost leg — appears to fail, arrives later
                after(2000, () => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "failed" }));
                    setPhase("leg_failed");
                });
            } else {
                // Success — add bank color to buffer
                after(2500, () => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "done" }));
                    setCollectedAmount((prev) => prev + source.amount);
                    setBufferColors((prev) => [...prev, { color: source.account.color, amount: source.amount }]);
                    setPackets((prev) => prev.filter((p) => p.id !== `to-${i}`));
                    setPhase("buffer_filling");
                });
            }
        });

        // After all legs processed, what happens next?
        if (isSuccess) {
            after(1500, () => setPhase("buffer_full"));
            after(2000, () => {
                setPhase("disbursing");
                setPackets((prev) => [
                    ...prev,
                    { id: "disburse", direction: "to-recipient", legIndex: -1, color: "#0ba4db" },
                ]);
            });
            after(3000, () => {
                setPhase("complete");
                setPackets([]);
            });
        } else if (isPartialFail) {
            // Refund the successful legs
            after(2000, () => {
                setPhase("refunding");
                setPackets([]);
                activeSources.forEach((source, i) => {
                    if (i !== failingLegIndex) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunding" }));
                        setPackets((prev) => [
                            ...prev,
                            { id: `refund-${i}`, direction: "refund", legIndex: i, color: source.account.color },
                        ]);
                    }
                });
            });
            after(3000, () => {
                setPhase("refund_done");
                setPackets([]);
                activeSources.forEach((_, i) => {
                    if (i !== failingLegIndex) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunded" }));
                    }
                });
                setCollectedAmount(0);
                setBufferColors([]);
            });
        } else if (isGhost) {
            // Refund successful legs first
            after(2000, () => {
                setPhase("refunding");
                setPackets([]);
                activeSources.forEach((source, i) => {
                    if (i !== failingLegIndex) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunding" }));
                        setPackets((prev) => [
                            ...prev,
                            { id: `refund-${i}`, direction: "refund" as const, legIndex: i, color: source.account.color },
                        ]);
                    }
                });
            });
            after(3000, () => {
                setPackets([]);
                activeSources.forEach((_, i) => {
                    if (i !== failingLegIndex) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunded" }));
                    }
                });
                setCollectedAmount(0);
                setBufferColors([]);
                setPhase("refund_done");
            });
            // Ghost arrives late
            after(3000, () => {
                setLegStatuses((prev) => ({ ...prev, [failingLegIndex]: "ghost" }));
                setPhase("ghost_arriving");
            });
            after(3000, () => {
                setLegStatuses((prev) => ({ ...prev, [failingLegIndex]: "refunded" }));
                setPackets([]);
                setPhase("ghost_reversed");
            });
        } else if (isRace) {
            // Refund any legs that succeeded before the race condition
            after(2000, () => {
                setPhase("refunding");
                setPackets([]);
                activeSources.forEach((source, i) => {
                    if (legStatuses[i] === "done" || i !== 0) {
                        // Refund the non-failed legs
                        setLegStatuses((prev) => {
                            if (prev[i] === "done") return { ...prev, [i]: "refunding" };
                            return prev;
                        });
                        setPackets((prev) => [
                            ...prev,
                            { id: `refund-${i}`, direction: "refund", legIndex: i, color: source.account.color },
                        ]);
                    }
                });
            });
            after(3000, () => {
                setPhase("refund_done");
                setPackets([]);
                activeSources.forEach((_, i) => {
                    setLegStatuses((prev) => {
                        if (prev[i] === "refunding") return { ...prev, [i]: "refunded" };
                        return prev;
                    });
                });
                setCollectedAmount(0);
                setBufferColors([]);
            });
        } else if (isRefundFail) {
            // All legs send, then refund fails
            after(1500, () => setPhase("leg_failed"));
            after(2000, () => {
                setPhase("refunding");
                activeSources.forEach((_, i) => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "refunding" }));
                });
            });
            after(3000, () => setPhase("escrow_held"));
        }

        return () => timers.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario, JSON.stringify(allocations)]);

    // ── Layout ──────────────────────
    const fillPercent = targetAmount > 0 ? Math.min(collectedAmount / targetAmount, 1) : 0;
    const phaseInfo = PHASE_TEXT[phase] || PHASE_TEXT.intro;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done":
                return "text-green-600";
            case "failed":
                return "text-red-500";
            case "sending":
                return "text-blue-500";
            case "refunding":
                return "text-amber-500";
            case "refunded":
                return "text-muted-foreground";
            case "ghost":
                return "text-purple-500";
            default:
                return "text-muted-foreground";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return "Waiting...";
            case "sending":
                return "Sending →";
            case "done":
                return "Received ✓";
            case "failed":
                return "Failed ✗";
            case "refunding":
                return "Refunding ←";
            case "refunded":
                return "Returned ↩";
            case "ghost":
                return "Late arrival 👻";
            default:
                return "";
        }
    };

    const getBufferBorderColor = () => {
        if (phase === "complete" || phase === "buffer_full") return "border-green-500";
        if (phase === "leg_failed" || phase === "race_failed") return "border-red-400";
        if (phase === "escrow_held") return "border-amber-500";
        if (phase === "ghost_arriving") return "border-purple-400";
        return "border-[#0ba4db]";
    };

    // We no longer use a single background color — we stack colored layers

    return (
        <div className="space-y-6">
            {/* ── Narration Banner ── */}
            <Card className="overflow-hidden">
                <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-4">
                        <div className="shrink-0">
                            <Badge
                                variant="secondary"
                                className="text-xs px-2.5 py-1 font-mono"
                            >
                                {SCENARIO_LABELS[scenario].emoji} {SCENARIO_LABELS[scenario].label}
                            </Badge>
                        </div>
                        <div className="h-8 w-px bg-border shrink-0" />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-semibold">{phaseInfo.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {phaseInfo.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* ── Main Visualization ── */}
            <Card>
                <CardContent className="pt-8 pb-8">
                    <div className="flex items-center justify-between gap-6">
                        {/* SOURCE ACCOUNTS (LEFT) */}
                        <div className="flex flex-col gap-3 shrink-0 w-44">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                                Sources
                            </p>
                            {activeSources.map((source, i) => {
                                const status = legStatuses[i] || "pending";
                                return (
                                    <motion.div
                                        key={source.account.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all ${activeLeg === i
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                            }`}
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: source.account.color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate">
                                                {source.account.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatNaira(source.amount)}
                                            </p>
                                        </div>

                                        {/* Status indicator */}
                                        {status !== "pending" && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`text-[10px] font-semibold shrink-0 ${getStatusColor(status)}`}
                                            >
                                                {getStatusLabel(status)}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* FLOW ARROWS + VIRTUAL ACCOUNT (CENTER) */}
                        <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
                            {/* Arrow from sources → buffer with moving packets */}
                            <div className="flex items-center gap-2 w-full max-w-xs relative">
                                <div className="flex-1 border-t-2 border-dashed border-border" />
                                <motion.div
                                    animate={{
                                        x:
                                            phase === "collecting" || phase === "leg_progress" || phase === "buffer_filling"
                                                ? [0, 8, 0]
                                                : 0,
                                    }}
                                    transition={{
                                        repeat:
                                            phase === "collecting" || phase === "leg_progress" || phase === "buffer_filling"
                                                ? Infinity
                                                : 0,
                                        duration: 1.5,
                                    }}
                                    className="text-muted-foreground text-lg"
                                >
                                    →
                                </motion.div>
                                <div className="flex-1 border-t-2 border-dashed border-border" />

                                {/* Animated money packets traveling → */}
                                <AnimatePresence>
                                    {packets
                                        .filter((p) => p.direction === "to-buffer")
                                        .map((p) => (
                                            <motion.div
                                                key={p.id}
                                                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1"
                                                initial={{ left: "0%", opacity: 0 }}
                                                animate={{ left: "85%", opacity: [0, 1, 1, 0.5] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                                <span
                                                    className="text-[10px] font-bold whitespace-nowrap"
                                                    style={{ color: p.color }}
                                                >
                                                    {formatNaira(activeSources[p.legIndex]?.amount || 0)}
                                                </span>
                                            </motion.div>
                                        ))}
                                </AnimatePresence>

                                {/* Refund packets traveling ← */}
                                <AnimatePresence>
                                    {packets
                                        .filter((p) => p.direction === "refund")
                                        .map((p) => (
                                            <motion.div
                                                key={p.id}
                                                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1"
                                                initial={{ left: "85%", opacity: 0 }}
                                                animate={{ left: "0%", opacity: [0, 1, 1, 0.5] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                                <span className="text-[10px] font-bold text-amber-600 whitespace-nowrap">
                                                    ↩ refund
                                                </span>
                                            </motion.div>
                                        ))}
                                </AnimatePresence>
                            </div>

                            {/* VIRTUAL ACCOUNT */}
                            <motion.div
                                className={`relative w-40 h-40 rounded-full border-[3px] flex flex-col items-center justify-center overflow-hidden transition-colors ${getBufferBorderColor()}`}
                                animate={{
                                    scale:
                                        phase === "buffer_full" || phase === "complete" ? [1, 1.05, 1] : 1,
                                }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Stacked bank-colored fill layers */}
                                {bufferColors.map((bc, idx) => {
                                    const prevHeight = bufferColors
                                        .slice(0, idx)
                                        .reduce((sum, b) => sum + (targetAmount > 0 ? (b.amount / targetAmount) * 100 : 0), 0);
                                    const thisHeight = targetAmount > 0 ? (bc.amount / targetAmount) * 100 : 0;
                                    return (
                                        <motion.div
                                            key={`fill-${idx}`}
                                            className="absolute left-0 right-0"
                                            style={{
                                                bottom: `${prevHeight}%`,
                                                backgroundColor: `${bc.color}20`,
                                                borderTop: idx > 0 ? `1px solid ${bc.color}30` : undefined,
                                            }}
                                            initial={{ height: "0%" }}
                                            animate={{ height: `${thisHeight}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    );
                                })}
                                {/* Error / empty state fill */}
                                {(phase === "leg_failed" || phase === "race_failed") && bufferColors.length === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-full bg-red-50" />
                                )}
                                {phase === "escrow_held" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-full bg-amber-50" />
                                )}

                                {/* Label */}
                                <div className="relative z-10 text-center">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                                        Paystack
                                    </p>
                                    <p className="text-lg font-bold mt-0.5">
                                        {formatNaira(collectedAmount)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        of {formatNaira(targetAmount)}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Arrow from buffer → recipient with packet */}
                            <div className="flex items-center gap-2 w-full max-w-xs relative">
                                <div className="flex-1 border-t-2 border-dashed border-border" />
                                <motion.div
                                    animate={{
                                        x: phase === "disbursing" ? [0, 8, 0] : 0,
                                        opacity: phase === "disbursing" || phase === "complete" ? 1 : 0.3,
                                    }}
                                    transition={{
                                        repeat: phase === "disbursing" ? Infinity : 0,
                                        duration: 1.5,
                                    }}
                                    className="text-muted-foreground text-lg"
                                >
                                    →
                                </motion.div>
                                <div className="flex-1 border-t-2 border-dashed border-border" />

                                {/* Disbursement packet */}
                                <AnimatePresence>
                                    {packets
                                        .filter((p) => p.direction === "to-recipient")
                                        .map((p) => (
                                            <motion.div
                                                key={p.id}
                                                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1"
                                                initial={{ left: "0%", opacity: 0 }}
                                                animate={{ left: "85%", opacity: [0, 1, 1, 0.5] }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <span
                                                    className="w-4 h-4 rounded-full bg-[#0ba4db]"
                                                />
                                                <span className="text-[10px] font-bold text-[#0ba4db] whitespace-nowrap">
                                                    {formatNaira(targetAmount)}
                                                </span>
                                            </motion.div>
                                        ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RECIPIENT (RIGHT) */}
                        <div className="shrink-0 w-44">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">
                                Recipient
                            </p>
                            <motion.div
                                className={`px-3 py-3 rounded-lg border transition-all ${phase === "complete"
                                    ? "border-green-500 bg-green-50"
                                    : "border-border"
                                    }`}
                                animate={{
                                    scale: phase === "complete" ? [1, 1.03, 1] : 1,
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-xs font-semibold">{recipient.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {recipient.bank} · {recipient.accountNumber}
                                </p>
                                {phase === "complete" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-2 pt-2 border-t border-green-200"
                                    >
                                        <p className="text-xs font-bold text-green-600">
                                            Received {formatNaira(targetAmount)}
                                        </p>
                                        <p className="text-[10px] text-green-600/70">
                                            1 alert · 1 reference
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Activity Log ── */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">
                        Activity Log
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        <AnimatePresence>
                            {phase !== "intro" && (
                                <LogEntry
                                    key="init"
                                    text={`Stitch session initiated for ${formatNaira(targetAmount)}`}
                                    time="0s"
                                    variant="info"
                                />
                            )}
                            {(phase === "collecting" ||
                                phase === "leg_progress" ||
                                phase === "buffer_filling" ||
                                phase === "buffer_full" ||
                                phase === "disbursing" ||
                                phase === "complete" ||
                                phase === "leg_failed" ||
                                phase === "refunding" ||
                                phase === "refund_done" ||
                                phase === "ghost_arriving" ||
                                phase === "ghost_reversed" ||
                                phase === "race_failed" ||
                                phase === "escrow_held") && (
                                    <LogEntry
                                        key="collecting"
                                        text={`Initiating transfers from ${activeSources.length} source account(s)`}
                                        time="1s"
                                        variant="info"
                                    />
                                )}
                            {Object.entries(legStatuses).map(([idx, status]) => {
                                const i = parseInt(idx);
                                const source = activeSources[i];
                                if (!source) return null;
                                if (status === "sending")
                                    return (
                                        <LogEntry
                                            key={`sending-${i}`}
                                            text={`${source.account.name}: sending ${formatNaira(source.amount)}...`}
                                            time=""
                                            variant="pending"
                                        />
                                    );
                                if (status === "done")
                                    return (
                                        <LogEntry
                                            key={`done-${i}`}
                                            text={`${source.account.name}: ${formatNaira(source.amount)} received in buffer`}
                                            time=""
                                            variant="success"
                                        />
                                    );
                                if (status === "failed")
                                    return (
                                        <LogEntry
                                            key={`fail-${i}`}
                                            text={`${source.account.name}: transfer failed`}
                                            time=""
                                            variant="error"
                                        />
                                    );
                                if (status === "refunding")
                                    return (
                                        <LogEntry
                                            key={`refunding-${i}`}
                                            text={`${source.account.name}: refunding ${formatNaira(source.amount)}...`}
                                            time=""
                                            variant="warning"
                                        />
                                    );
                                if (status === "refunded")
                                    return (
                                        <LogEntry
                                            key={`refunded-${i}`}
                                            text={`${source.account.name}: ${formatNaira(source.amount)} returned`}
                                            time=""
                                            variant="muted"
                                        />
                                    );
                                if (status === "ghost")
                                    return (
                                        <LogEntry
                                            key={`ghost-${i}`}
                                            text={`${source.account.name}: stale fund detected! Auto-reversing...`}
                                            time=""
                                            variant="warning"
                                        />
                                    );
                                return null;
                            })}
                            {phase === "buffer_full" && (
                                <LogEntry
                                    key="full"
                                    text={`Buffer full: ${formatNaira(targetAmount)} collected`}
                                    time=""
                                    variant="success"
                                />
                            )}
                            {phase === "disbursing" && (
                                <LogEntry
                                    key="disburse"
                                    text={`Disbursing ${formatNaira(targetAmount)} to ${recipient.name}`}
                                    time=""
                                    variant="pending"
                                />
                            )}
                            {phase === "complete" && (
                                <LogEntry
                                    key="complete"
                                    text={`Payment complete. ${recipient.name} received ${formatNaira(targetAmount)}.`}
                                    time=""
                                    variant="success"
                                />
                            )}
                            {phase === "escrow_held" && (
                                <LogEntry
                                    key="escrow"
                                    text="Refund failed. Funds held in Stitch Escrow. Manual intervention required."
                                    time=""
                                    variant="error"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ── Log Entry component ──────────────────────
function LogEntry({
    text,
    time,
    variant,
}: {
    text: string;
    time: string;
    variant: "info" | "success" | "error" | "warning" | "pending" | "muted";
}) {
    const dotColor = {
        info: "bg-blue-400",
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-amber-500",
        pending: "bg-blue-400 animate-pulse",
        muted: "bg-muted-foreground/50",
    }[variant];

    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2.5 text-xs"
        >
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
            <span className="text-muted-foreground leading-relaxed">{text}</span>
        </motion.div>
    );
}
