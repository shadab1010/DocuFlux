"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollAnimationProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none';
    duration?: number;
}

export default function ScrollAnimation({
    children,
    className = "",
    delay = 0,
    direction = 'up',
    duration = 0.8,
}: ScrollAnimationProps) {
    const variants = {
        up: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
        down: { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
        zoom: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
        none: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    };

    const selectedVariant = variants[direction];

    return (
        <motion.div
            initial={selectedVariant.initial}
            whileInView={selectedVariant.animate}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                stiffness: 100,
                damping: 20
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
