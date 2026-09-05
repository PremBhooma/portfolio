"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A Schwarzschild black hole rendered by tracing photon geodesics per pixel.
 *
 * Rays are integrated in the plane they share with the singularity using the
 * relativistic orbit equation  d²u/dφ² = -u + 1.5·rs·u²  (u = 1/r). Every time a
 * ray crosses the equatorial plane it picks up light from the accretion disk, so
 * the lensed top arc, the mirrored underside and the photon ring all fall out of
 * the physics rather than being faked with layered sprites.
 */

const VERTEX_SHADER = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = (steps) => /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uProgress;   // 0 = distant observer, 1 = through the horizon
  uniform float uFade;       // master blackout on the final approach

  #define STEPS ${steps}

  const float RS       = 1.0;    // Schwarzschild radius
  const float DISK_IN  = 2.40;   // innermost stable orbit
  const float DISK_OUT = 13.0;
  const float ESCAPE   = 28.0;
  const float PI       = 3.14159265;

  // Temperature ramp of the disk: deep red at the rim, incandescent at the ISCO.
  vec3 diskColor(float t) {
    vec3 col = mix(vec3(0.62, 0.020, 0.000), vec3(1.00, 0.170, 0.008), pow(t, 0.95));
    col = mix(col, vec3(1.00, 0.400, 0.045), pow(t, 3.0));
    col = mix(col, vec3(1.00, 0.640, 0.230), pow(t, 12.0));
    return col;
  }

  float diskTemp(float r) {
    return clamp((DISK_OUT - r) / (DISK_OUT - DISK_IN), 0.0, 1.0);
  }

  // Soft inner rim, and an outer fade that lands well before the frame edge so the
  // disk resolves into the void instead of washing the whole screen orange.
  float diskEdge(float r) {
    return smoothstep(DISK_IN, DISK_IN + 0.40, r) * (1.0 - smoothstep(DISK_OUT - 6.0, DISK_OUT, r));
  }

  // Bright, crisp emission where a photon punched clean through y = 0.
  vec3 sampleDisk(vec3 hit, float r) {
    float t = diskTemp(r);

    // Keplerian shear: inner annuli race ahead of the outer ones.
    float ang = atan(hit.z, hit.x);
    float a = ang + uTime * 2.4 / pow(r, 1.5);

    // Concentric filaments, the streaky texture of the reference plate. The bases
    // stay high so the annulus reads as continuous glow rather than dark gaps.
    float coarse = 0.80 + 0.20 * sin(a * 3.0 + r * 0.7);
    float fine = 0.74 + 0.26 * sin(log(r) * 30.0 - a * 1.4 + uTime * 0.7);
    float wisps = 0.86 + 0.14 * sin(log(r) * 11.0 + a * 5.0 - uTime * 0.4);

    return diskColor(t) * pow(t, 1.55) * coarse * fine * wisps * diskEdge(r) * 2.5;
  }

  // d²u/dφ² = -u + 1.5·rs·u²
  float accel(float u) {
    return -u + 1.5 * RS * u * u;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;

    // Fall straight down the throat: distance shrinks, the field of view opens up.
    float dive = pow(uProgress, 1.45);
    float camR = mix(16.0, 1.015, dive);
    float elev = mix(0.150, 0.055, uProgress);
    float fov = mix(0.60, 1.20, uProgress);

    vec3 camPos = vec3(0.0, sin(elev), cos(elev)) * camR;
    vec3 fwd = normalize(-camPos);
    vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, fwd);
    vec3 dir = normalize(fwd + right * uv.x * fov + up * uv.y * fov);

    // Orbital plane for this photon: e1 towards the camera, e2 the way it travels.
    vec3 e1 = normalize(camPos);
    float vr = dot(dir, e1);
    vec3 tangent = dir - e1 * vr;
    float vt = length(tangent);
    vec3 e2 = vt > 1e-5 ? tangent / vt : normalize(cross(e1, vec3(0.0, 1.0, 0.0)));
    vt = max(vt, 1e-5);

    float u = 1.0 / camR;
    float du = -u * (vr / vt);
    float phi = 0.0;
    float dphi = 0.031;

    vec3 col = vec3(0.0);
    vec3 prev = camPos;
    float prevR = camR;

    for (int i = 0; i < STEPS; i++) {
      // RK4 keeps the strongly bent rays stable at this step size.
      float k1u = du,                  k1d = accel(u);
      float k2u = du + 0.5 * dphi * k1d, k2d = accel(u + 0.5 * dphi * k1u);
      float k3u = du + 0.5 * dphi * k2d, k3d = accel(u + 0.5 * dphi * k2u);
      float k4u = du + dphi * k3d,       k4d = accel(u + dphi * k3u);

      u  += dphi * (k1u + 2.0 * k2u + 2.0 * k3u + k4u) / 6.0;
      du += dphi * (k1d + 2.0 * k2d + 2.0 * k3d + k4d) / 6.0;
      phi += dphi;

      if (u <= 0.0) break;              // escaped to infinity
      if (u > 1.0 / RS) break;          // swallowed by the horizon

      float r = 1.0 / u;
      vec3 p = (e1 * cos(phi) + e2 * sin(phi)) * r;

      if (prev.y * p.y < 0.0) {
        float f = prev.y / (prev.y - p.y);
        vec3 hit = mix(prev, p, f);
        float hr = length(hit);
        if (hr > DISK_IN && hr < DISK_OUT) col += sampleDisk(hit, hr);
      }

      // The disk is a flared slab, not a sheet: haze off the midplane is what
      // gives the annulus its glowing thickness instead of a set of hairlines.
      if (r > DISK_IN && r < DISK_OUT) {
        float h = 0.075 * r + 0.10;
        float z = p.y / h;
        if (abs(z) < 3.0) {
          float t = diskTemp(r);
          col += diskColor(t) * exp(-z * z) * pow(t, 1.5) * diskEdge(r) * dphi * r * 0.22;
        }
      }

      if (r > ESCAPE && r > prevR) break;

      prev = p;
      prevR = r;
    }

    // Exposure lifts as the disk wraps around the observer.
    col *= mix(1.0, 1.7, uProgress);
    col = vec3(1.0) - exp(-col);
    col = pow(col, vec3(0.92));
    col *= uFade;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothRange = (x, a, b) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const WARP_IN_DURATION = 1750;
