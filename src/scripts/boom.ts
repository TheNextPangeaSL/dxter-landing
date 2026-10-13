// Easter egg for the marketing demo: "Get started with DxTER" buttons ([data-boom]) blow up
// in a fiery explosion: fireball, secondary blasts, embers, rising smoke, a shockwave,
// a flash and a screen shake. The background scene's points get blasted away too
// (see scene.ts "dxter:boom"). Then the page continues to the button's target as usual.
import { animate } from "animejs";

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; grow: number };
type Ember = P & { color: string };
type Chunk = P & { rot: number; vr: number; w: number; h: number; color: string };

const FIRE_STOPS = [
    [255, 252, 235], // white-hot core
    [255, 222, 110], // yellow
    [255, 150, 40], // orange
    [235, 70, 20], // red
    [120, 30, 15], // dying ember
];
const EMBERS = ["#ffd56b", "#ff9a2e", "#ff6a1f", "#fff2c4"];
const BARS = ["#1f8584", "#50d7e0", "#b7df4d"]; // the three bars of the DxTER mark

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let flames: P[] = [];
let smoke: P[] = [];
let embers: Ember[] = [];
let chunks: Chunk[] = [];
let waves: { x: number; y: number; r: number; max: number; life: number }[] = [];
let flashes: { x: number; y: number; life: number; size: number }[] = [];
let running = false;

