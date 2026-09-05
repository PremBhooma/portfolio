"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SKILLS = ["React.js", "Next.js", "Node.js", "JavaScript", "TypeScript", "MongoDB", "Express", "Tailwind", "Redux", "GraphQL", "REST API", "Git"];

const ACCENT = 0x7dd3fc;
const CORE = 0x1e2761;
const GLOW = 0x8b5cf6;

const LABEL_RADIUS = 2.6;
const ORBIT_RADIUS = 1.6;
const CAMERA_Z = 6.5;
const FOV = 45;

/** Evenly spread n points over a sphere (Fibonacci lattice). */
function fibonacciSphere(n, radius) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return points;
}

/** Render a skill name to a canvas texture so it can ride on a camera-facing sprite. */
function makeLabelSprite(text, pixelRatio) {
  const fontSize = 64;
  const pad = 16;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;

  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const height = fontSize + pad * 2;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(2, 6, 23, 0.9)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);

  // 0.34 world units tall; width follows the measured text so nothing is squashed.
  const worldHeight = 0.34;
  sprite.scale.set((width / height) * worldHeight, worldHeight, 1);
  return sprite;
}

/** One tilted atom-style orbit with an electron running along it. */
function makeOrbit(tilt, speed) {
  const group = new THREE.Group();
  group.rotation.z = tilt;

  const spinner = new THREE.Group();
  group.add(spinner);

  const curve = new THREE.EllipseCurve(0, 0, ORBIT_RADIUS, ORBIT_RADIUS * 0.62, 0, Math.PI * 2);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
  const material = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 });
  spinner.add(new THREE.Line(geometry, material));

  const electron = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  spinner.add(electron);

  return { group, spinner, electron, speed };
}

export default function SkillsOrb() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Bail out gracefully where WebGL is unavailable rather than throwing.
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = CAMERA_Z;

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const keyLight = new THREE.PointLight(ACCENT, 40, 0, 2);
    keyLight.position.set(4, 4, 4);
    const rimLight = new THREE.PointLight(GLOW, 28, 0, 2);
    rimLight.position.set(-4, -3, -2);
    scene.add(keyLight, rimLight);

    // --- core -------------------------------------------------------------
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 3);
    const basePositions = coreGeometry.attributes.position.array.slice();
    const coreMaterial = new THREE.MeshStandardMaterial({ color: CORE, emissive: ACCENT, emissiveIntensity: 0.12, metalness: 0.9, roughness: 0.15, flatShading: false });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    root.add(core);

    const shellGeometry = new THREE.IcosahedronGeometry(1.02, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true, transparent: true, opacity: 0.28 });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    root.add(shell);

    // --- orbits -----------------------------------------------------------
    const orbits = [makeOrbit(0, 0.35), makeOrbit(Math.PI / 3, 0.28), makeOrbit(-Math.PI / 3, 0.42)];
    orbits.forEach((o) => root.add(o.group));

    // --- skill labels -----------------------------------------------------
    const labelGroup = new THREE.Group();
    root.add(labelGroup);

    const dotGeometry = new THREE.SphereGeometry(0.024, 8, 8);
    const labels = [];

    fibonacciSphere(SKILLS.length, LABEL_RADIUS).forEach((pos, i) => {
      const sprite = makeLabelSprite(SKILLS[i], pixelRatio);
      sprite.position.copy(pos);
      labelGroup.add(sprite);

      const dot = new THREE.Mesh(dotGeometry, new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true }));
      dot.position.copy(pos).multiplyScalar(0.9);
      labelGroup.add(dot);

      labels.push({ sprite, dot, baseY: pos.y, phase: i * 0.7 });
    });

    // --- responsive sizing -------------------------------------------------
    // Scale the whole rig so the outermost labels always stay inside the canvas.
    const fitToViewport = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2) * CAMERA_Z;
      const visibleWidth = visibleHeight * camera.aspect;
      // ~3.6 world units across is the widest the rig gets once labels are counted.
      const scale = THREE.MathUtils.clamp(Math.min(visibleWidth, visibleHeight) / 7.6, 0.45, 1.2);
      root.scale.setScalar(scale);
    };

    fitToViewport();
    const resizeObserver = new ResizeObserver(fitToViewport);
    resizeObserver.observe(mount);

    // --- pointer tilt (desktop only — touch devices have no hover) ---------
    const pointer = { x: 0, y: 0 };
    const usePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion;
    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (usePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    // --- render loop -------------------------------------------------------
    const clock = new THREE.Clock();
    const coreVertex = new THREE.Vector3();
    const coreNormal = new THREE.Vector3();
    const worldPos = new THREE.Vector3();
    let frameId = 0;
    let visible = true;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(mount);

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!reducedMotion) {
        root.rotation.y += delta * 0.14;
        shell.rotation.y += delta * 0.25;
        shell.rotation.x += delta * 0.12;
        shell.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03);

        // Breathing displacement along each vertex normal: the core feels alive.
        const positions = coreGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          coreVertex.fromArray(basePositions, i * 3);
          coreNormal.copy(coreVertex).normalize();
          const wave = Math.sin(coreNormal.x * 3 + t * 1.4) * Math.cos(coreNormal.y * 3 - t) * 0.06;
          coreVertex.addScaledVector(coreNormal, wave);
          positions.setXYZ(i, coreVertex.x, coreVertex.y, coreVertex.z);
        }
        positions.needsUpdate = true;
        coreGeometry.computeVertexNormals();

        orbits.forEach((o) => {
          o.spinner.rotation.z += delta * o.speed;
          const a = t * o.speed * 2.2;
          o.electron.position.set(Math.cos(a) * ORBIT_RADIUS, Math.sin(a) * ORBIT_RADIUS * 0.62, 0);
        });

        labels.forEach((l) => {
          const bob = Math.sin(t * 1.3 + l.phase) * 0.06;
          l.sprite.position.y = l.baseY + bob;
          l.dot.position.y = l.baseY * 0.9 + bob * 0.9;
        });
      }

      // Fade labels that have rotated behind the core so the front ones stay readable.
      {
        root.updateMatrixWorld(true);
        const span = LABEL_RADIUS * root.scale.x;
        labels.forEach((l) => {
          l.sprite.getWorldPosition(worldPos);
          const depth = THREE.MathUtils.clamp((worldPos.z + span) / (span * 2), 0, 1);
          const opacity = 0.12 + depth * 0.88;
          l.sprite.material.opacity = opacity;
          l.dot.material.opacity = opacity;
        });
      }

      if (usePointer) {
        root.rotation.x += (pointer.y * 0.28 - root.rotation.x) * 0.05;
        root.rotation.z += (-pointer.x * 0.12 - root.rotation.z) * 0.05;
      }

      renderer.render(scene, camera);
    };

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (visible && !document.hidden) renderFrame();
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (usePointer) window.removeEventListener("pointermove", onPointerMove);

      labels.forEach(({ sprite, dot }) => {
        sprite.material.map?.dispose();
        sprite.material.dispose();
        dot.material.dispose();
      });
      [coreGeometry, shellGeometry, dotGeometry].forEach((g) => g.dispose());
      [coreMaterial, shellMaterial].forEach((m) => m.dispose());
      orbits.forEach((o) => {
        o.spinner.children.forEach((child) => {
          child.geometry?.dispose();
          child.material?.dispose();
        });
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="h-[260px] w-full sm:h-[340px] lg:h-[460px]" aria-hidden="true" />;
}
