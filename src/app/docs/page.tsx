"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Layers,
    Lock,
    RefreshCcw,
    Shield,
    Zap,
} from "lucide-react";

export default function DocsPage() {
    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-3xl px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14"
                >
                    <Badge variant="secondary" className="mb-4">
                        Documentation
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight mb-3">
                        How Stitch Works
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
                        The technical rationale behind multi-source payment aggregation,
                        built as a proof-of-concept for Paystack.
                    </p>
                </motion.div>

                {/* Key Arguments Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-14"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Key Arguments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 pr-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                                Concept
                                            </th>
                                            <th className="text-left py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                                Argument
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {[
                                            {
                                                concept: "Why Stitch?",
                                                argument:
                                                    "Fragmentation of funds is the #1 reason for payment abandonment in Africa.",
                                            },
                                            {
                                                concept: "The Buffer Pattern",
                                                argument:
                                                    'Using ephemeral Virtual Accounts creates a "Staging Area" for truth.',
                                            },
                                            {
                                                concept: "Atomic Settlement",
                                                argument:
                                                    "We protect the merchant\u2019s reconciliation logic by ensuring they only ever receive 100% of the value.",
                                            },
                                            {
                                                concept: "User Safety",
                                                argument:
                                                    'Automated "Compensating Transactions" (Sagas) mean the user never has to manually balance-hop again.',
                                            },
                                        ].map((row) => (
                                            <tr key={row.concept}>
                                                <td className="py-3.5 pr-4 font-medium whitespace-nowrap">
                                                    {row.concept}
                                                </td>
                                                <td className="py-3.5 text-muted-foreground leading-relaxed">
                                                    {row.argument}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Separator className="mb-14" />

                {/* Prose Content */}
                <div className="prose prose-sm prose-stitch max-w-none space-y-14">
                    {/* Section 1: Why Stitch */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Zap className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Why Stitch?</h2>
                        </div>
                        <p>
                            Imagine you&apos;re at a supermarket in Lagos, and your bill is
                            ₦5,000. You have ₦2,000 in Access Bank and ₦3,000 in Moniepoint.
                            Today, you would need to transfer money between your own accounts
                            before paying — a process that involves multiple apps, transfer
                            fees, and the ever-present risk of NIBSS being &quot;down.&quot;
                        </p>
                        <p>
                            Stitch eliminates this friction. Instead of manually
                            balance-hopping, you tell Stitch: &quot;Take 2k from Access and 3k
                            from Moniepoint, and send it straight to the supermarket.&quot;
                            One action, one alert for the merchant.
                        </p>
                    </motion.section>

                    {/* Section 2: The Buffer Pattern */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Layers className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">The Buffer Pattern</h2>
                        </div>
                        <p>
                            At the heart of Stitch is a <strong>Paystack Virtual Account</strong> that acts as
                            an escrow buffer. It decouples the <em>collection</em> of funds from
                            the <em>disbursement</em> of funds:
                        </p>
                        <ul>
                            <li>
                                <strong>Collection:</strong> Multiple small, messy transfers from
                                the user&apos;s linked banks flow into the virtual account.
                            </li>
                            <li>
                                <strong>Disbursement:</strong> Once the target amount is fully
                                collected, a single clean transfer is sent to the recipient.
                            </li>
                        </ul>
                        <p>
                            This staging-area approach ensures the merchant only receives a
                            complete payment — never partial amounts that would corrupt their
                            reconciliation ledger.
                        </p>
                    </motion.section>

                    {/* Section 3: Atomicity */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Atomic Settlement</h2>
                        </div>
                        <p>
                            In the real world, you can&apos;t use a single database{" "}
                            <code>@Transactional</code> across different banks. Instead, Stitch
                            uses the <strong>Saga Pattern</strong>: each bank pull is treated as
                            a &quot;local&quot; transaction. If the overall Saga fails,{" "}
                            <strong>Compensating Transactions</strong> (refunds) are automatically
                            triggered to undo the parts that succeeded.
                        </p>
                        <p>
                            This all-or-nothing guarantee means:
                        </p>
                        <ul>
                            <li>The merchant <em>never</em> receives a partial payment.</li>
                            <li>The user <em>never</em> loses money in a half-completed transfer.</li>
                            <li>
                                Every Stitch attempt uses a <strong>unique reference code</strong> for
                                idempotency — if a bank sends a success message twice, Stitch
                                ignores the duplicate.
                            </li>
                        </ul>
                    </motion.section>

                    {/* Section 4: Error Handling */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Error Paths</h2>
                        </div>
                        <p>
                            When things go wrong in Nigerian fintech, they go wrong in creative
                            ways. Stitch handles five key failure scenarios:
                        </p>
                    </motion.section>

                    {/* Error Path Cards */}
                    <div className="not-prose grid gap-4">
                        {[
                            {
                                icon: AlertTriangle,
                                title: "Abandoned Leg",
                                emoji: "⚠️",
                                desc: "One leg fails (e.g. Moniepoint is under maintenance). The successful legs auto-refund via compensating transactions.",
                            },
                            {
                                icon: RefreshCcw,
                                title: "Ghost Transaction",
                                emoji: "👻",
                                desc: 'A timed-out transfer finally drops after the session expired. Stitch\'s "Ghost Hunter" logic detects the late arrival and immediately reverses it.',
                            },
                            {
                                icon: Zap,
                                title: "Race Condition",
                                emoji: "🏎️",
                                desc: "A Netflix subscription debits the account between allocation and execution. The node shakes red: \"Balance no longer sufficient.\"",
                            },
                            {
                                icon: Lock,
                                title: "Partial Refund Failure",
                                emoji: "🔒",
                                desc: "The refund itself fails (frozen account). Funds are held in Stitch Escrow with options to retry or redirect.",
                            },
                        ].map((error) => (
                            <Card key={error.title}>
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl shrink-0 mt-0.5">{error.emoji}</span>
                                        <div>
                                            <p className="font-semibold text-sm mb-1">
                                                {error.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {error.desc}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Section 5: UX */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Why One Alert Matters</h2>
                        </div>
                        <p>
                            From the merchant&apos;s perspective, receiving three small alerts
                            instead of one clean ₦5,000 alert creates reconciliation chaos.
                            Their POS or accounting system expects one transaction per
                            purchase — not a scattered collection of micro-transfers.
                        </p>
                        <p>
                            Stitch solves this by ensuring the merchant&apos;s experience is
                            indistinguishable from a normal, single-source payment. They
                            receive <strong>one alert, one line item, one reference number</strong>.
                            Clean and professional.
                        </p>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