// Pre-rendered soft sprites (one per fire colour + smoke) so hundreds of blobs stay cheap.
const sprite = (rgb: number[], soft = 0.45) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(soft, `rgba(${rgb},0.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return c;
};
let fireSprites: HTMLCanvasElement[] = [];
let smokeSprite: HTMLCanvasElement | null = null;

const ensureCanvas = () => {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:100";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    fireSprites = FIRE_STOPS.map((c) => sprite(c));
    smokeSprite = sprite([38, 36, 40], 0.3);
};

const resize = () => {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** One blast. `power` 1 = main explosion, smaller for secondary ones. */
const blast = (x: number, y: number, power: number) => {
    const R = Math.min(innerWidth, innerHeight) * 0.5 * power; // overall reach
    const v0 = R / 22;

    for (let i = 0; i < 140 * power; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rand(0.2, 1) ** 0.6 * v0;
        const max = rand(40, 75);
        flames.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8 - rand(0, 2), life: max, max, size: rand(0.1, 0.26) * R, grow: rand(1.01, 1.025) });
    }
    for (let i = 0; i < 50 * power; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rand(0.1, 0.6) * v0;
        const max = rand(90, 150);
        smoke.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5 - rand(0.5, 1.6), life: max, max, size: rand(0.2, 0.32) * R, grow: rand(1.008, 1.016) });
    }
    for (let i = 0; i < 220 * power; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = rand(0.4, 1.9) * v0;
        const max = rand(50, 120);
        embers.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(1, 5), life: max, max, size: rand(1.2, 3.2), grow: 1, color: EMBERS[(Math.random() * EMBERS.length) | 0] });
    }
    if (power >= 1) {
        for (let i = 0; i < 18; i++) {
            const a = rand(-Math.PI, 0) + rand(-0.5, 0.5);
            const v = rand(0.8, 1.6) * v0;
            const max = rand(90, 140);
            chunks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, life: max, max, size: 0, grow: 1, color: BARS[i % 3], rot: rand(0, Math.PI), vr: rand(-0.35, 0.35), w: rand(8, 13), h: rand(22, 40) });
        }
    }
    waves.push({ x, y, r: 0, max: R * 1.6, life: 1 });
    flashes.push({ x, y, life: 1, size: R * 2.2 });
};

const explode = (x: number, y: number) => {
    ensureCanvas();
    resize();
    blast(x, y, 1);
    const R = Math.min(innerWidth, innerHeight) * 0.25;
    window.setTimeout(() => blast(x + rand(-R, R), y + rand(-R, R * 0.4), 0.55), 140);
    window.setTimeout(() => blast(x + rand(-R, R), y + rand(-R, R * 0.4), 0.45), 300);
    window.setTimeout(() => blast(x + rand(-R, R) * 0.6, y - R * 0.5, 0.4), 470);
    if (!running) {
        running = true;
        requestAnimationFrame(tick);
    }
};

const tick = () => {
    if (!ctx || !canvas) return;
    const W = innerWidth, H = innerHeight;
    ctx.clearRect(0, 0, W, H);

    // Flash: a warm wash across the whole screen.
    flashes = flashes.filter((f) => (f.life -= 0.08) > 0);
    ctx.globalCompositeOperation = "lighter";
    for (const f of flashes) {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        g.addColorStop(0, `rgba(255,220,160,${f.life * 0.5})`);
        g.addColorStop(0.3, `rgba(255,120,40,${f.life * 0.22})`);
        g.addColorStop(1, "rgba(255,80,20,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    // Smoke first (behind the fire), normal blending.
    ctx.globalCompositeOperation = "source-over";
    smoke = smoke.filter((s) => (s.life -= 1) > 0);
    for (const s of smoke) {
        s.vx *= 0.97;
        s.vy = s.vy * 0.97 - 0.05;
        s.x += s.vx;
        s.y += s.vy;
        s.size *= s.grow;
        const k = s.life / s.max;
        ctx.globalAlpha = Math.min(1, (1 - k) * 3) * k * 0.55;
        ctx.drawImage(smokeSprite!, s.x - s.size, s.y - s.size, s.size * 2, s.size * 2);
    }

    // Fireball: additive blobs cooling from white to red as they age.
    ctx.globalCompositeOperation = "lighter";
    flames = flames.filter((f) => (f.life -= 1) > 0);
    for (const f of flames) {
        f.vx *= 0.93;
        f.vy = f.vy * 0.93 - 0.12; // hot air rises
        f.x += f.vx;
        f.y += f.vy;
        f.size *= f.grow;
        const k = f.life / f.max;
        // Cools fast: only the youngest blobs are white-hot.
        const idx = Math.min(FIRE_STOPS.length - 1, Math.floor((1 - k) ** 0.55 * FIRE_STOPS.length));
        ctx.globalAlpha = Math.min(1, k * 1.6) * (idx === 0 ? 0.12 : 0.2);
        ctx.drawImage(fireSprites[idx], f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
    }

    // Shockwave.
    waves = waves.filter((w) => (w.life -= 0.025) > 0);
    for (const w of waves) {
        w.r += (w.max - w.r) * 0.1;
        ctx.globalAlpha = w.life * 0.7;
        ctx.strokeStyle = "rgb(255,190,100)";
        ctx.lineWidth = 3 + 14 * w.life;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Embers: streaks that fall with gravity.
    ctx.lineCap = "round";
    embers = embers.filter((e) => (e.life -= 1) > 0);
    for (const e of embers) {
        e.vx *= 0.965;
        e.vy = e.vy * 0.965 + 0.25;
        e.x += e.vx;
        e.y += e.vy;
        const k = e.life / e.max;
        ctx.globalAlpha = Math.min(1, k * 1.8);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.size * (0.5 + k);
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - e.vx * 2, e.y - e.vy * 2);
        ctx.stroke();
    }

    // Debris: the logo's bars, tumbling.
    ctx.globalCompositeOperation = "source-over";
    chunks = chunks.filter((c) => (c.life -= 1) > 0);
    for (const c of chunks) {
        c.vx *= 0.985;
        c.vy = c.vy * 0.985 + 0.34;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vr;
        ctx.globalAlpha = Math.min(1, (c.life / c.max) * 2);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, c.w / 2);
        ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha = 1;

    if (flames.length || smoke.length || embers.length || chunks.length || waves.length || flashes.length) requestAnimationFrame(tick);
    else {
        running = false;
        ctx.clearRect(0, 0, W, H);
    }
};

const shake = () => {
    const main = document.querySelector("main");
    if (!main) return;
    animate(main, {
        x: [0, -22, 20, -16, 13, -9, 6, -3, 0],
        y: [0, 14, -12, 10, -7, 5, -3, 1, 0],
        rotate: [0, -0.6, 0.5, -0.3, 0.2, 0],
        duration: 900,
        ease: "linear",
        onComplete: () => main.style.removeProperty("transform"),
    });
};

export function initBoom() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    window.addEventListener("resize", resize);

    document.querySelectorAll<HTMLAnchorElement>("[data-boom]").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const r = btn.getBoundingClientRect();
            const x = e.clientX || r.left + r.width / 2;
            const y = e.clientY || r.top + r.height / 2;

            explode(x, y);
            shake();
            window.dispatchEvent(new CustomEvent("dxter:boom", { detail: { x, y } }));
            animate(btn, { scale: [1, 0.8, 1.12, 1], duration: 700, ease: "outElastic(1, .5)" });

            // Continue to the button's target once the blast has had its moment.
            const href = btn.getAttribute("href");
            window.setTimeout(() => {
                if (href?.startsWith("#")) document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
            }, 1300);
        }),
    );
}
