"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/stitch", label: "Stitch", icon: Zap },
    { href: "/docs", label: "Docs", icon: FileText },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
                {/* Logo */}
                <Link href="/stitch" className="flex items-center gap-2.5 group">
                    <div className="relative w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:border-primary/20 transition-colors">
                        <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-base font-semibold tracking-tight">
                        Stitch
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-lg bg-secondary"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Status */}
                <Badge variant="secondary" className="gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    POC
                </Badge>
            </div>
        </nav>
    );
}
