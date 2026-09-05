"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const BlackHoleWarp = dynamic(() => import("./BlackHoleWarp"), { ssr: false });

const WarpContext = createContext({ warpTo: null, warping: false });

export const useWarp = () => useContext(WarpContext);

/**
 * Routes a navigation through a black hole: the horizon swallows the current
 * page, the route swaps while the screen is dark, then the hole recedes to
 * reveal the destination.
 */
export function WarpProvider({ children }) {
  const router = useRouter();
  const [phase, setPhase] = useState(null); // null | "in" | "out"
  const targetRef = useRef(null);

  const warpTo = useCallback(
    (href) => {
      // Anyone who asked not to be moved around gets a plain navigation.
      const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || phase) {
        router.push(href);
        return;
      }
      targetRef.current = href;
      router.prefetch?.(href);
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
          <BlackHoleWarp key={phase} phase={phase} onHandoff={handleHandoff} onComplete={handleComplete} />
        </div>
      )}
    </WarpContext.Provider>
  );
}
