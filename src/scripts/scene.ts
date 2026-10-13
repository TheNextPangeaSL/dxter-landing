// Immersive background scene. A fixed set of points is the common thread of the page:
// as the user scrolls they morph into whatever each section is about (a response surface,
// a constrained experimental space, a bar chart, a convergence plot, an orbit...).
//
// Keyframes are anchored to elements with `data-scene="<key>"`; a keyframe becomes active when
// the anchor's top crosses `data-scene-offset` × viewport height (default 0.55). Scroll only
// picks the active keyframe: the camera and every point then ease towards it over time, so
// the scene never freezes half-way between two shapes.
// 2D shapes are laid out around elements marked `data-shape="<name>"`, so they travel with
// the content they illustrate.

type Formation = "experiments" | "cloud" | "bars" | "chart" | "ring" | "frame" | "target";

interface State {
    x: number; // 3D camera: scene centre, fraction of viewport width
    y: number; // 3D camera: scene centre, fraction of viewport height
    scale: number;
    yaw: number;
    pitch: number;
    amp: number; // surface amplitude (0 = flat plane)
    mesh: number; // surface mesh opacity
    path: number; // hero guided-path opacity
    highlight: number; // recommended candidates glow
    opacity: number; // whole scene opacity
    formation: Formation;
}

const BASE: State = {
    x: 0.71, y: 0.56, scale: 0.84, yaw: -0.55, pitch: 0.62, amp: 1, mesh: 1, path: 1, highlight: 0, opacity: 1, formation: "experiments",
};
const FLAT = { amp: 0, mesh: 0, path: 0, highlight: 0 };

const KEYS: Record<string, Partial<State>> = {
    hero: {},
    reto: { ...FLAT, x: 0.74, y: 0.66, scale: 0.78, yaw: -0.75, pitch: 0.38, formation: "cloud" },
    impact: { ...FLAT, formation: "bars" },
    value: { ...FLAT, formation: "chart" },
    "how-data": { x: 0.71, y: 0.55, scale: 0.92, yaw: -0.9, pitch: 0.75, amp: 0, mesh: 0.35, path: 0 },
    "how-model": { x: 0.71, y: 0.55, scale: 0.95, yaw: -0.6, pitch: 0.66, amp: 1, mesh: 1, path: 0 },
    "how-prior": { x: 0.71, y: 0.55, scale: 1, yaw: -0.4, pitch: 0.62, amp: 1, mesh: 0.6, path: 0, highlight: 1 },
    cycle: { ...FLAT, formation: "ring" },
    platform: { ...FLAT, formation: "frame" },
    hide: { ...FLAT, formation: "frame", opacity: 0 },
    contact: { ...FLAT, formation: "target" },
};

// Phones: keep the 3D shapes centred, smaller and quieter behind text.
const MOBILE: Record<string, Partial<State>> = {
    hero: { x: 0.5, y: 0.62, scale: 0.85, opacity: 0.55 },
    reto: { x: 0.5, y: 0.6, scale: 0.7, opacity: 0.45 },
    "how-data": { x: 0.5, y: 0.3, scale: 0.7 },
    "how-model": { x: 0.5, y: 0.3, scale: 0.7 },
    "how-prior": { x: 0.5, y: 0.3, scale: 0.75 },
    contact: { opacity: 0.6 },
};

const PEAK = { x: 0.36, y: -0.26 };
const N = 56;
const GRID = 42;
const BUCKETS = 12;
const CANDIDATES = 6; // last points sit near the optimum: highlighted as recommendations
const GUIDED = 22; // last points form the "with DxTER" series in the convergence chart

