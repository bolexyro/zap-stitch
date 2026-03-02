"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SCENARIO_LABELS } from "@/lib/constants";
import { SimulationScenario } from "@/lib/types";
import { motion } from "framer-motion";

interface StateHandlerProps {
    scenario: SimulationScenario;
    onScenarioChange: (scenario: SimulationScenario) => void;
    onReplay: () => void;
}

const scenarios: SimulationScenario[] = [
    "success",
    "partial_failure",
    "ghost_transaction",
    "race_condition",
    "refund_failure",
];

export default function StateHandler({
    scenario,
    onScenarioChange,
    onReplay,
}: StateHandlerProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Simulation</CardTitle>
                <CardDescription className="text-xs">
                    Toggle to see how the UI reacts to different states.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
                {scenarios.map((s) => {
                    const info = SCENARIO_LABELS[s];
                    const isActive = scenario === s;

                    return (
                        <button
                            key={s}
                            onClick={() => onScenarioChange(s)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2.5 ${isActive
                                    ? "bg-secondary text-foreground"
                                    : "hover:bg-secondary/50 text-muted-foreground"
                                }`}
                        >
                            <span className="text-base shrink-0">{info.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium leading-none mb-1">
                                    {info.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                                    {info.description}
                                </p>
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="activeScenario"
                                    className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}
                        </button>
                    );
                })}

                <div className="pt-2">
                    <Button
                        variant="outline"
                        onClick={onReplay}
                        className="w-full text-xs"
                        size="sm"
                    >
                        ↻ Replay
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