export const WARP_IN_HANDOFF = 1480; // screen is effectively black by here
export const WARP_OUT_DURATION = 1150;

/**
 * @param {"in"|"out"} phase  "in" dives through the horizon, "out" backs away from it.
 */
export default function BlackHoleWarp({ phase, onHandoff, onComplete }) {
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

    // Geodesic tracing is per-pixel expensive; render small and let the browser upscale.
    const coarse = window.innerWidth < 768;
    let renderScale = coarse ? 0.4 : 0.52;
    const steps = coarse ? 140 : 200;

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
      uProgress: { value: phase === "out" ? 1 : 0 },
      uFade: { value: 1 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader: VERTEX_SHADER, fragmentShader: fragmentShader(steps), uniforms });
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
    const duration = phase === "out" ? WARP_OUT_DURATION : WARP_IN_DURATION;
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

    const handoffTimer = phase === "in" ? setTimeout(fireHandoff, WARP_IN_HANDOFF) : null;
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

      if (phase === "in") {
        const x = clamp01((t - 160) / (WARP_IN_HANDOFF - 160));
        uniforms.uProgress.value = easeInOutCubic(x);
        uniforms.uFade.value = 1 - smoothRange(t, WARP_IN_HANDOFF - 420, WARP_IN_HANDOFF);
        mount.style.opacity = String(smoothRange(t, 0, 260));

        if (t >= WARP_IN_HANDOFF) fireHandoff();
      } else {
        const x = clamp01(t / (duration - 150));
        uniforms.uProgress.value = 1 - easeOutCubic(x) * 0.58;
        uniforms.uFade.value = smoothRange(t, 0, 260);
        mount.style.opacity = String(1 - smoothRange(t, 320, duration));
      }

      renderer.render(scene, camera);

      if (t >= duration) fireComplete();
    };

    mount.style.opacity = phase === "out" ? "1" : "0";
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
  }, [phase]);

  return <div ref={mountRef} className="fixed inset-0 bg-black" style={{ opacity: 0 }} />;
}