const field = (x: number, y: number, t: number) => {
    const g = (cx: number, cy: number, s: number, a: number) => a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);
    return (
        g(PEAK.x, PEAK.y, 0.075, 1) +
        g(-0.5, 0.34, 0.13, 0.5) +
        g(-0.08, -0.66, 0.05, 0.3) +
        g(0.58, 0.58, 0.07, 0.26) +
        0.05 * Math.sin(3.1 * x + t * 0.55) * Math.cos(2.4 * y - t * 0.4)
    );
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ---------- Deterministic layouts ---------- */
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const experiments: [number, number][] = [];
while (experiments.length < N - CANDIDATES) {
    const p: [number, number] = [rnd() * 0.88, rnd() * 0.88];
    if (Math.hypot(p[0] - PEAK.x, p[1] - PEAK.y) > 0.38) experiments.push(p);
}
for (let i = 0; i < CANDIDATES; i++) {
    const a = (i / CANDIDATES) * Math.PI * 2 + 0.4;
    const r = 0.12 + (i % 2) * 0.08;
    experiments.push([PEAK.x + Math.cos(a) * r, PEAK.y + Math.sin(a) * r]);
}

const CUBE = { r: 0.72, h0: 0.05, h1: 1.25 };
const CONSTRAINT = 0.3; // feasible region: x - z < CONSTRAINT
const cloud = Array.from({ length: N }, () => [rnd() * CUBE.r, rnd() * CUBE.r, (CUBE.h0 + CUBE.h1) / 2 + rnd() * ((CUBE.h1 - CUBE.h0) / 2), rnd() * Math.PI]);

// Convergence chart: noisy, slowly improving trial-and-error vs. a guided series that
// reaches the objective in far fewer iterations. Values are (iteration, result) in 0..1.
const TRAD = N - GUIDED;
const chart = Array.from({ length: N }, (_, i) => {
    if (i < TRAD) {
        const k = i / (TRAD - 1);
        return [k, 0.1 + 0.42 * k + rnd() * 0.16];
    }
    const j = i - TRAD;
    return [(j / (GUIDED - 1)) * 0.5, 0.92 - 0.8 * Math.exp(-j / 3.2) + rnd() * 0.02];
});

const BAR_COUNTS = [8, 12, 16, 20];
const BAR_HEIGHTS = [0.3, 0.5, 0.74, 1];
const bars = (() => {
    const out: [number, number, number][] = []; // column, row, side
    BAR_COUNTS.forEach((count, c) => {
        for (let k = 0; k < count; k++) out.push([c, Math.floor(k / 2), k % 2]);
    });
    return out;
})();

const heroPath: [number, number][] = [
    [-0.62, 0.42],
    [-0.42, 0.08],
    [-0.2, -0.12],
    [0.02, 0.02],
    [0.18, -0.2],
    [PEAK.x, PEAK.y],
];

const COLOR_STOPS = [
    [0, [0, 110, 125, 0.22]],
    [0.3, [20, 150, 170, 0.45]],
    [0.6, [80, 215, 224, 0.8]],
    [0.85, [140, 225, 170, 0.95]],
    [1, [183, 223, 77, 1]],
] as const;
const colorAt = (v: number) => {
    v = clamp01(v);
    for (let i = 1; i < COLOR_STOPS.length; i++) {
        const [p1, c1] = COLOR_STOPS[i];
        const [p0, c0] = COLOR_STOPS[i - 1];
        if (v <= p1) {
            const k = (v - p0) / (p1 - p0);
            const c = c0.map((a, j) => a + (c1[j] - a) * k);
            return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
        }
    }
    return "rgba(183,223,77,1)";
};
const BUCKET_COLORS = Array.from({ length: BUCKETS }, (_, i) => colorAt((i + 0.5) / BUCKETS));

/** A point as drawn: screen position, alpha, radius, lime highlight, stem base (or null) and stem alpha. */
type Dot = { x: number; y: number; a: number; r: number; hl: number; stem: [number, number] | null; stemA?: number };

