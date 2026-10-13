// Page-wide motion layer built on anime.js.
// Elements marked `.reveal` start hidden (see landing.css) and are revealed here.
import { animate, createAnimatable, createTimeline, onScroll, scrambleText, splitText, stagger, svg } from "animejs";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

const EASE = "outExpo";

/** Show everything immediately (reduced motion or failure fallback). */
const showAll = () => document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("is-visible"));

/** Split a heading into clipped lines and slide them up. */
const revealHeading = (el: HTMLElement, delay = 0) => {
    el.classList.add("split-lines");
    const split = splitText(el, { lines: { wrap: "clip" } });
    el.style.opacity = "1";
    return animate(split.lines, {
        y: ["105%", "0%"],
        duration: 1200,
        delay: stagger(110, { start: delay }),
        ease: EASE,
    });
};

/** Draw an element's stroke icons. */
const drawIcons = (root: Element, delay = 0) => {
    const shapes = root.querySelectorAll(".icon-tile svg > *");
    if (!shapes.length) return;
    animate(svg.createDrawable(shapes), {
        draw: ["0 0", "0 1"],
        duration: 1100,
        delay: stagger(60, { start: delay }),
        ease: "inOutQuart",
    });
};

/** Scramble-in mono labels. */
const scramble = (el: HTMLElement, delay = 0) => {
    el.style.opacity = "1";
    animate(el, {
        innerHTML: scrambleText({ chars: "A-Z0-9", cursor: "_" }),
        duration: 900,
        delay,
    });
};

const revealElement = (el: HTMLElement, delay: number) => {
    if (el.classList.contains("h-display")) {
        revealHeading(el, delay);
    } else if (el.classList.contains("eyebrow")) {
        scramble(el, delay);
    } else {
        animate(el, {
            opacity: [0, 1],
            y: [36, 0],
            duration: 1100,
            delay,
            ease: "outQuart",
        });
    }
    drawIcons(el, delay + 150);
    el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => countUp(n, delay + 200));
};

/** Animate a number from data-count-from (or 0) to data-count. */
const countUp = (el: HTMLElement, delay = 0) => {
    const to = Number(el.dataset.count);
    const from = Number(el.dataset.countFrom ?? 0);
    const obj = { v: from };
    el.textContent = String(from);
    animate(obj, {
        v: to,
        duration: 1600,
        delay,
        ease: "outExpo",
        onUpdate: () => (el.textContent = String(Math.round(obj.v))),
    });
};

/* ---------- Hero intro ---------- */
const heroIntro = () => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const h1 = hero.querySelector<HTMLElement>("h1")!;
    const items = (sel: string) => Array.from(hero.querySelectorAll<HTMLElement>(sel));

    h1.classList.add("split-lines");
    const split = splitText(h1, { lines: { wrap: "clip" } });
    h1.style.opacity = "1";

    const tl = createTimeline({ defaults: { ease: EASE } });
    tl.add("#site-nav", { opacity: [0, 1], y: [-24, 0], duration: 1000 }, 0)
        .add("#scene-wrap", { opacity: [0, 1], scale: [1.06, 1], duration: 2400, ease: "outQuart" }, 0)
        .add(items("[data-hero='badge']"), { opacity: [0, 1], y: [20, 0], duration: 900 }, 150)
        .add(split.lines, { y: ["105%", "0%"], duration: 1400, delay: stagger(140) }, 250)
        .add(items("[data-hero='lead']"), { opacity: [0, 1], y: [24, 0], duration: 1100 }, 650)
        .add(items("[data-hero='cta'] > *"), { opacity: [0, 1], y: [24, 0], duration: 1000, delay: stagger(90) }, 800)
        .add(items("[data-hero='chip']"), { opacity: [0, 1], y: [30, 0], scale: [0.94, 1], duration: 1200, delay: stagger(180) }, 1100)
        .add(items("[data-hero='proof']"), { opacity: [0, 1], y: [20, 0], duration: 1000, delay: stagger(100) }, 1000);

    tl.call(() => drawIcons(hero), 1200);
};

/* ---------- Scroll reveals (batched so siblings stagger) ---------- */
const scrollReveals = () => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal")).filter((el) => !el.closest("#top, #site-nav, #scene-wrap"));
    const io = new IntersectionObserver(
        (entries) => {
            const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
            batch.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
            batch.forEach((el, i) => {
                io.unobserve(el);
                revealElement(el, i * 90);
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    targets.forEach((el) => io.observe(el));
};

/* ---------- Scroll-linked set pieces ---------- */
const scrollScenes = () => {
    const sync = (target: Element, enter = "bottom top", leave = "center center") =>
        onScroll({ target, enter, leave, sync: 0.25 });

    const app = document.querySelector("[data-tilt]");
    if (app) {
        animate(app, {
            rotateX: [22, 0],
            scale: [0.88, 1],
            y: [60, 0],
            ease: "linear",
            autoplay: sync(app, "bottom top", "center center"),
        });
    }

    document.querySelectorAll("[data-scene='lift']").forEach((el) => {
        animate(el, { scale: [0.9, 1], y: [50, 0], ease: "linear", autoplay: sync(el) });
    });

    document.querySelectorAll("[data-scene='parallax']").forEach((el) => {
        animate(el, { y: [-40, 40], ease: "linear", autoplay: onScroll({ target: el, enter: "bottom top", leave: "top bottom", sync: true }) });
    });
};

/* ---------- Magnetic buttons ---------- */
const magnetic = () => {
    if (!finePointer) return;
    document.querySelectorAll<HTMLElement>(".btn-primary, .btn-lime").forEach((btn) => {
        const a = createAnimatable(btn, { x: 500, y: 500, ease: "out(3)" });
        btn.addEventListener("pointermove", (e) => {
            const r = btn.getBoundingClientRect();
            a.x((e.clientX - (r.left + r.width / 2)) * 0.25);
            a.y((e.clientY - (r.top + r.height / 2)) * 0.35);
        });
        btn.addEventListener("pointerleave", () => {
            a.x(0);
            a.y(0);
        });
    });
};

if (reduce) {
    showAll();
} else {
    try {
        heroIntro();
        scrollReveals();
        scrollScenes();
        magnetic();
    } catch (err) {
        console.error(err);
        showAll();
    }
}
