"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
    currentStep: number;
}

const steps = [
    { num: 1, label: "Target" },
    { num: 2, label: "Allocate" },
    { num: 3, label: "Confirm" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-0 mb-12">
            {steps.map((step, i) => {
                const isActive = currentStep >= step.num;
                const isCurrent = currentStep === step.num;

                return (
                    <div key={step.num} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                initial={false}
                                animate={{ scale: isCurrent ? 1.1 : 1 }}
                            >
                                {step.num}
                            </motion.div>
                            <span
                                className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex items-center mx-6 mb-6">
                                <div
                                    className={`w-16 h-0.5 rounded-full transition-colors ${currentStep > step.num ? "bg-primary" : "bg-border"
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
