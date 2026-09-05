"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DEFAULT_WARP_EFFECT, WARP_EFFECTS, WARP_VERTEX_SHADER } from "./warpShaders";

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothRange = (x, a, b) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const WARP_IN_DURATION = 1750;
export const WARP_IN_HANDOFF = 1480; // screen is effectively black by here

/**
 * Full-screen warp renderer shared by every effect. It owns the WebGL context and
 * the timeline; each effect contributes only a fragment shader driven by three
 * uniforms — uTime, uProgress (0 far away, 1 arrived) and uFade (master blackout).
 *
 * This is a one-way trip: the camera dives in and the screen goes black. The
 * destination is revealed by fading that black away, never by replaying the
 * approach backwards.
 *
 * @param {"blackhole"|"galaxy"} effect
 */
export default function WarpCanvas({ effect = DEFAULT_WARP_EFFECT, onHandoff, onComplete }) {
  const mountRef = useRef(null);
  const callbacks = useRef({ onHandoff, onComplete });
  callbacks.current = { onHandoff, onComplete };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      // No WebGL: don't strand the navigation behind a canvas that will never draw.
      const timer = setTimeout(() => {
        callbacks.current.onHandoff?.();
        callbacks.current.onComplete?.();
      }, 60);
      return () => clearTimeout(timer);
    }

    const settings = WARP_EFFECTS[effect] || WARP_EFFECTS[DEFAULT_WARP_EFFECT];
    const tier = window.innerWidth < 768 ? settings.coarse : settings.fine;
    let renderScale = tier.scale;

    renderer.setPixelRatio(1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uFade: { value: 1 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader: WARP_VERTEX_SHADER, fragmentShader: settings.fragment(tier.steps), uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * renderScale));
      const h = Math.max(1, Math.floor(window.innerHeight * renderScale));
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const duration = WARP_IN_DURATION;
    let frameId = 0;
    let handedOff = false;
    let finished = false;

    // requestAnimationFrame is frozen while the tab is hidden. The visuals can
    // stall, but the navigation must not: drive the handoff and the teardown off
    // wall-clock timers so a backgrounded tab still lands on the new route.
    const fireHandoff = () => {
      if (handedOff) return;
      handedOff = true;
      callbacks.current.onHandoff?.();
    };
    const fireComplete = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frameId);
      callbacks.current.onComplete?.();
    };

    const handoffTimer = setTimeout(fireHandoff, WARP_IN_HANDOFF);
    const doneTimer = setTimeout(fireComplete, duration);

    // Cheap safety net: if the GPU can't keep up, drop resolution rather than stutter.
    let slowFrames = 0;
    let last = start;

    const tick = (now) => {
      frameId = requestAnimationFrame(tick);

      const frameMs = now - last;
      last = now;
      if (frameMs > 45 && renderScale > 0.3) {
        if (++slowFrames > 8) {
          renderScale = Math.max(0.3, renderScale * 0.75);
          slowFrames = 0;
          resize();
        }
      }

      const t = now - start;
      uniforms.uTime.value = t / 1000;

      const x = clamp01((t - 160) / (WARP_IN_HANDOFF - 160));
      uniforms.uProgress.value = easeInOutCubic(x);
      uniforms.uFade.value = 1 - smoothRange(t, WARP_IN_HANDOFF - 420, WARP_IN_HANDOFF);
      mount.style.opacity = String(smoothRange(t, 0, 260));

      if (t >= WARP_IN_HANDOFF) fireHandoff();

      renderer.render(scene, camera);

      if (t >= duration) fireComplete();
    };

    mount.style.opacity = "0";
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      if (handoffTimer) clearTimeout(handoffTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [effect]);

  return <div ref={mountRef} className="fixed inset-0 bg-black" style={{ opacity: 0 }} />;
}
