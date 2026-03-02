"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatNaira } from "@/lib/data";
import { BankAccount } from "@/lib/types";
import { motion } from "framer-motion";
import {
    Building2,
    CreditCard,
    Landmark,
    Smartphone,
    Wallet,
} from "lucide-react";

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    Wallet,
    Smartphone,
    CreditCard,
    Building2,
    Landmark,
};

interface AccountCardProps {
    account: BankAccount;
    index: number;
}

export default function AccountCard({ account, index }: AccountCardProps) {
    const Icon = iconMap[account.icon] || Wallet;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
        >
            <Card className="hover:border-primary/20 transition-colors cursor-default">
                <CardContent className="pt-6">
                    {/* Top row: icon + bank name */}
                    <div className="flex items-center gap-3.5 mb-5">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: `${account.color}10`,
                                border: `1.5px solid ${account.color}30`,
                            }}
                        >
                            <Icon className="w-5 h-5" style={{ color: account.color }} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {account.accountNumber}
                            </p>
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="mb-5">
                        <p className="text-xs text-muted-foreground mb-1">
                            Available Balance
                        </p>
                        <p className="text-2xl font-bold tracking-tight">
                            {formatNaira(account.balance)}
                        </p>
                    </div>

                    {/* Accent bar */}
                    <div
                        className="h-1 rounded-full w-full"
                        style={{ backgroundColor: account.color, opacity: 0.2 }}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
