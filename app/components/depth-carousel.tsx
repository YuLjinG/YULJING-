"use client";

// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import "./depth-carousel.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeItem = (item) => typeof item === "string" ? { image: item, alt: "" } : item;

export default function DepthCarousel({
  items = [],
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = "#05060a",
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = "power3.out",
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  onItemClick,
  className = "",
}) {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const count = data.length;
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);
  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const dragRef = useRef(null);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);
  const dragFrameRef = useRef(null);
  const pendingDragRef = useRef(null);
  const isInViewportRef = useRef(true);
  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;
  cfgRef.current = { count, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, ease, loop, cardWidth, autoplayDelay };

  const layout = useCallback((pos) => {
    const cfg = cfgRef.current;
    if (!cfg.count) return;
    const direction = cfg.tiltDirection === "left" ? -1 : 1;
    for (let index = 0; index < cfg.count; index += 1) {
      const card = cardRefs.current[index];
      if (!card) continue;
      let distance = index - pos;
      if (cfg.loop && cfg.count > 1) {
        distance = ((distance % cfg.count) + cfg.count) % cfg.count;
        if (distance > cfg.count / 2) distance -= cfg.count;
      }
      const back = Math.max(0, distance);
      const shown = Math.abs(distance) <= cfg.visibleCards + 0.5;
      const translateZ = -cfg.depth * distance;
      const translateX = direction * cfg.spread * distance;
      const rotateY = direction * cfg.tilt * clamp(distance, 0, 1);
      let opacity = distance < 0 ? Math.max(0, 1 + distance) : 1;
      if (!shown) opacity = 0;
      const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      card.style.transform = `translate(-50%, -50%) scale(${scaleRef.current}) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = blurPx > 0 ? `blur(${blurPx.toFixed(2)}px)` : "none";
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = shown && opacity > 0.05 ? "auto" : "none";
      const overlay = overlayRefs.current[index];
      if (overlay) overlay.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback((index) => {
    setActive(index);
    onChangeRef.current?.(index, data[index]);
  }, [data]);

  const tweenTo = useCallback((target, animate) => {
    tweenRef.current?.kill();
    const cfg = cfgRef.current;
    const proxy = { position: posRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: target,
      duration: animate && !reducedRef.current ? cfg.duration / 1000 : 0,
      ease: cfg.ease,
      onUpdate: () => { posRef.current = proxy.position; layout(proxy.position); },
      onComplete: () => {
        if (cfg.count > 0) posRef.current = ((posRef.current % cfg.count) + cfg.count) % cfg.count;
        layout(posRef.current);
      },
    });
  }, [layout]);

  const setFocus = useCallback((rawIndex, animate = true) => {
    const cfg = cfgRef.current;
    if (!cfg.count) return;
    const index = cfg.loop ? ((rawIndex % cfg.count) + cfg.count) % cfg.count : clamp(rawIndex, 0, cfg.count - 1);
    let delta = index - posRef.current;
    if (cfg.loop && cfg.count > 1) {
      delta = ((delta % cfg.count) + cfg.count) % cfg.count;
      if (delta > cfg.count / 2) delta -= cfg.count;
    }
    tweenTo(posRef.current + delta, animate);
    if (index !== focusRef.current) {
      focusRef.current = index;
      notify(index);
    }
  }, [notify, tweenTo]);

  const navigateBy = useCallback((step) => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const needed = cardWidth + Math.abs(spread) * 2 + 120;
      const minScale = window.innerWidth >= 900 ? 0.82 : 0.4;
      scaleRef.current = clamp(entry.contentRect.width / needed, minScale, 1);
      layout(posRef.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [cardWidth, layout, spread]);

  const onPointerDown = useCallback((event) => {
    if (count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = { x: event.clientX, startPos: posRef.current, lastX: event.clientX, lastT: performance.now(), velocity: 0, moved: false, id: event.pointerId };
  }, [count]);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stepPx = Math.max(cardWidth * 0.55 * scaleRef.current, 40);
    const deltaX = event.clientX - drag.x;
    if (!drag.moved && Math.abs(deltaX) > 4) {
      drag.moved = true;
      rootRef.current?.setPointerCapture(drag.id);
    }
    if (!drag.moved) return;
    const now = performance.now();
    drag.velocity = (event.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
    drag.lastX = event.clientX;
    drag.lastT = now;
    pendingDragRef.current = { position: drag.startPos - deltaX / stepPx };
    if (dragFrameRef.current) return;
    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      const pending = pendingDragRef.current;
      pendingDragRef.current = null;
      if (!pending) return;
      posRef.current = pending.position;
      layout(posRef.current);
    });
  }, [cardWidth, layout]);

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    if (dragFrameRef.current) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    const pending = pendingDragRef.current;
    pendingDragRef.current = null;
    if (pending) {
      posRef.current = pending.position;
      layout(posRef.current);
    }
    const stepPx = Math.max(cardWidth * 0.55 * scaleRef.current, 40);
    setFocus(Math.round(posRef.current - (drag.velocity * 180) / stepPx), true);
  }, [cardWidth, setFocus]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!autoplay || reducedRef.current || count < 2) return undefined;
    const root = rootRef.current;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    const viewportObserver = new IntersectionObserver(([entry]) => {
      isInViewportRef.current = entry.isIntersecting;
    }, { threshold: 0.08 });
    if (root) viewportObserver.observe(root);
    autoTimerRef.current = window.setInterval(() => {
      if (!paused && isInViewportRef.current && !document.hidden) navigateBy(1);
    }, Math.max(autoplayDelay, 600));
    root?.addEventListener("mouseenter", pause);
    root?.addEventListener("mouseleave", resume);
    root?.addEventListener("focusin", pause);
    root?.addEventListener("focusout", resume);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      root?.removeEventListener("mouseenter", pause);
      root?.removeEventListener("mouseleave", resume);
      root?.removeEventListener("focusin", pause);
      root?.removeEventListener("focusout", resume);
      viewportObserver.disconnect();
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => { layout(posRef.current); }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, count]);
  useEffect(() => () => {
    tweenRef.current?.kill();
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    if (dragFrameRef.current) window.cancelAnimationFrame(dragFrameRef.current);
  }, []);

  const handleCardClick = (index) => {
    if (dragRef.current?.moved) return;
    if (index === focusRef.current) onItemClick?.(index, data[index]);
    else setFocus(index, true);
  };

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ "--dc-perspective": `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="产品摄影作品轮播"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); navigateBy(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); navigateBy(1); }
      }}
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => (
          <button
            type="button"
            key={item.image}
            className="depth-carousel__card"
            ref={(element) => { cardRefs.current[index] = element; }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-label={`${item.alt || "产品摄影"}，第 ${index + 1} 张，共 ${count} 张`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => handleCardClick(index)}
          >
            <img className="depth-carousel__img" src={item.image} alt={item.alt || ""} draggable={false} />
            <span className="depth-carousel__tint" ref={(element) => { overlayRefs.current[index] = element; }} style={{ background: tint }} />
          </button>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="上一张作品" onClick={(event) => { event.stopPropagation(); navigateBy(-1); }}>‹</button>
          <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" aria-label="下一张作品" onClick={(event) => { event.stopPropagation(); navigateBy(1); }}>›</button>
        </>
      )}
      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="作品分页">
          {data.map((item, index) => <button key={item.image} type="button" role="tab" aria-selected={active === index} aria-label={`切换到第 ${index + 1} 张`} className={`depth-carousel__dot${active === index ? " is-active" : ""}`} onClick={() => setFocus(index, true)} />)}
        </div>
      )}
    </div>
  );
}
