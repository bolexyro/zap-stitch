"use client";

import AccountCard from "@/components/AccountCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bankAccounts, formatNaira } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Your Accounts
          </h1>
          <p className="text-muted-foreground text-base">
            Linked bank accounts across Nigerian banks.{" "}
            <span className="text-foreground font-semibold">
              Total: {formatNaira(totalBalance)}
            </span>
          </p>
        </motion.div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {bankAccounts.map((account, i) => (
            <AccountCard key={account.id} account={account} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button asChild size="lg" className="gap-2.5 rounded-xl px-7 h-12">
            <Link href="/stitch">
              <Zap className="w-4 h-4" />
              Start a Stitch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Explainer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-20"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Stitch Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Set your target",
                    desc: "Enter the total amount you need to send. Stitch shows your linked balances.",
                  },
                  {
                    step: "02",
                    title: "Allocate sources",
                    desc: "Choose how much to pull from each bank. Sliders or manual input — your call.",
                  },
                  {
                    step: "03",
                    title: "One clean payment",
                    desc: "Funds collect in a Paystack virtual account, then disburse as a single transfer.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col gap-2">
                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      {item.step}
                    </span>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
