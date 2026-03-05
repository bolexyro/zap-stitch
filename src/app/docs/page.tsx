"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    Layers,
    Shield,
    Zap
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
                        built as a proof-of-concept for Zap by Paystack.
                    </p>
                </motion.div>



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
                            Have you ever wanted to transfer an amount, but you didn't have the complete amount in any of your banks? But you now started sending from one bank to another just to complete the balance...
                        </p>

                        <div className="my-8 flex justify-center not-prose">
                            <div className="relative rounded-xl overflow-hidden border bg-muted w-full max-w-sm aspect-[4/5] flex items-center justify-center">
                                {/* Placeholder for the user's uploaded meme */}
                                <img src="/meme.jpeg" alt="Adulthood is crazy meme" className="object-cover w-full h-full" />
                            </div>
                        </div>

                        <p>
                            Stitch helps in the sense that you don't have to do this manually, it can help you just pull your funds together seamlessly.
                        </p>
                    </motion.section>

                    {/* Section 3: The Buffer Pattern */}
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
                                <strong>Collection:</strong> Multiple small, transfers from
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

                    {/* Section 2: Why Paystack */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="flex items-center gap-3 mb-4 not-prose">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                <Shield className="w-5 h-5 text-foreground" />
                            </div>
                            <h2 className="text-xl font-bold">Why Paystack?</h2>
                        </div>
                        <p>
                            Paystack is uniquely positioned to solve this problem beautifully because of two massive advantages:
                        </p>
                        <ol>
                            <li>
                                <strong>They own Zap:</strong> An app that already lets you send money from any of your bank accounts.
                            </li>
                            <li>
                                <strong>They own Virtual Accounts:</strong> The exact buffer infrastructure needed to make Stitch work natively exists within their systems. It&apos;s a plug-and-play addition to their ecosystem.
                            </li>
                        </ol>
                    </motion.section>





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
                        </p>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
