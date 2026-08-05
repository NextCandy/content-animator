"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

/** Ref to the element that actually scrolls (the Lenis wrapper). */
export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Single scrolling wrapper. The document itself does not scroll (see
 * `html, body { overflow: hidden }` in styles.css); Lenis drives this element.
 * With prefers-reduced-motion the wrapper falls back to native scrolling.
 */
export function ScrollContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper || prefersReducedMotion()) return;

    const instance = new Lenis({
      wrapper,
      content: wrapper.firstElementChild as HTMLElement,
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    setLenis(instance);

    let raf = 0;
    const tick = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Anchor navigation (#features, #pricing, ...) inside the scroll container.
  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;

    const scrollToHash = (hash: string, immediate = false) => {
      const id = hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: 0, immediate });
      } else {
        el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href") ?? "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;
      const hash = href.slice(hashIndex);
      const path = href.slice(0, hashIndex);
      if (path && path !== "/" && path !== window.location.pathname) return;
      if (!document.getElementById(hash.slice(1))) return;
      event.preventDefault();
      window.history.replaceState(null, "", hash);
      scrollToHash(hash);
    };

    document.addEventListener("click", onClick);
    if (window.location.hash) {
      const t = setTimeout(() => scrollToHash(window.location.hash, true), 120);
      return () => {
        clearTimeout(t);
        document.removeEventListener("click", onClick);
      };
    }
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return (
    <ScrollContainerContext.Provider value={ref}>
      <div
        ref={ref}
        className="lenis relative h-dvh overflow-x-clip overflow-y-auto overscroll-none"
      >
        <div>{children}</div>
      </div>
    </ScrollContainerContext.Provider>
  );
}
