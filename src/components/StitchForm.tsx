"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { bankAccounts, formatNaira, sampleRecipients } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, Dices, Zap } from "lucide-react";
import { useEffect, useState } from "react";
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
    const [sourceCount, setSourceCount] = useState<string>("3");

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
    const amountNum = Math.max(0, parseInt(targetAmount, 10) || 0);
    const remaining = amountNum - totalAllocated;

    const handleNext = () => {
        if (step === 1 && amountNum > 0) {
            calculateSmartAllocation();
            setStep(2);
        }
        if (step === 2 && remaining === 0) setStep(3);
    };

    const handleRandomize = () => {
        const randomCount = Math.floor(Math.random() * 4) + 2; // Returns 2, 3, 4, or 5
        setSourceCount(randomCount.toString());
        performAllocation(randomCount);
    };

    const calculateSmartAllocation = () => {
        performAllocation(parseInt(sourceCount, 10));
    };

    const performAllocation = (targetCount: number) => {
        let currentRemaining = amountNum;
        const newAllocations: Record<string, number> = {};

        const byBalanceDesc = [...bankAccounts].sort((a, b) => b.balance - a.balance);
        let selectedAccounts = byBalanceDesc.slice(0, targetCount);
        let selectedTotal = selectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);

        if (selectedTotal < amountNum) {
            for (const acc of byBalanceDesc.slice(targetCount)) {
                if (selectedTotal >= amountNum) break;
                selectedAccounts.push(acc);
                selectedTotal += acc.balance;
            }
        }

        const minPercentageAmount = Math.max(1, Math.floor(amountNum * 0.05));

        for (const account of selectedAccounts) {
            const take = Math.min(minPercentageAmount, account.balance, currentRemaining);
            if (take > 0) {
                newAllocations[account.id] = take;
                currentRemaining -= take;
            }
        }

        const toDistribute = [...selectedAccounts].sort(() => Math.random() - 0.5);

        for (let i = 0; i < toDistribute.length - 1; i++) {
            if (currentRemaining <= 0) break;
            const account = toDistribute[i];
            const currentAlloc = newAllocations[account.id] || 0;
            const room = account.balance - currentAlloc;
            const maxTake = Math.min(room, currentRemaining);

            if (maxTake > 0) {
                const randomTake = Math.floor(Math.random() * (maxTake + 1));
                newAllocations[account.id] = currentAlloc + randomTake;
                currentRemaining -= randomTake;
            }
        }

        if (currentRemaining > 0) {
            for (const account of toDistribute) {
                const currentAlloc = newAllocations[account.id] || 0;
                const room = account.balance - currentAlloc;
                const take = Math.min(room, currentRemaining);
                
                if (take > 0) {
                    newAllocations[account.id] = currentAlloc + take;
                    currentRemaining -= take;
                }
                if (currentRemaining <= 0) break;
            }
        }

        setAllocations(newAllocations);
    };

    // Auto-recalculate when the target source count changes
    useEffect(() => {
        if (amountNum > 0 && Object.keys(allocations).length > 0) {
            calculateSmartAllocation();
        }
    }, [sourceCount]);

    const handleConfirm = () => {
        onConfirm(amountNum, allocations, recipientId);
    };


    // ── Step 1: Target ─────────────────────
    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center"
        >
            {/* Meme Placeholder (Left Side) */}
            <div className="w-full md:w-1/2 flex flex-col items-center text-center">
                <div className="relative rounded-xl overflow-hidden border bg-muted w-full max-w-[280px] mx-auto aspect-[4/5] mb-4 flex items-center justify-center">
                    <img src="/meme.jpeg" alt="how much is adulting dealing with you" className="object-cover w-full h-full shadow-sm" />
                </div>
                <p className="text-sm font-medium text-muted-foreground italic tracking-tight max-w-[280px]">
                    "how much is adulting dealing with you :)"
                </p>
            </div>

            {/* Form Fields (Right Side) */}
            <div className="w-full md:w-1/2 space-y-6 max-w-md">
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
            </div>
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Allocate Funds</h2>

                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={sourceCount} onValueChange={(val) => {
                        setSourceCount(val);
                        // We can't auto-recalculate here safely due to stale state in standard hooks,
                        // so we handle it via a useEffect below, OR just let them press Shuffle Split.
                        // Actually, better to trigger a re-calc when sourceCount changes.
                    }}>
                        <SelectTrigger className="w-[130px] h-10 rounded-xl bg-background">
                            <SelectValue placeholder="Sources" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2 Accounts</SelectItem>
                            <SelectItem value="3">3 Accounts</SelectItem>
                            <SelectItem value="4">4 Accounts</SelectItem>
                            <SelectItem value="5">All Accounts</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRandomize}
                        className="gap-2 h-10 px-4 rounded-xl border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                        <Dices className="w-4 h-4 text-primary" />
                        Random
                    </Button>
                    <div className="h-10 px-4 flex flex-col justify-center bg-secondary/50 rounded-xl border border-border/50 shrink-0">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">
                            Total Amount
                        </p>
                        <p className="text-sm font-bold leading-none">
                            {formatNaira(amountNum)}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none bg-slate-50/50">
                <CardContent className="p-6">
                    {/* Integrated Logo Bar */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stitch Breakdown</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{Object.keys(allocations).length} accounts</p>
                        </div>

                        <div className="h-32 w-full bg-slate-200/40 rounded-[24px] flex overflow-hidden border border-slate-200/60 relative">
                            {bankAccounts.map((account) => {
                                const allocated = allocations[account.id] || 0;
                                if (allocated <= 0) return null;
                                const width = (allocated / amountNum) * 100;

                                // Show content only if segment is wide enough
                                const showContent = width > 5;

                                return (
                                    <motion.div
                                        key={`bar-${account.id}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${width}%` }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full relative flex flex-col items-center justify-center border-r border-white/20 last:border-r-0 group"
                                        style={{ backgroundColor: `${account.color}33` }} // ~20% opacity (33 in hex)
                                    >
                                        <AnimatePresence>
                                            {showContent && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="flex flex-col items-center gap-2 px-2"
                                                >
                                                    {account.logoUrl ? (
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden">
                                                            <img
                                                                src={account.logoUrl}
                                                                alt={account.name}
                                                                className="w-full h-full object-contain rounded-lg"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                                            style={{ backgroundColor: account.color }}
                                                        >
                                                            <span className="text-white text-[10px] font-bold">{account.shortName}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1 truncate max-w-full">
                                                            {account.shortName}
                                                        </p>
                                                        <p className="text-sm font-black text-slate-900 leading-none">
                                                            {formatNaira(allocated)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
