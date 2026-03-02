"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { bankAccounts, formatNaira, sampleRecipients } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, Plus, Zap } from "lucide-react";
import { useState } from "react";
import StepIndicator from "./StepIndicator";

interface StitchFormProps {
    onConfirm: (
        targetAmount: number,
        allocations: Record<string, number>,
        recipientId: string
    ) => void;
}

export default function StitchForm({ onConfirm }: StitchFormProps) {
    const [step, setStep] = useState(1);
    const [targetAmount, setTargetAmount] = useState<string>("5000");
    const [recipientId, setRecipientId] = useState<string>(
        sampleRecipients[0].id
    );
    const [allocations, setAllocations] = useState<Record<string, number>>({});

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
    const amountNum = Math.max(0, parseInt(targetAmount, 10) || 0);
    const remaining = amountNum - totalAllocated;

    const handleNext = () => {
        if (step === 1 && amountNum > 0) setStep(2);
        if (step === 2 && remaining === 0) setStep(3);
    };

    const handleConfirm = () => {
        onConfirm(amountNum, allocations, recipientId);
    };

    const updateAlloc = (id: string, amount: number, max: number) => {
        setAllocations((prev) => ({
            ...prev,
            [id]: Math.max(0, Math.min(amount, max)),
        }));
    };

    const autoFill = (id: string, max: number) => {
        const current = allocations[id] || 0;
        const add = Math.min(remaining > 0 ? remaining : 0, max - current);
        updateAlloc(id, current + add, max);
    };

    // ── Step 1: Target ─────────────────────
    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto space-y-6"
        >
            <Card>
                <CardContent className="pt-6 text-center space-y-4">
                    <Label className="text-sm text-muted-foreground">
                        How much do you need to send?
                    </Label>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-4xl font-light text-muted-foreground">₦</span>
                        <input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="text-5xl font-bold bg-transparent border-none outline-none text-center w-48"
                            placeholder="0"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 space-y-3">
                    <Label>Send to</Label>
                    <Select value={recipientId} onValueChange={setRecipientId}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sampleRecipients.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                    {r.name} ({r.bank})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Button
                onClick={handleNext}
                disabled={amountNum <= 0}
                className="w-full h-12 rounded-xl gap-2"
                size="lg"
            >
                Next: Allocate Sources <ArrowRight className="w-4 h-4" />
            </Button>
        </motion.div>
    );

    // ── Step 2: Allocate ─────────────────────
    const renderStep2 = () => (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Allocate Funds</h2>
                    <p className="text-sm text-muted-foreground">
                        Pull from multiple accounts to hit {formatNaira(amountNum)}.
                    </p>
                </div>
                <Card className="py-3 px-5">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">
                        Remaining
                    </p>
                    <p
                        className={`text-xl font-bold ${remaining === 0 ? "text-green-600" : ""
                            }`}
                    >
                        {formatNaira(remaining)}
                    </p>
                </Card>
            </div>

            <div className="space-y-3">
                {bankAccounts.map((account) => {
                    const allocated = allocations[account.id] || 0;

                    return (
                        <Card key={account.id}>
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-5">
                                    {/* Bank info */}
                                    <div className="w-28 shrink-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: account.color }}
                                            />
                                            <span className="font-semibold text-sm truncate">
                                                {account.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            Bal: {formatNaira(account.balance)}
                                        </span>
                                    </div>

                                    {/* Slider */}
                                    <div className="flex-1">
                                        <Slider
                                            value={[allocated]}
                                            min={0}
                                            max={account.balance}
                                            step={100}
                                            onValueChange={([v]) =>
                                                updateAlloc(account.id, v, account.balance)
                                            }
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Manual input */}
                                    <div className="w-24 shrink-0 relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                            ₦
                                        </span>
                                        <Input
                                            type="number"
                                            value={allocated || ""}
                                            onChange={(e) =>
                                                updateAlloc(
                                                    account.id,
                                                    parseInt(e.target.value || "0", 10),
                                                    account.balance
                                                )
                                            }
                                            className="pl-6 text-sm font-semibold h-9"
                                        />
                                    </div>

                                    {/* Quick fill */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => autoFill(account.id, account.balance)}
                                        disabled={
                                            allocated === account.balance || remaining <= 0
                                        }
                                        className="shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={remaining !== 0}
                    className="flex-1 h-12 rounded-xl gap-2"
                    size="lg"
                >
                    Next: Confirm <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );

    // ── Step 3: Confirm ─────────────────────
    const renderStep3 = () => {
        const active = Object.entries(allocations).filter(([_, amt]) => amt > 0);
        const recipient = sampleRecipients.find((r) => r.id === recipientId);

        return (
            <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto text-center space-y-6"
            >
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-1">Ready to Stitch?</h2>
                    <p className="text-muted-foreground text-sm">
                        Sending{" "}
                        <span className="font-semibold text-foreground">
                            {formatNaira(amountNum)}
                        </span>{" "}
                        to {recipient?.name}.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6 text-left space-y-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Pulling Funds From
                        </p>
                        {active.map(([id, amount]) => {
                            const acc = bankAccounts.find((a) => a.id === id);
                            if (!acc) return null;
                            return (
                                <div
                                    key={id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: acc.color }}
                                        />
                                        <span className="font-medium">{acc.name}</span>
                                    </div>
                                    <span className="font-semibold">{formatNaira(amount)}</span>
                                </div>
                            );
                        })}
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-bold">{formatNaira(amountNum)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                        <ChevronLeft className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 h-12 rounded-xl gap-2"
                        size="lg"
                    >
                        Execute Stitch <Zap className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        );
    };

    return (
        <div>
            <StepIndicator currentStep={step} />
            <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </AnimatePresence>
        </div>
    );
}
