"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SCENARIO_LABELS } from "@/lib/constants";
import { bankAccounts, formatNaira, sampleRecipients } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface VisualizationProps {
    targetAmount: number;
    allocations: Record<string, number>;
    recipientId: string;
    scenario: string;
    parallel?: boolean;
}

type Phase =
    | "intro"
    | "leg_progress"
    | "buffer_full"
    | "disbursing"
    | "complete"
    | "leg_failed"
    | "refunding"
    | "refund_done"
    | "ghost_arriving"
    | "ghost_landed"
    | "ghost_reversed";

interface PhaseInfo {
    step: number;
    label: string;
    description: string;
}

const PHASE_TEXT: Record<string, PhaseInfo> = {
    intro: {
        step: 1,
        label: "Initiating Stitch",
        description: "Preparing to collect funds from your linked accounts...",
    },
    leg_progress: {
        step: 2,
        label: "Transfer in Progress",
        description: "Each bank is processing its transfer to the virtual account.",
    },
    buffer_full: {
        step: 3,
        label: "All Funds Collected ✓",
        description:
            "The virtual account has received the full target amount. Ready to disburse.",
    },
    disbursing: {
        step: 4,
        label: "Disbursing Payment",
        description:
            "Sending the full amount as a single, clean transfer to the recipient.",
    },
    complete: {
        step: 5,
        label: "Payment Complete ✓",
        description:
            "The recipient received one alert for the full amount.",
    },
    leg_failed: {
        step: 3,
        label: "Transfer Failed ✗",
        description:
            "One of the transfers failed.",
    },
    refunding: {
        step: 4,
        label: "Auto-Refunding",
        description:
            "Stitch is returning the successful transfers back to their source accounts.",
    },
    refund_done: {
        step: 4,
        label: "Refund Complete",
        description: "All funds have been safely returned to their original accounts.",
    },
    ghost_arriving: {
        step: 5,
        label: "Stale Fund Detected ⚠",
        description:
            "A delayed transfer is arriving after the session expired...",
    },
    ghost_landed: {
        step: 6,
        label: "Unauthorized Fund in Buffer ⚠",
        description:
            "The late transfer has entered the buffer. Auto-reversing now...",
    },
    ghost_reversed: {
        step: 7,
        label: "Ghost Reversed",
        description:
            "The late-arriving funds were automatically sent back. Ledger is clean.",
    },
};

type LegStatus = "pending" | "sending" | "done" | "failed" | "refunding" | "refunded";

