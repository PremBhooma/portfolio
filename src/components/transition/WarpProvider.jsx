"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DEFAULT_WARP_EFFECT } from "./warpShaders";

const WarpCanvas = dynamic(() => import("./WarpCanvas"), { ssr: false });

const WarpContext = createContext({ warpTo: null, warping: false });

export const useWarp = () => useContext(WarpContext);

/**
 * Routes a navigation through a cosmic transition: the effect swallows the
 * current page, the route swaps while the screen is dark, then it recedes to
 * reveal the destination. Projects falls into a black hole; Contact flies into a
 * galaxy.
 */
export function WarpProvider({ children }) {
  const router = useRouter();
  const [phase, setPhase] = useState(null); // null | "in" | "out"
  const [effect, setEffect] = useState(DEFAULT_WARP_EFFECT);
  const targetRef = useRef(null);

  const warpTo = useCallback(
    (href, nextEffect = DEFAULT_WARP_EFFECT) => {
      // Anyone who asked not to be moved around gets a plain navigation.
      const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || phase) {
        router.push(href);
        return;
      }
      targetRef.current = href;
      router.prefetch?.(href);
      setEffect(nextEffect);
      setPhase("in");
    },
    [phase, router]
  );

  // Lock the page behind the overlay so nothing scrolls while we're inside.
  useEffect(() => {
    if (!phase) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  const handleHandoff = useCallback(() => {
    if (targetRef.current) router.push(targetRef.current);
  }, [router]);

  const handleComplete = useCallback(() => {
    setPhase((current) => (current === "in" ? "out" : null));
  }, []);

  const value = useMemo(() => ({ warpTo, warping: phase !== null }), [warpTo, phase]);

  return (
    <WarpContext.Provider value={value}>
      {children}
      {phase && (
        <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase === "in" ? "auto" : "none" }} aria-hidden="true">
          <WarpCanvas key={`${effect}-${phase}`} effect={effect} phase={phase} onHandoff={handleHandoff} onComplete={handleComplete} />
        </div>
      )}
    </WarpContext.Provider>
  );
}
