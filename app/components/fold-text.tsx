"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";

const HINGE_CONFIG = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
} as const;

type FoldTextProps = {
  text: string;
  splitBy?: "char" | "word" | "line";
  hinge?: keyof typeof HINGE_CONFIG;
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  creaseShading?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  color?: string;
  triggerOnView?: boolean;
  className?: string;
  style?: CSSProperties;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function FoldText({
  text,
  splitBy = "char",
  hinge = "top",
  duration = 0.65,
  stagger = 0.045,
  ease = "power3.out",
  perspective = 700,
  creaseShading = 0.55,
  fontSize = "inherit",
  fontWeight = "inherit",
  color = "currentColor",
  triggerOnView = false,
  className = "",
  style = {},
}: FoldTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hingeConfig = HINGE_CONFIG[hinge];
  const safeCrease = clamp(creaseShading, 0, 1);
  const safePerspective = Math.max(120, perspective);

  const segments = useMemo(() => {
    if (splitBy === "line") {
      return text.split("\n").map((line, index) => (
        <span className="fold-text-line" key={`line-${index}`}>
          <span className="fold-text-segment" style={{ "--fold-perspective": `${safePerspective}px` } as CSSProperties}>
            <span className="fold-text-piece" style={{ transformOrigin: hingeConfig.origin } as CSSProperties}>
              {line || "\u00A0"}
            </span>
          </span>
        </span>
      ));
    }

    if (splitBy === "word") {
      return text.split(/(\s+)/).map((part, index) => {
        if (part === "\n") return <br key={`br-${index}`} />;
        if (/^\s+$/.test(part)) {
          return <span className="fold-text-whitespace" key={`space-${index}`}>{part.replace(/ /g, "\u00A0")}</span>;
        }
        return (
          <span className="fold-text-segment" key={`word-${index}`} style={{ "--fold-perspective": `${safePerspective}px` } as CSSProperties}>
            <span className="fold-text-piece" style={{ transformOrigin: hingeConfig.origin } as CSSProperties}>{part}</span>
          </span>
        );
      });
    }

    return Array.from(text).map((char, index) => {
      if (char === "\n") return <br key={`br-${index}`} />;
      return (
        <span className="fold-text-segment" key={`char-${index}`} style={{ "--fold-perspective": `${safePerspective}px` } as CSSProperties}>
          <span className="fold-text-piece" style={{ transformOrigin: hingeConfig.origin } as CSSProperties}>
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      );
    });
  }, [hingeConfig.origin, safePerspective, splitBy, text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pieces = Array.from(root.querySelectorAll<HTMLElement>(".fold-text-piece"));
    if (!pieces.length) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const activeDuration = reduceMotion ? Math.min(duration, 0.22) : duration;
    const activeStagger = reduceMotion ? Math.min(stagger, 0.02) : stagger;

    const show = () => {
      timelineRef.current?.kill();
      gsap.killTweensOf(pieces);
      timelineRef.current = gsap.timeline();
      timelineRef.current.fromTo(
      pieces,
      {
        opacity: 0,
        rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
        rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
        "--fold-crease": reduceMotion ? 0 : safeCrease,
        transformOrigin: hingeConfig.origin,
        force3D: true,
      },
      {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        "--fold-crease": 0,
        duration: activeDuration,
        ease: reduceMotion ? "power1.out" : ease,
        stagger: activeStagger,
        clearProps: "willChange",
      },
      );
    };

    const hide = () => {
      timelineRef.current?.kill();
      gsap.killTweensOf(pieces);
      gsap.to(pieces, {
        opacity: 0,
        rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
        rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
        "--fold-crease": reduceMotion ? 0 : safeCrease,
        duration: reduceMotion ? Math.min(activeDuration, 0.16) : Math.min(activeDuration, 0.32),
        ease: reduceMotion ? "power1.in" : "power2.in",
        stagger: { each: Math.min(activeStagger, 0.03), from: "end" },
      });
    };

    if (!triggerOnView || typeof IntersectionObserver === "undefined") {
      show();
      return () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
        gsap.killTweensOf(pieces);
      };
    }

    gsap.set(pieces, {
      opacity: 0,
      rotateX: reduceMotion ? 0 : hingeConfig.rotateX,
      rotateY: reduceMotion ? 0 : hingeConfig.rotateY,
      "--fold-crease": reduceMotion ? 0 : safeCrease,
      transformOrigin: hingeConfig.origin,
    });

    const scrollRoot = root.closest<HTMLElement>(".profile-drawer-scroll");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) show();
      else hide();
    }, { root: scrollRoot, threshold: 0.65 });
    observer.observe(root);

    return () => {
      observer.disconnect();
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf(pieces);
    };
  }, [duration, ease, hingeConfig.origin, hingeConfig.rotateX, hingeConfig.rotateY, safeCrease, stagger, text, triggerOnView]);

  const rootStyle = {
    "--fold-text-font-size": typeof fontSize === "number" ? `${fontSize}px` : fontSize,
    "--fold-text-font-weight": fontWeight,
    "--fold-text-color": color,
    ...style,
  } as CSSProperties;

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()} style={rootStyle}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">{segments}</span>
    </span>
  );
}
