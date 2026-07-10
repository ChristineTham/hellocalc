// src/components/calculator/AutoScale.tsx
// Fits its child (a faceplate at its natural design size) into the available
// area by uniformly scaling it with a CSS transform — display, buttons and fonts
// scale together so the whole faceplate always fits the screen (FR-UI-7).
//
// The child is absolutely positioned and scaled from its top-left, then centred
// with an explicit translate computed from the measured sizes. (Relying on grid/
// flex centring of an overflowing, transformed child does NOT centre reliably.)
// offsetWidth/Height report layout size ignoring the transform, so measuring the
// child never feeds back into the scale.
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface AutoScaleProps {
  children: React.ReactNode;
  /** Upper bound on scale so the faceplate doesn't balloon on huge screens. */
  maxScale?: number;
  className?: string;
}

interface Fit {
  scale: number;
  x: number;
  y: number;
  ready: boolean;
}

export function AutoScale({ children, maxScale = 1.3, className }: AutoScaleProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>({ scale: 1, x: 0, y: 0, ready: false });

  useIsoLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    const measure = () => {
      const nw = content.offsetWidth;
      const nh = content.offsetHeight;
      const aw = box.clientWidth;
      const ah = box.clientHeight;
      if (!nw || !nh || !aw || !ah) return;
      const scale = Math.min(aw / nw, ah / nh, maxScale);
      setFit({
        scale,
        x: Math.max(0, (aw - nw * scale) / 2),
        y: Math.max(0, (ah - nh * scale) / 2),
        ready: true,
      });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    measure();
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={boxRef} className={cn("relative overflow-hidden", className)}>
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
          opacity: fit.ready ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
