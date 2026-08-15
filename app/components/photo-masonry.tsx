"use client";

import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./photo-masonry.css";

type MasonryItem = { id: string; aspectRatio: number };

function useMediaColumns() {
  const getColumns = () => {
    if (typeof window === "undefined") return 2;
    if (window.matchMedia("(min-width:1500px)").matches) return 5;
    if (window.matchMedia("(min-width:1000px)").matches) return 4;
    if (window.matchMedia("(min-width:600px)").matches) return 3;
    return window.matchMedia("(min-width:400px)").matches ? 2 : 1;
  };
  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const update = () => setColumns(getColumns());
    const queries = ["(min-width:1500px)", "(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"];
    queries.forEach((query) => window.matchMedia(query).addEventListener("change", update));
    return () => queries.forEach((query) => window.matchMedia(query).removeEventListener("change", update));
  }, []);

  return columns;
}

export function PhotoMasonry({ items, renderItem }: { items: MasonryItem[]; renderItem: (item: MasonryItem) => ReactNode }) {
  const columns = useMediaColumns();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [width, setWidth] = useState(0);
  const hasMountedRef = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const grid = useMemo(() => {
    if (!width) return [];
    const columnHeights = new Array(columns).fill(0);
    const gap = Math.max(6, Math.min(14, width * 0.014));
    const itemWidth = (width - gap * (columns - 1)) / columns;
    return items.map((item) => {
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      const height = itemWidth / item.aspectRatio;
      const x = column * (itemWidth + gap);
      const y = columnHeights[column];
      columnHeights[column] += height + gap;
      return { ...item, x, y, width: itemWidth, height };
    });
  }, [columns, items, width]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !grid.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const galleryHeight = Math.max(...grid.map((item) => item.y + item.height));
    root.style.height = `${Math.ceil(galleryHeight)}px`;

    grid.forEach((item, index) => {
      const element = itemRefs.current[index];
      if (!element) return;
      const layout = { x: item.x, y: item.y, width: item.width, height: item.height };
      if (!hasMountedRef.current && !reduceMotion) {
        gsap.fromTo(element, { opacity: 0, x: item.x, y: window.innerHeight + 120, width: item.width, height: item.height }, { opacity: 1, ...layout, duration: 0.72, ease: "power3.out", delay: index * 0.055, overwrite: "auto" });
      } else {
        gsap.to(element, { opacity: 1, ...layout, duration: reduceMotion ? 0 : 0.42, ease: "power2.out", overwrite: "auto" });
      }
    });
    hasMountedRef.current = true;
  }, [grid]);

  return (
    <div className="photo-masonry" ref={rootRef}>
      {grid.map((item, index) => (
        <div
          className="photo-masonry-item"
          data-key={item.id}
          key={item.id}
          ref={(element) => { itemRefs.current[index] = element; }}
          onPointerEnter={(event) => gsap.to(event.currentTarget, { scale: 0.97, duration: 0.24, ease: "power2.out", overwrite: "auto" })}
          onPointerLeave={(event) => gsap.to(event.currentTarget, { scale: 1, duration: 0.24, ease: "power2.out", overwrite: "auto" })}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
