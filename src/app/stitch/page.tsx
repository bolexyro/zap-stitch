"use client";

import MoneyFlowVisualization from "@/components/MoneyFlowVisualization";
import StateHandler from "@/components/StateHandler";
import StitchForm from "@/components/StitchForm";
import { SimulationScenario } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";

export default function StitchPage() {
    const [phase, setPhase] = useState<"form" | "visualize">("form");
    const [targetAmount, setTargetAmount] = useState(0);
    const [allocations, setAllocations] = useState<Record<string, number>>({});
    const [recipientId, setRecipientId] = useState("");
    const [scenario, setScenario] = useState<SimulationScenario>("success");
    const [animationKey, setAnimationKey] = useState(0);
    const [parallel, setParallel] = useState(true);

    const handleConfirm = useCallback(
        (amount: number, allocs: Record<string, number>, recipient: string) => {
            setTargetAmount(amount);
            setAllocations(allocs);
            setRecipientId(recipient);
            setPhase("visualize");
        },
        []
    );

    const handleReplay = useCallback(() => {
        setAnimationKey((k) => k + 1);
    }, []);

    const handleScenarioChange = useCallback(
        (newScenario: SimulationScenario) => {
            setScenario(newScenario);
            setAnimationKey((k) => k + 1);
        },
        []
    );

    const handleParallelChange = useCallback(
        (newParallel: boolean) => {
            setParallel(newParallel);
            setAnimationKey((k) => k + 1);
        },
        []
    );

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-6xl px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-3">
                        {phase === "visualize" && (
                            <button
                                onClick={() => setPhase("form")}
                                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <h1 className="text-4xl font-bold tracking-tight">
                            {phase === "form" ? "New Stitch" : "Money Flow"}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {phase === "form"
                            ? "Combine funds from multiple accounts into a single payment."
                            : "Watch your funds flow through the Paystack virtual account."}
                    </p>
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {phase === "form" && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <StitchForm onConfirm={handleConfirm} />
                        </motion.div>
                    )}

                    {phase === "visualize" && (
                        <motion.div
                            key="visualize"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8"
                        >
                            {/* Visualization */}
                            <MoneyFlowVisualization
                                key={animationKey}
                                targetAmount={targetAmount}
                                allocations={allocations}
                                recipientId={recipientId}
                                scenario={scenario}
                                parallel={parallel}
                            />

                            {/* State Handler Sidebar */}
                            <StateHandler
                                scenario={scenario}
                                onScenarioChange={handleScenarioChange}
                                onReplay={handleReplay}
                                parallel={parallel}
                                onParallelChange={handleParallelChange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
