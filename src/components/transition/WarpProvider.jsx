"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DEFAULT_WARP_EFFECT } from "./warpShaders";

const WarpCanvas = dynamic(() => import("./WarpCanvas"), { ssr: false });

const REVEAL_DURATION = 420;

const WarpContext = createContext({ warpTo: null, warping: false });

export const useWarp = () => useContext(WarpContext);

/**
 * Routes a navigation through a cosmic transition. Projects falls into a black
 * hole; Contact flies into a galaxy.
 *
 * The trip is one-way. The effect dives in and the screen goes black, the route
 * swaps behind it, then that black simply fades off to reveal the destination —
 * the approach is never replayed in reverse.
 */
export function WarpProvider({ children }) {
  const router = useRouter();
  const [phase, setPhase] = useState(null); // null | "dive" | "reveal"
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
      setPhase("dive");
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

  // The reveal is a plain fade, but it still has to end on a wall-clock timer so a
  // backgrounded tab can't be left sitting under an opaque black overlay.
  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => setPhase(null), REVEAL_DURATION);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleHandoff = useCallback(() => {
    if (targetRef.current) router.push(targetRef.current);
  }, [router]);

  const handleDiveComplete = useCallback(() => setPhase("reveal"), []);

  const value = useMemo(() => ({ warpTo, warping: phase !== null }), [warpTo, phase]);

  return (
    <WarpContext.Provider value={value}>
      {children}
      {phase === "dive" && (
        <div className="fixed inset-0 z-[100]" aria-hidden="true">
          <WarpCanvas key={effect} effect={effect} onHandoff={handleHandoff} onComplete={handleDiveComplete} />
        </div>
      )}
      {phase === "reveal" && <div className="warp-reveal pointer-events-none fixed inset-0 z-[100] bg-black" aria-hidden="true" />}
    </WarpContext.Provider>
  );
}
