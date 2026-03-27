'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView, useSpring } from 'framer-motion';

interface AnimatedCounterProps { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string; }

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 2, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 50, damping: 30, duration: duration * 1000 });

  useEffect(() => { if (isInView) spring.set(value); }, [isInView, spring, value]);
  useEffect(() => { const unsub = spring.on('change', (latest) => setDisplayValue(latest)); return unsub; }, [spring]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString();
  return <span ref={ref} className={className}>{prefix}{formatted}{suffix}</span>;
}