export function initScene(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1, mobile = false;
    let anchors: { y: number; key: string }[] = [];
    const shapes: Partial<Record<string, HTMLElement>> = {};

    const measure = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        W = window.innerWidth;
        H = window.innerHeight;
        mobile = W < 768;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
            .map((el) => {
                const offset = Number(el.dataset.sceneOffset ?? 0.55);
                const top = el.getBoundingClientRect().top + window.scrollY;
                return { y: el.dataset.scene === "hero" ? 0 : top - H * offset, key: el.dataset.scene! };
            })
            .sort((a, b) => a.y - b.y);
        document.querySelectorAll<HTMLElement>("[data-shape]").forEach((el) => (shapes[el.dataset.shape!] = el));
    };

    const keyState = (key: string): State => ({ ...BASE, ...KEYS[key], ...(mobile ? MOBILE[key] : {}) });

    // Mouse parallax, smoothed.
    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener(
        "pointermove",
        (e) => {
            tx = (e.clientX / W) * 2 - 1;
            ty = (e.clientY / H) * 2 - 1;
        },
        { passive: true },
    );

    const grid = new Float32Array((GRID + 1) * (GRID + 1));
    const pts = new Float32Array((GRID + 1) * (GRID + 1) * 2);
    let lastScroll = -1;

    // Smoothed scene state, formation weights and current dot positions.
    const NUMERIC = ["x", "y", "scale", "yaw", "pitch", "amp", "mesh", "path", "highlight", "opacity"] as const;
    const FORMATIONS: Formation[] = ["experiments", "cloud", "bars", "chart", "ring", "frame", "target"];
    const ANCHORED = new Set<Formation>(["bars", "chart", "ring", "frame", "target"]); // move with the page
    let S: State | null = null;
    const weights = Object.fromEntries(FORMATIONS.map((f) => [f, f === "experiments" ? 1 : 0])) as Record<Formation, number>;
    const cur: Dot[] = [];
    let lastTime = 0;
    let chartStart: number | null = null;

    // Easter egg (boom.ts): blast the points away from the click; they ease back on their own.
    window.addEventListener("dxter:boom", (ev) => {
        const { x, y } = (ev as CustomEvent<{ x: number; y: number }>).detail;
        for (const d of cur) {
            const dx = d.x - x, dy = d.y - y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const force = 700 * Math.exp(-dist / 600) + 80;
            d.x += (dx / dist) * force;
            d.y += (dy / dist) * force;
            d.hl = 1;
        }
    });

    const draw = (time: number) => {
        const t = reduce ? 0 : time / 1000;
        const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 1 / 60;
        lastTime = time;
        const sy = window.scrollY;
        const scrollDelta = lastScroll < 0 ? 0 : sy - lastScroll;

        // Active keyframe = last anchor already crossed.
        let i = 0;
        while (i < anchors.length - 1 && sy >= anchors[i + 1].y) i++;
        const goal = keyState(anchors[i]?.key ?? "hero");
        if (!S) S = { ...goal };
        const ease = reduce ? 1 : 1 - Math.exp(-dt * 2.4);
        NUMERIC.forEach((k) => (S![k] += (goal[k] - S![k]) * ease));
        S.formation = goal.formation;
        FORMATIONS.forEach((f) => (weights[f] += ((f === goal.formation ? 1 : 0) - weights[f]) * ease));

        canvas.style.opacity = S.opacity.toFixed(3);
        if (S.opacity < 0.01 && goal.opacity < 0.01) {
            lastScroll = sy;
            return;
        }

        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;
        const yaw = S.yaw + 0.12 * Math.sin(t * 0.11) + mx * 0.14;
        const pitch = S.pitch + my * 0.05;
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw), cosP = Math.cos(pitch), sinP = Math.sin(pitch);
        const SC = Math.min(W * 0.4, H * 0.5) * S.scale * (mobile ? 1.6 : 1);
        const CX = W * S.x, CY = H * S.y;
        const project = (x: number, z: number, h: number): [number, number] => {
            const xr = x * cosY - z * sinY;
            const zr = x * sinY + z * cosY;
            const Y = h * 0.78;
            const up = Y * cosP + zr * sinP;
            const depth = zr * cosP - Y * sinP;
            const s = 3.6 / (3.6 + depth);
            return [CX + xr * s * SC, CY - up * s * SC];
        };
        const rectOf = (name: string) => shapes[name]?.getBoundingClientRect();

        /* ---------- Formations → screen-space dots ---------- */
        const dotFor = (f: Formation, p: number): Dot => {
            switch (f) {
                case "cloud": {
                    const [x, z, h, ph] = cloud[p];
                    const X = x + 0.03 * Math.sin(t * 0.6 + ph), Z = z + 0.03 * Math.cos(t * 0.5 + ph), Hh = h + 0.04 * Math.sin(t * 0.8 + ph);
                    const [px, py] = project(X, Z, Hh);
                    const feasible = X - Z < CONSTRAINT;
                    return { x: px, y: py, a: feasible ? 0.95 : 0.28, r: 2.6, hl: 0, stem: null };
                }
                case "bars": {
                    const r = rectOf("bars");
                    if (!r) break;
                    const [c, row, side] = bars[p];
                    const maxH = Math.min(220, H * 0.26);
                    const rows = BAR_COUNTS[c] / 2;
                    const colX = r.left + (r.width * (c + 0.5)) / 4;
                    const y = r.top - 28 - (row / Math.max(1, rows - 1)) * maxH * BAR_HEIGHTS[c];
                    return { x: colX + (side ? 8 : -8), y, a: 0.95, r: 3, hl: c === 3 ? 0.35 : 0, stem: null };
                }
                case "chart": {
                    const r = rectOf("chart");
                    if (!r) break;
                    const [k, v] = chart[p];
                    const L = r.left + r.width * 0.08, R = r.right - r.width * 0.08;
                    const T = r.top + r.height * 0.12, Bt = r.bottom - r.height * 0.14;
                    const guided = p >= TRAD;
                    return { x: lerp(L, R, k), y: lerp(Bt, T, v), a: guided ? 1 : 0.7, r: guided ? 3.4 : 2.6, hl: guided ? 1 : 0, stem: null };
                }
                case "ring": {
                    const r = rectOf("ring");
                    if (!r) break;
                    const a = (p / N) * Math.PI * 2 + t * 0.35;
                    const rad = r.width * 0.335 + Math.sin(p * 1.7) * 2;
                    return { x: r.left + r.width * 0.5 + Math.cos(a) * rad, y: r.top + r.height * 0.5 + Math.sin(a) * rad, a: 0.9, r: 2.4, hl: p % 14 === 0 ? 1 : 0, stem: null };
                }
                case "frame": {
                    const r = rectOf("frame");
                    if (!r) break;
                    const pad = 22;
                    const w = r.width + pad * 2, h = r.height + pad * 2;
                    let s = ((p / N + t * 0.02) % 1) * 2 * (w + h);
                    let x = r.left - pad, y = r.top - pad;
                    if (s < w) x += s;
                    else if ((s -= w) < h) (x += w), (y += s);
                    else if ((s -= h) < w) (x += w - s), (y += h);
                    else (s -= w), (y += h - s);
                    return { x, y, a: 0.85, r: 2.2, hl: p % 9 === 0 ? 1 : 0, stem: null };
                }
                case "target": {
                    const r = rectOf("target");
                    if (!r) break;
                    const ring = p % 3;
                    const base = Math.max(r.width, r.height) * 0.5;
                    const rad = base * (1.12 + ring * 0.16);
                    const a = (p / N) * Math.PI * 2 * 3 + t * (ring % 2 ? -0.08 : 0.1);
                    return { x: r.left + r.width / 2 + Math.cos(a) * rad, y: r.top + r.height / 2 + Math.sin(a) * rad, a: 0.9 - ring * 0.2, r: 2.4, hl: ring === 0 ? 1 : 0, stem: null };
                }
            }
            // "experiments" (and fallback): points floating over the response surface.
            const [x, z] = experiments[p];
            const hs = field(x, z, t) * S.amp;
            const [px, py] = project(x, z, hs + 0.08);
            const hl = p >= N - CANDIDATES ? S.highlight : 0;
            return { x: px, y: py, a: 0.92, r: 2.4 + hl * 2.2, hl, stem: project(x, z, hs) };
        };

        ctx.clearRect(0, 0, W, H);

        /* ---------- Response surface (only where a keyframe asks for it) ---------- */
        if (S.mesh > 0.02) {
            for (let a = 0; a <= GRID; a++) {
                for (let b = 0; b <= GRID; b++) {
                    const x = -1 + (2 * a) / GRID, z = -1 + (2 * b) / GRID;
                    const h = field(x, z, t) * S.amp;
                    const k = a * (GRID + 1) + b;
                    grid[k] = h;
                    const [px, py] = project(x, z, h);
                    pts[k * 2] = px;
                    pts[k * 2 + 1] = py;
                }
            }
            const paths = Array.from({ length: BUCKETS }, () => new Path2D());
            const seg = (p: number, q: number) => {
                const v = (grid[p] + grid[q]) / 2;
                const bi = Math.min(BUCKETS - 1, Math.max(0, Math.floor(v * BUCKETS)));
                paths[bi].moveTo(pts[p * 2], pts[p * 2 + 1]);
                paths[bi].lineTo(pts[q * 2], pts[q * 2 + 1]);
            };
            for (let a = 0; a <= GRID; a++) {
                for (let b = 0; b <= GRID; b++) {
                    const k = a * (GRID + 1) + b;
                    if (b < GRID) seg(k, k + 1);
                    if (a < GRID) seg(k, k + GRID + 1);
                }
            }
            ctx.globalAlpha = S.mesh;
            ctx.lineWidth = 1;
            paths.forEach((p, bi) => {
                ctx.strokeStyle = BUCKET_COLORS[bi];
                ctx.stroke(p);
            });
            ctx.globalAlpha = 1;

            const [gx, gy] = project(PEAK.x, PEAK.y, field(PEAK.x, PEAK.y, t) * S.amp);
            const glowA = 0.3 * S.amp * S.mesh;
            if (glowA > 0.01) {
                const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 160);
                glow.addColorStop(0, `rgba(183,223,77,${glowA.toFixed(3)})`);
                glow.addColorStop(1, "rgba(183,223,77,0)");
                ctx.fillStyle = glow;
                ctx.fillRect(gx - 160, gy - 160, 320, 320);
            }
        }

        /* ---------- Per-formation guides (cube, axes, labels) ---------- */
        const weightOf = (f: Formation) => weights[f];

        const cubeW = weightOf("cloud");
        if (cubeW > 0.02) {
            const c = CUBE.r;
            const corners: [number, number, number][] = [];
            for (const h of [CUBE.h0, CUBE.h1]) for (const [x, z] of [[-c, -c], [c, -c], [c, c], [-c, c]]) corners.push([x, z, h]);
            const P = corners.map(([x, z, h]) => project(x, z, h));
            ctx.strokeStyle = `rgba(80,215,224,${(0.45 * cubeW).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            for (let k = 0; k < 4; k++) {
                const n = (k + 1) % 4;
                ctx.moveTo(...P[k]);
                ctx.lineTo(...P[n]);
                ctx.moveTo(...P[k + 4]);
                ctx.lineTo(...P[n + 4]);
                ctx.moveTo(...P[k]);
                ctx.lineTo(...P[k + 4]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            // Constraint plane x - z = CONSTRAINT slicing the space.
            const e1: [number, number] = [c, c - CONSTRAINT], e2: [number, number] = [-c + CONSTRAINT, -c];
            const Q = [project(e1[0], e1[1], CUBE.h0), project(e2[0], e2[1], CUBE.h0), project(e2[0], e2[1], CUBE.h1), project(e1[0], e1[1], CUBE.h1)];
            ctx.beginPath();
            Q.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.closePath();
            ctx.fillStyle = `rgba(183,223,77,${(0.035 * cubeW).toFixed(3)})`;
            ctx.fill();
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = `rgba(183,223,77,${(0.3 * cubeW).toFixed(3)})`;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const chartW = weightOf("chart");
        const chartRect = rectOf("chart");
        // The chart draws itself once the section is active (not tied to scroll position).
        if (S.formation === "chart") chartStart ??= t;
        else chartStart = null;
        const chartProgress = reduce ? 1 : chartStart === null ? 0 : clamp01((t - chartStart - 0.6) / 1.8);
        if (chartW > 0.02 && chartRect) {
            const r = chartRect;
            const L = r.left + r.width * 0.08, R = r.right - r.width * 0.08;
            const T = r.top + r.height * 0.08, Bt = r.bottom - r.height * 0.14;
            ctx.strokeStyle = `rgba(255,255,255,${(0.18 * chartW).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(L, T);
            ctx.lineTo(L, Bt);
            ctx.lineTo(R, Bt);
            ctx.stroke();
            // Objective level.
            const goalY = lerp(Bt, r.top + r.height * 0.12, 0.92);
            ctx.setLineDash([2, 6]);
            ctx.strokeStyle = `rgba(183,223,77,${(0.35 * chartW).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(L, goalY);
            ctx.lineTo(R, goalY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        /* ---------- Points (the common thread) ---------- */
        // Anchored shapes travel with the page: shift dots with the scroll so only the
        // morph itself is eased, never the content-following.
        const follow = ANCHORED.has(S.formation) ? scrollDelta : 0;
        const dots = cur;
        let travel = 0; // mean distance still to cover
        for (let p = 0; p < N; p++) {
            const g = dotFor(S.formation, p);
            const d = dots[p];
            if (!d) {
                dots[p] = { ...g };
                continue;
            }
            d.y -= follow;
            // Slightly different pace per point → organic swarm.
            const k = reduce ? 1 : 1 - Math.exp(-dt * (2.1 + (p % 9) * 0.28));
            d.x += (g.x - d.x) * k;
            d.y += (g.y - d.y) * k;
            d.a += (g.a - d.a) * k;
            d.r += (g.r - d.r) * k;
            d.hl += (g.hl - d.hl) * k;
            // Stems only once the dot has landed on the surface.
            const off = Math.hypot(g.x - d.x, g.y - d.y);
            travel += off / N;
            d.stem = g.stem && off < 30 ? [g.stem[0] + (d.x - g.x), g.stem[1] + (d.y - g.y)] : null;
            d.stemA = g.stem ? 1 - off / 30 : 0;
        }

        // Chart series lines, drawn progressively with the scroll.
        // Lines and labels only while the points are actually laid out as the chart.
        const chartLines = S.formation === "chart" ? clamp01((chartW - 0.75) / 0.25) * clamp01(1 - travel / 40) : 0;
        if (chartLines > 0.01 && chartRect) {
            const series = (from: number, to: number, color: string, width: number, dash: number[]) => {
                const count = to - from;
                const shown = chartProgress * (count - 1);
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.setLineDash(dash);
                ctx.beginPath();
                for (let k = 0; k <= Math.min(count - 1, Math.ceil(shown)); k++) {
                    const d = dots[from + k];
                    if (k === 0) ctx.moveTo(d.x, d.y);
                    else {
                        const prev = dots[from + k - 1];
                        const f = Math.min(1, shown - (k - 1));
                        ctx.lineTo(lerp(prev.x, d.x, f), lerp(prev.y, d.y, f));
                    }
                }
                ctx.stroke();
                ctx.setLineDash([]);
            };
            series(0, TRAD, `rgba(220,245,248,${(0.25 * chartLines).toFixed(3)})`, 1, []);
            series(TRAD, N, `rgba(183,223,77,${(0.9 * chartLines).toFixed(3)})`, 2, [5, 5]);

            const el = shapes.chart!;
            ctx.font = "500 12px 'JetBrains Mono', monospace";
            ctx.textBaseline = "middle";
            const lastT = dots[TRAD - 1], lastG = dots[N - 1];
            ctx.fillStyle = `rgba(220,245,248,${(0.6 * chartLines * chartProgress).toFixed(3)})`;
            ctx.textAlign = "right";
            ctx.fillText((el.dataset.labelA ?? "").toUpperCase(), lastT.x, lastT.y - 18);
            ctx.fillStyle = `rgba(183,223,77,${(chartLines * chartProgress).toFixed(3)})`;
            ctx.textAlign = "left";
            ctx.fillText((el.dataset.labelB ?? "").toUpperCase(), lastG.x + 14, lastG.y - 16);
        }

        for (let p = 0; p < N; p++) {
            const d = dots[p];
            if (d.stem) {
                ctx.strokeStyle = `rgba(220,245,248,${(0.3 * (d.stemA ?? 1)).toFixed(3)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(d.stem[0], d.stem[1]);
                ctx.lineTo(d.x, d.y);
                ctx.stroke();
            }
            ctx.fillStyle =
                d.hl > 0.05
                    ? `rgba(${lerp(235, 183, d.hl) | 0},${lerp(250, 223, d.hl) | 0},${lerp(252, 77, d.hl) | 0},${d.a.toFixed(3)})`
                    : `rgba(235,250,252,${d.a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
            if (d.hl > 0.6 && S.formation !== "chart") {
                const pulse = reduce ? 0.5 : (t * 0.7 + p * 0.17) % 1;
                ctx.strokeStyle = `rgba(183,223,77,${((1 - pulse) * d.hl * 0.7).toFixed(3)})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r + 2 + pulse * 14, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        /* ---------- Hero: guided path climbing to the optimum ---------- */
        if (S.path > 0.02) {
            const progress = reduce ? 1 : Math.min(1, ((t % 9) / 9) * 1.45);
            const shown = progress * (heroPath.length - 1);
            const nodes = heroPath.map(([x, z]) => project(x, z, field(x, z, t) * S.amp + 0.08));
            ctx.globalAlpha = S.path;
            ctx.strokeStyle = "rgba(183,223,77,0.9)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -t * 18;
            ctx.beginPath();
            ctx.moveTo(...nodes[0]);
            for (let n = 1; n < nodes.length && n - 1 < shown; n++) {
                const f = Math.min(1, shown - (n - 1));
                const [ox, oy] = nodes[n - 1], [nx, ny] = nodes[n];
                ctx.lineTo(ox + (nx - ox) * f, oy + (ny - oy) * f);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            nodes.forEach(([nx, ny], n) => {
                if (n > shown + 0.001) return;
                const last = n === nodes.length - 1;
                ctx.fillStyle = last ? "#b7df4d" : "#0a3a4a";
                ctx.strokeStyle = "#b7df4d";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(nx, ny, last ? 6.5 : 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                if (last) {
                    const pulse = reduce ? 0.5 : (t * 0.8) % 1;
                    ctx.strokeStyle = `rgba(183,223,77,${1 - pulse})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(nx, ny, 6 + pulse * 24, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
            ctx.globalAlpha = 1;
        }
        lastScroll = sy;
    };

    measure();
    let raf = 0;
    const loop = (time: number) => {
        if (!reduce || window.scrollY !== lastScroll) draw(time);
        raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let resizeTimer = 0;
    const remeasure = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            measure();
            lastScroll = -1;
        }, 120);
    };
    window.addEventListener("resize", remeasure);
    // Layout shifts (fonts, images) move anchors.
    new ResizeObserver(remeasure).observe(document.body);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(loop);
    });
}
