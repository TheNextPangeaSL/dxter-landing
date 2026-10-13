// Section-by-section scrolling ("one gesture = one section") for desktop.
// Slides are elements marked `data-slide`. A wheel/trackpad gesture or a navigation key
// animates to the next/previous slide. Slides taller than the viewport scroll natively
// inside until their edge is reached; the next gesture then moves on.
// Touch gestures never fire wheel events, so phones/tablets keep normal scrolling; so do
// reduced-motion users.

const DURATION = 950;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function initSnap() {
    const enabled = matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const root = document.documentElement;

    let slides: { top: number; bottom: number }[] = [];
    const measure = () => {
        slides = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"))
            .map((el) => {
                const r = el.getBoundingClientRect();
                return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) };
            })
            .sort((a, b) => a.top - b.top);
    };
    measure();
    window.addEventListener("resize", measure);
    new ResizeObserver(measure).observe(document.body);

    let animating = false;
    let lockedUntil = 0; // swallow trackpad inertia after a jump
    let lastWheel = 0;
    let lastWasNative = false;

    const maxScroll = () => root.scrollHeight - innerHeight;

    const scrollTo = (target: number) => {
        target = Math.max(0, Math.min(maxScroll(), Math.round(target)));
        const from = scrollY;
        if (Math.abs(target - from) < 2) return;
        animating = true;
        root.style.scrollBehavior = "auto";
        const start = performance.now();
        const step = (now: number) => {
            const k = Math.min(1, (now - start) / DURATION);
            window.scrollTo(0, from + (target - from) * easeInOut(k));
            if (k < 1) requestAnimationFrame(step);
            else {
                animating = false;
                lockedUntil = performance.now() + 250;
                root.style.removeProperty("scroll-behavior");
            }
        };
        requestAnimationFrame(step);
    };

    /** Index of the slide currently filling the viewport (the last one whose top is reached). */
    const currentIndex = () => {
        const y = scrollY + 4;
        let i = 0;
        while (i < slides.length - 1 && slides[i + 1].top <= y) i++;
        return i;
    };

    /**
     * "native": let the browser scroll (inside a tall slide).
     * "jump": animated to another slide. "stop": at an edge but not allowed to jump yet.
     */
    const go = (dir: 1 | -1, allowJump = true): "native" | "jump" | "stop" => {
        const H = innerHeight;
        const i = currentIndex();
        const cur = slides[i];
        if (!cur) return "native";
        const viewTop = scrollY, viewBottom = scrollY + H;

        // Inside a tall slide: let the page scroll natively until its edge.
        if (dir > 0 && cur.bottom > viewBottom + 4) return "native";
        if (dir < 0 && cur.top < viewTop - 4) return "native";
        if (!allowJump) return "stop";

        if (dir > 0) {
            const next = slides[i + 1];
            if (!next) return "native"; // last slide: footer scrolls naturally
            scrollTo(next.top);
        } else {
            const prev = slides[i - 1];
            if (!prev) return "native";
            // Tall previous slide: arrive at its bottom so nothing is skipped.
            scrollTo(Math.max(prev.top, prev.bottom - H));
        }
        return "jump";
    };

    /** True when the wheel happens over an element that can still scroll that way. */
    const innerScrollable = (el: EventTarget | null, dy: number) => {
        for (let n = el instanceof HTMLElement ? el : null; n && n !== document.body; n = n.parentElement) {
            const oy = getComputedStyle(n).overflowY;
            if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 1) {
                if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
                if (dy < 0 && n.scrollTop > 0) return true;
            }
        }
        return false;
    };

    window.addEventListener(
        "wheel",
        (e) => {
            if (!enabled.matches || e.ctrlKey) return;
            if (!animating && innerScrollable(e.target, e.deltaY)) {
                lastWasNative = true;
                return;
            }
            const now = performance.now();
            const gap = now - lastWheel;
            lastWheel = now;
            if (animating) {
                e.preventDefault();
                return;
            }
            // Trackpad inertia keeps firing after a jump: ignore it until the gesture pauses.
            if (now < lockedUntil || (lockedUntil && gap < 120)) {
                e.preventDefault();
                lockedUntil = Math.max(lockedUntil, now + 120);
                return;
            }
            lockedUntil = 0;
            if (Math.abs(e.deltaY) < 3) return;
            // Momentum from scrolling inside a tall slide must not fling us into the next one.
            const result = go(e.deltaY > 0 ? 1 : -1, !(lastWasNative && gap < 120));
            lastWasNative = result !== "jump";
            if (result !== "native") e.preventDefault();
        },
        { passive: false },
    );

    window.addEventListener("keydown", (e) => {
        if (!enabled.matches || e.altKey || e.ctrlKey || e.metaKey) return;
        const target = e.target as HTMLElement;
        if (target.closest("input, textarea, select, [contenteditable], button, summary")) return;
        const down = ["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey;
        const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
        if (!down && !up) return;
        if (animating) return e.preventDefault();
        if (go(down ? 1 : -1) !== "native") e.preventDefault();
    });
}