export default function MoneyFlowVisualization({
    targetAmount,
    allocations,
    recipientId,
    scenario,
    parallel = true,
}: VisualizationProps) {
    const [phase, setPhase] = useState<Phase>("intro");
    const [collectedAmount, setCollectedAmount] = useState(0);
    const [legStatuses, setLegStatuses] = useState<Record<number, LegStatus>>({});
    const [bufferColors, setBufferColors] = useState<{ color: string; amount: number }[]>([]);
    const [disbursing, setDisbursing] = useState(false);

    const activeSources = useMemo(
        () =>
            Object.entries(allocations)
                .filter(([_, amt]) => amt > 0)
                .map(([id, amt]) => {
                    const account = bankAccounts.find((a) => a.id === id)!;
                    return { account, amount: amt };
                }),
        [allocations]
    );

    const recipient = sampleRecipients.find((r) => r.id === recipientId)!;

    const isSuccess = scenario === "success";
    const isPartialFail = scenario === "partial_failure";

    const failingLegIndices = useMemo(() => {
        if (!isPartialFail || activeSources.length === 0) return [];
        // Math.random to pick a number of failed legs between 1 and activeSources.length
        const numToFail = Math.floor(Math.random() * activeSources.length) + 1;
        // Shuffle indices and pick `numToFail`
        const indices = Array.from({ length: activeSources.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices.slice(0, numToFail);
    }, [isPartialFail, activeSources.length, scenario]);

    // ─── SVG Layout ──────────────────────────────
    const cardW = 170;
    const cardH = 62;
    const destCardW = 200;
    const svgW = 920;
    const svgH = Math.max(activeSources.length * 90 + 60, 320);
    const srcX = cardW / 2 + 16;
    const bufX = svgW / 2;
    const bufY = svgH / 2;
    const bufR = 76;
    const destX = svgW - destCardW / 2 - 16;
    const destY = bufY;

    const sourcePositions = activeSources.map((_, i) => ({
        x: srcX,
        y: (i + 1) * (svgH / (activeSources.length + 1)),
    }));

    // Smooth cubic bezier from source card right edge → buffer left edge
    const getSourcePath = (i: number) => {
        const s = sourcePositions[i];
        const startX = s.x + cardW / 2 + 6;
        const endX = bufX - bufR - 6;
        const midX = (startX + endX) / 2;
        return `M ${startX} ${s.y} C ${midX} ${s.y}, ${midX} ${bufY}, ${endX} ${bufY}`;
    };

    // Straight line from buffer → destination card
    const destPath = `M ${bufX + bufR + 6} ${bufY} L ${destX - destCardW / 2 - 6} ${bufY}`;

    // ─── Orchestrate phases ──────────────────────
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        let elapsed = 0;

        const after = (ms: number, fn: () => void) => {
            elapsed += ms;
            timers.push(setTimeout(fn, elapsed));
        };

        // Reset
        setPhase("intro");
        setCollectedAmount(0);
        setLegStatuses({});
        setBufferColors([]);
        setDisbursing(false);

        after(2500, () => {
            if (parallel) {
                activeSources.forEach((_, i) => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "sending" }));
                });
            }
            setPhase("leg_progress");
        });

        if (parallel) {

            let maxDuration = 0;
            activeSources.forEach((source, i) => {
                // Slower stagger so each leg lands visibly
                const durationMs = 3000 + i * 1200;
                maxDuration = Math.max(maxDuration, durationMs);

                if (isPartialFail && failingLegIndices.includes(i)) {
                    timers.push(
                        setTimeout(() => {
                            setLegStatuses((prev) => ({ ...prev, [i]: "failed" }));
                            setPhase("leg_failed");
                        }, elapsed + durationMs)
                    );
                } else {
                    timers.push(
                        setTimeout(() => {
                            setLegStatuses((prev) => ({ ...prev, [i]: "done" }));
                            setCollectedAmount((prev) => prev + source.amount);
                            setBufferColors((prev) => [...prev, { color: source.account.color, amount: source.amount }]);
                        }, elapsed + durationMs)
                    );
                }
            });
            elapsed += maxDuration + 800;
        } else {
            // ── SEQUENTIAL MODE
            activeSources.forEach((source, i) => {
                const durationMs = 3000;
                after(1500, () => {
                    setLegStatuses((prev) => ({ ...prev, [i]: "sending" }));
                });

                if (isPartialFail && failingLegIndices.includes(i)) {
                    after(durationMs, () => {
                        setLegStatuses((prev) => ({ ...prev, [i]: "failed" }));
                        setPhase("leg_failed");
                    });
                } else {
                    after(durationMs, () => {
                        setLegStatuses((prev) => ({ ...prev, [i]: "done" }));
                        setCollectedAmount((prev) => prev + source.amount);
                        setBufferColors((prev) => [...prev, { color: source.account.color, amount: source.amount }]);
                    });
                }
            });
        }

        // ── Post-collection outcomes ──
        if (isSuccess) {
            after(2500, () => setPhase("buffer_full"));
            after(3000, () => {
                setPhase("disbursing");
                setDisbursing(true);
            });
            after(5000, () => {
                setPhase("complete");
                setDisbursing(false);
            });
        } else if (isPartialFail) {
            after(3000, () => {
                setPhase("refunding");
                activeSources.forEach((_, i) => {
                    if (!failingLegIndices.includes(i)) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunding" }));
                    }
                });
            });
            after(4000, () => {
                setPhase("refund_done");
                activeSources.forEach((_, i) => {
                    if (!failingLegIndices.includes(i)) {
                        setLegStatuses((prev) => ({ ...prev, [i]: "refunded" }));
                    }
                });
                setCollectedAmount(0);
                setBufferColors([]);
            });
        }

        return () => timers.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenario, parallel, JSON.stringify(allocations)]);

    // ─── Helpers ──────────────────────────────────
    let phaseInfo = { ...(PHASE_TEXT[phase] || PHASE_TEXT.intro) };

    if (phase === "leg_failed" && failingLegIndices.length > 0) {
        const c = failingLegIndices.length;
        phaseInfo.description = `${c} transfer${c > 1 ? "s" : ""} failed.`;
    }

    const getStatusColor = (status: LegStatus) => {
        const map: Record<LegStatus, string> = {
            pending: "#a1a1aa",
            sending: "#3b82f6",
            done: "#16a34a",
            failed: "#ef4444",
            refunding: "#f59e0b",
            refunded: "#a1a1aa",
        };
        return map[status] || "#a1a1aa";
    };

    const getStatusLabel = (status: LegStatus) => {
        const map: Record<LegStatus, string> = {
            pending: "Pending",
            sending: "Sending",
            done: "Received ✓",
            failed: "Failed ✗",
            refunding: "Refunding",
            refunded: "Returned ↩",
        };
        return map[status];
    };

    const getPathStroke = (status: LegStatus | undefined) => {
        if (!status || status === "pending") return "var(--color-border)";
        if (status === "done") return "#16a34a";
        if (status === "sending") return "#3b82f6";
        if (status === "failed") return "#ef4444";
        if (status === "refunding" || status === "refunded") return "#f59e0b";
        return "var(--color-border)";
    };

    return (
        <div className="space-y-5">
            {/* ── Narration Banner ── */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-xs px-2.5 py-1 font-mono shrink-0">
                            {SCENARIO_LABELS[scenario].emoji} {SCENARIO_LABELS[scenario].label}
                        </Badge>
                        <div className="h-6 w-px bg-border shrink-0" />
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {phaseInfo.step}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.4 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-semibold leading-tight">{phaseInfo.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{phaseInfo.description}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* ── SVG Visualization ── */}
            <Card>
                <CardContent className="py-6 px-4">
                    <svg
                        viewBox={`0 0 ${svgW} ${svgH}`}
                        className="w-full h-auto"
                        style={{ maxHeight: "560px" }}
                    >
                        <defs>
                            <clipPath id="bufferClip">
                                <circle cx={bufX} cy={bufY} r={bufR - 2} />
                            </clipPath>
                        </defs>

                        {/* ── Paths from sources to buffer ── */}
                        {activeSources.map((_, i) => {
                            const status = legStatuses[i];
                            return (
                                <motion.path
                                    key={`path-${i}`}
                                    d={getSourcePath(i)}
                                    fill="none"
                                    stroke={getPathStroke(status)}
                                    strokeWidth="1.5"
                                    strokeDasharray={status === "sending" ? "6 4" : status === "done" ? "none" : "4 4"}
                                    initial={{ pathLength: 0, opacity: 0.3 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: status === "pending" ? 0.3 : 1,
                                    }}
                                    transition={{ duration: 0.8 }}
                                />
                            );
                        })}

                        {/* ── Path from buffer to destination ── */}
                        <motion.path
                            d={destPath}
                            fill="none"
                            stroke={
                                phase === "disbursing" || phase === "complete"
                                    ? "#0ba4db"
                                    : "var(--color-border)"
                            }
                            strokeWidth="1.5"
                            strokeDasharray={disbursing ? "6 4" : "4 4"}
                            initial={{ opacity: 0.3 }}
                            animate={{
                                opacity: phase === "disbursing" || phase === "complete" ? 1 : 0.3,
                            }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* ── Animated packets along source paths (sending) ── */}
                        {activeSources.map((source, i) => {
                            const status = legStatuses[i];
                            if (status !== "sending") return null;

                            const color = source.account.color;
                            const durationSec = parallel ? (3.0 + i * 1.2) : 3.0;

                            return (
                                <g key={`packet-group-${i}`}>
                                    <motion.circle
                                        r="5"
                                        fill={color}
                                        initial={{ offsetDistance: "0%" }}
                                        animate={{ offsetDistance: "100%" }}
                                        transition={{ duration: durationSec, ease: "linear", repeat: 0 }}
                                        style={{ offsetPath: `path("${getSourcePath(i)}")` }}
                                    />
                                    <motion.text
                                        fontSize="10"
                                        fontWeight="700"
                                        fill={color}
                                        dy="-12"
                                        textAnchor="middle"
                                        initial={{ offsetDistance: "0%", opacity: 0 }}
                                        animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: durationSec, ease: "linear", repeat: 0 }}
                                        style={{ offsetPath: `path("${getSourcePath(i)}")` }}
                                    >
                                        {formatNaira(source.amount)}
                                    </motion.text>
                                </g>
                            );
                        })}

                        {/* ── Refund packets (reverse along source paths — refunding) ── */}
                        {activeSources.map((source, i) => {
                            const status = legStatuses[i];
                            if (status !== "refunding") return null;
                            const color = "#f59e0b";
                            const label = "↩ refund";
                            return (
                                <g key={`refund-group-${i}`}>
                                    <motion.circle
                                        r="5"
                                        fill={color}
                                        initial={{ offsetDistance: "100%" }}
                                        animate={{ offsetDistance: "0%" }}
                                        transition={{ duration: 3.0, repeat: 0, ease: "linear" }}
                                        style={{ offsetPath: `path("${getSourcePath(i)}")` }}
                                    />
                                    <motion.text
                                        fontSize="10"
                                        fontWeight="700"
                                        fill={color}
                                        dy="-12"
                                        textAnchor="middle"
                                        initial={{ offsetDistance: "100%", opacity: 0 }}
                                        animate={{ offsetDistance: "0%", opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 3.0, repeat: 0, ease: "linear" }}
                                        style={{ offsetPath: `path("${getSourcePath(i)}")` }}
                                    >
                                        {label}
                                    </motion.text>
                                </g>
                            );
                        })}

                        {/* ── Disbursement packet ── */}
                        {disbursing && (
                            <g>
                                <motion.circle
                                    r="6"
                                    fill="#0ba4db"
                                    initial={{ offsetDistance: "0%" }}
                                    animate={{ offsetDistance: "100%" }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    style={{ offsetPath: `path("${destPath}")` }}
                                />
                                <motion.text
                                    fontSize="10"
                                    fontWeight="700"
                                    fill="#0ba4db"
                                    dy="-12"
                                    textAnchor="middle"
                                    initial={{ offsetDistance: "0%", opacity: 0 }}
                                    animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    style={{ offsetPath: `path("${destPath}")` }}
                                >
                                    {formatNaira(targetAmount)}
                                </motion.text>
                            </g>
                        )}

                        {/* ── Source nodes (Cards via foreignObject) ── */}
                        {activeSources.map((source, i) => {
                            const pos = sourcePositions[i];
                            const status = legStatuses[i] || "pending";
                            const isSending = status === "sending";
                            const borderColor = isSending
                                ? source.account.color
                                : status === "done" ? "#16a34a"
                                    : status === "failed" ? "#ef4444"
                                        : "#e5e7eb";
                            return (
                                <g key={`src-${i}`}>
                                    <foreignObject
                                        x={pos.x - cardW / 2 - 4}
                                        y={pos.y - cardH / 2 - 4}
                                        width={cardW + 8}
                                        height={cardH + 8}
                                        style={{ overflow: "visible" }}
                                    >
                                        <motion.div
                                            className="flex flex-row items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white"
                                            style={{ border: `1.5px solid ${borderColor}`, width: cardW, height: cardH, margin: 4 }}
                                            animate={{ scale: isSending ? [1, 1.02, 1] : 1 }}
                                            transition={{ duration: 1, repeat: isSending ? Infinity : 0 }}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: source.account.color }}
                                            />
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-[12px] font-semibold truncate leading-tight text-foreground">
                                                    {source.account.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                                    {formatNaira(source.amount)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </foreignObject>

                                    {/* Status badge below card */}
                                    {status !== "pending" && (
                                        <foreignObject
                                            x={pos.x - cardW / 2}
                                            y={pos.y + cardH / 2 + 2}
                                            width={cardW}
                                            height="18"
                                        >
                                            <p className="text-[10px] font-semibold text-center" style={{ color: getStatusColor(status) }}>
                                                {getStatusLabel(status)}
                                            </p>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}

                        {/* ── Buffer (Virtual Account) ── */}
                        <g>
                            {/* Outer circle */}
                            <motion.circle
                                cx={bufX}
                                cy={bufY}
                                r={bufR}
                                fill="white"
                                stroke={
                                    phase === "complete" || phase === "buffer_full"
                                        ? "#16a34a"
                                        : phase === "leg_failed"
                                            ? "#ef4444"
                                            : "#0ba4db"
                                }
                                strokeWidth="3"
                                animate={{
                                    scale: phase === "buffer_full" || phase === "complete" ? [1, 1.04, 1] : 1,
                                    x: 0,
                                }}
                                transition={{
                                    duration: 0.6,
                                }}
                            />

                            {/* Colored fill layers */}
                            <g clipPath="url(#bufferClip)">
                                {bufferColors.map((bc, idx) => {
                                    const prevH = bufferColors
                                        .slice(0, idx)
                                        .reduce((sum, b) => sum + (targetAmount > 0 ? (b.amount / targetAmount) * (bufR * 2) : 0), 0);
                                    const thisH = targetAmount > 0 ? (bc.amount / targetAmount) * (bufR * 2) : 0;
                                    return (
                                        <motion.rect
                                            key={`fill-${idx}`}
                                            x={bufX - bufR}
                                            width={bufR * 2}
                                            fill={bc.color}
                                            fillOpacity="0.15"
                                            initial={{ y: bufY + bufR, height: 0 }}
                                            animate={{ y: bufY + bufR - prevH - thisH, height: thisH }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    );
                                })}
                            </g>

                            {/* Labels — placed well above the circle so they don't clip */}
                            <text x={bufX} y={bufY - bufR - 20} textAnchor="middle" className="text-[10px] font-bold fill-muted-foreground" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Paystack
                            </text>
                            <text x={bufX} y={bufY - bufR - 6} textAnchor="middle" className="text-[9px] fill-muted-foreground">
                                Virtual Account
                            </text>
                            <text x={bufX} y={bufY + 4} textAnchor="middle" className="text-lg font-bold fill-foreground">
                                {formatNaira(collectedAmount)}
                            </text>
                            <text x={bufX} y={bufY + 24} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                                of {formatNaira(targetAmount)}
                            </text>
                        </g>

                        {/* ── Destination node ── */}
                        <g>
                            <foreignObject
                                x={destX - destCardW / 2 - 4}
                                y={destY - 48}
                                width={destCardW + 8}
                                height="120"
                                style={{ overflow: "visible" }}
                            >
                                <div
                                    className={`flex flex-col justify-center px-4 py-4 rounded-xl bg-white overflow-hidden transition-colors ${phase === "complete" ? "bg-green-50/60" : ""
                                        }`}
                                    style={{
                                        border: `1.5px solid ${phase === "complete" ? "#16a34a" : "#e5e7eb"}`,
                                        height: 116,
                                        width: destCardW,
                                        margin: 4
                                    }}
                                >
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 opacity-80">Recipient</p>
                                    <p className="text-[13px] font-bold text-foreground truncate leading-tight mb-0.5">{recipient.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate leading-tight">{recipient.bank} · ****{recipient.accountNumber.slice(-4)}</p>
                                    {phase === "complete" && (
                                        <p className="text-[11px] font-bold text-green-600 mt-2 leading-tight">✓ {formatNaira(targetAmount)} received</p>
                                    )}
                                </div>
                            </foreignObject>
                        </g>
                    </svg>
                </CardContent>
            </Card>
        </div>
    );
}
