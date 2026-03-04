"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SCENARIO_LABELS } from "@/lib/constants";
import { SimulationScenario } from "@/lib/types";
import { motion } from "framer-motion";

interface StateHandlerProps {
    scenario: SimulationScenario;
    onScenarioChange: (scenario: SimulationScenario) => void;
    onReplay: () => void;
    parallel: boolean;
    onParallelChange: (parallel: boolean) => void;
}

const scenarios: SimulationScenario[] = [
    "success",
    "partial_failure",
];

export default function StateHandler({
    scenario,
    onScenarioChange,
    onReplay,
    parallel,
    onParallelChange,
}: StateHandlerProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Simulation</CardTitle>
                <CardDescription className="text-xs">
                    Toggle to see how the UI reacts to different states.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Scenario toggle */}
                <div className="space-y-1.5">
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
                </div>

                {/* Transfer Mode Toggle */}
                <div className="pt-2 border-t border-border">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                        Transfer Mode
                    </Label>
                    <div className="grid grid-cols-2 gap-1 bg-secondary rounded-lg p-1">
                        <button
                            onClick={() => onParallelChange(false)}
                            className={`text-xs font-medium py-1.5 rounded-md transition-all ${!parallel
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Sequential
                        </button>
                        <button
                            onClick={() => onParallelChange(true)}
                            className={`text-xs font-medium py-1.5 rounded-md transition-all ${parallel
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Parallel
                        </button>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={onReplay}
                    className="w-full text-xs"
                    size="sm"
                >
                    ↻ Replay
                </Button>
            </CardContent>
        </Card>
    );
}
