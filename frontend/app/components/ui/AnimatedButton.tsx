"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Assuming utils exists, if not I will create it or remove dependency

interface AnimatedButtonProps {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    as?: "button" | "div" | "span";
}

export default function AnimatedButton({
    children,
    href,
    onClick,
    className,
    variant = "primary",
    size = "md",
    fullWidth = false,
    type = "button",
    disabled = false,
    as = "button",
}: AnimatedButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 overflow-hidden rounded-lg group active:scale-95 animate-shine";

    const variants = {
        primary: "bg-emerald-900 text-white shadow-[0_4px_14px_0_rgba(6,78,59,0.39)] hover:bg-emerald-800 hover:shadow-[0_6px_20px_rgba(6,78,59,0.23)]",
        secondary: "bg-white text-emerald-900 shadow-sm border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200",
        outline: "bg-transparent border border-emerald-600 text-emerald-800 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/10",
        ghost: "bg-transparent text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50",
    };

    const sizes = {
        sm: "text-[13px] px-3.5 py-1.5",
        md: "text-[14px] px-5 py-2",
        lg: "text-[15px] px-6 py-2.5",
    };

    const widthClass = fullWidth ? "w-full" : "";

    const content = (
        <>
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === "primary" && (
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            )}
        </>
    );

    const combinedClasses = cn(
        baseStyles,
        variants[variant],
        sizes[size],
        widthClass,
        variant === "primary" ? "premium-glow" : "",
        disabled ? "opacity-50 pointer-events-none" : "",
        className
    );

    const animationProps = {
        whileHover: disabled ? {} : { y: -2, scale: 1.01 },
        whileTap: disabled ? {} : { scale: 0.96, y: 0 },
    };

    const MotionLink = motion(Link);

    if (href && !disabled) {
        return (
            <MotionLink
                href={href}
                className={combinedClasses}
                {...animationProps}
            >
                {content}
            </MotionLink>
        );
    }

    const Component = as === "div" ? motion.div : as === "span" ? motion.span : motion.button;

    return (
        <Component
            {...(as === "button" ? { type, disabled } : {})}
            onClick={onClick}
            className={combinedClasses}
            {...animationProps}
        >
            {content}
        </Component>
    );
}
