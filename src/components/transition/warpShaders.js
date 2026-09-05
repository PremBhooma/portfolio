/**
 * Fragment shaders for the full-screen warp transitions, plus the per-effect
 * quality tiers the harness uses to pick a render scale and step count.
 */

export const WARP_VERTEX_SHADER = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * A Schwarzschild black hole rendered by tracing photon geodesics per pixel.
 *
 * Rays are integrated in the plane they share with the singularity using the
 * relativistic orbit equation  d²u/dφ² = -u + 1.5·rs·u²  (u = 1/r). Every time a
 * ray crosses the equatorial plane it picks up light from the accretion disk, so
 * the lensed top arc, the mirrored underside and the photon ring all fall out of
 * the physics rather than being faked with layered sprites.
 */
export const blackHoleFragment = (steps) => /* glsl */ `
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

/**
 * A spiral galaxy raymarched as a flared, dusty disk.
 *
 * The disk lives in a slab around y = 0, so each ray is clipped against that slab
 * analytically and only the span inside it is marched — the empty void costs
 * nothing. Density is a logarithmic spiral in (log r, θ) with differential
 * rotation, and dust is carried as absorption rather than emission, which is what
 * produces the dark lanes cutting across the arms.
 */
export const galaxyFragment = (steps) => /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uProgress;   // 0 = distant observer, 1 = inside the core
  uniform float uFade;       // master blackout on the final approach

  #define STEPS ${steps}

  const float SLAB   = 0.85;   // marching bound above/below the midplane
  const float R_MAX  = 7.0;    // disk radius
  const float ARMS   = 2.0;    // two-armed spiral
  const float PITCH  = 2.00;   // how tightly the arms wind

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm2(vec2 p) {
    return 0.57 * noise2(p) + 0.29 * noise2(p * 2.31) + 0.14 * noise2(p * 4.73);
  }

  // Differential rotation: the inner disk laps the rim, which is what winds the arms.
  float spiralPhase(float r, float a) {
    return a + uTime * 0.10 / (0.32 + r * 0.55) + log(r + 0.32) * PITCH;
  }

  float armStrength(float r, float a) {
    float s = spiralPhase(r, a);
    float arms = pow(0.5 + 0.5 * cos(s * ARMS), 2.6);
    // A higher harmonic feathers each arm into the branching spurs real spirals have.
    float feather = pow(0.5 + 0.5 * cos(s * ARMS * 3.0 + 1.7), 3.0) * 0.38;
    return mix(0.10, 1.0, clamp(arms + feather, 0.0, 1.0)); // an inter-arm floor keeps the disk continuous
  }

  // Old, warm bulge in the middle grading out to hot blue star formation at the rim.
  vec3 diskColor(float r, float knots) {
    vec3 col = mix(vec3(1.00, 0.82, 0.52), vec3(0.96, 0.93, 0.98), smoothstep(0.40, 1.90, r));
    col = mix(col, vec3(0.46, 0.70, 1.00), smoothstep(1.90, 4.40, r));
    return col + vec3(0.30, 0.78, 1.00) * knots;
  }

  vec3 starField(vec3 dir) {
    vec3 acc = vec3(0.0);
    for (int k = 0; k < 2; k++) {
      float scale = k == 0 ? 95.0 : 210.0;
      vec3 p = dir * scale;
      vec3 id = floor(p);
      vec3 f = fract(p) - 0.5;
      float h = hash13(id);
      if (h > 0.955) {
        vec2 jitter = vec2(hash13(id + 1.7), hash13(id + 3.1)) - 0.5;
        float d = length(f.xy - jitter * 0.7);
        float bright = smoothstep(0.22, 0.0, d) * (0.35 + h * 0.9);
        acc += mix(vec3(0.72, 0.85, 1.00), vec3(1.00, 0.94, 0.82), hash13(id + 5.3)) * bright;
      }
    }
    return acc;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;

    // Fall towards the core: distance collapses and the field of view opens up.
    float dive = pow(uProgress, 1.5);
    float camR = mix(10.2, 0.20, dive);
    float elev = mix(0.95, 0.30, uProgress); // near face-on, flattening as we drop into the plane
    float fov = mix(0.58, 1.30, uProgress);

    vec3 camPos = vec3(0.0, sin(elev), cos(elev)) * camR;
    vec3 fwd = normalize(-camPos);
    vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, fwd);
    vec3 dir = normalize(fwd + right * uv.x * fov + up * uv.y * fov);

    // Background: stars plus a faint nebula wash, dimmed as the disk engulfs us.
    // Held back until the march is done so the disk can occlude it.
    float depth = 1.0 - smoothstep(0.25, 0.85, uProgress);
    vec3 background = starField(dir) * depth;
    background += vec3(0.05, 0.13, 0.30) * pow(fbm2(dir.xy * 2.1 + 11.0), 3.0) * 0.85 * depth;

    vec3 col = vec3(0.0);
    float transmittance = 1.0;

    // Clip the ray against the disk slab and march only the span inside it.
    float t0 = 0.0;
    float t1 = 34.0;
    if (abs(dir.y) > 1e-4) {
      float ta = (-SLAB - camPos.y) / dir.y;
      float tb = (SLAB - camPos.y) / dir.y;
      t0 = max(min(ta, tb), 0.0);
      t1 = min(max(ta, tb), 34.0);
    } else if (abs(camPos.y) > SLAB) {
      t1 = -1.0; // parallel to the disk and outside it: nothing to march
    }

    if (t1 > t0) {
      float dt = (t1 - t0) / float(STEPS);

      for (int i = 0; i < STEPS; i++) {
        if (transmittance < 0.01) break;

        vec3 p = camPos + dir * (t0 + (float(i) + 0.5) * dt);
        float r = length(p.xz);
        if (r > R_MAX) continue;

        float a = atan(p.z, p.x);
        float arms = armStrength(r, a);

        // Flared slab: the disk thickens with radius, but stays thin enough that a
        // near face-on view doesn't integrate the arms into uniform haze.
        float hh = 0.050 + 0.022 * r;
        float vert = exp(-(p.y * p.y) / (hh * hh));

        // Clumpy gas, dragged around with the arms so it doesn't look painted on.
        float swirl = spiralPhase(r, a) * 0.22;
        vec2 np = vec2(cos(swirl), sin(swirl)) * r * 3.6 + p.xz * 1.10;
        float clumps = fbm2(np);

        float radial = exp(-r * 0.66);
        float density = radial * arms * vert * (0.15 + 1.85 * clumps * clumps);

        // Bulge: an old, concentrated, golden core.
        float bulge = exp(-r * 3.1) * exp(-(p.y * p.y) / 0.055) * 2.9;

        // HII regions — the hot knots strung along the arms.
        float knots = pow(max(clumps - 0.56, 0.0), 1.6) * arms * vert * (1.0 - smoothstep(1.4, 5.2, r));

        // Brightness rides the arm ridges, not the smooth disk in between.
        vec3 emission = diskColor(r, knots * 5.0) * (density * (0.30 + 1.70 * arms) + bulge) + vec3(0.40, 0.82, 1.00) * knots * 5.0;

        // Dust rides with the arms and absorbs without emitting: the dark lanes.
        float dust = smoothstep(0.60, 0.95, fbm2(np * 1.7 + 5.0)) * arms * vert * radial * 3.5;

        col += emission * transmittance * dt * 16.0;
        transmittance *= exp(-(dust + density * 0.55) * dt);
      }
    }

    col += background * transmittance;

    col *= mix(1.0, 1.5, uProgress);
    col = vec3(1.0) - exp(-col);
    col = pow(col, vec3(0.90));
    col *= uFade;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Per-effect settings. Volumetric marching and geodesic tracing are both
 * per-pixel expensive, so each renders below native resolution and is upscaled.
 */
export const WARP_EFFECTS = {
  blackhole: {
    fragment: blackHoleFragment,
    fine: { scale: 0.52, steps: 200 },
    coarse: { scale: 0.40, steps: 140 },
  },
  galaxy: {
    fragment: galaxyFragment,
    fine: { scale: 0.55, steps: 40 },
    coarse: { scale: 0.42, steps: 26 },
  },
};

export const DEFAULT_WARP_EFFECT = "blackhole";
