"use client";

import AccountCard from "@/components/AccountCard";
import { Button } from "@/components/ui/button";
import { bankAccounts, formatNaira } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Your Accounts
            </h1>
            <p className="text-muted-foreground text-base">
              Linked bank accounts across Nigerian banks.{" "}
              <span className="text-foreground font-semibold">
                Total: {formatNaira(totalBalance)}
              </span>
            </p>
          </div>

          <Button asChild size="lg" className="gap-2.5 rounded-xl px-7 h-12 shrink-0">
            <Link href="/stitch">
              <Zap className="w-4 h-4" />
              Start a Stitch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bankAccounts.map((account, i) => (
            <AccountCard key={account.id} account={account} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
