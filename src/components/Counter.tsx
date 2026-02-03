'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView, motion, useSpring, useTransform } from 'framer-motion';

interface CounterProps {
    value: number;
    suffix?: string;
    duration?: number;
}

export function Counter({ value, suffix = '', duration = 2 }: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const motionValue = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const rounded = useTransform(motionValue, (latest) => Math.round(latest));

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        rounded.on("change", (latest) => {
            setDisplayValue(latest);
        });
    }, [rounded]);

    return (
        <span ref={ref} className="tabular-nums">
            {displayValue}
            {suffix}
        </span>
    );
}
