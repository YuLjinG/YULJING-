"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./text-type.css";

type TextTypeProps = {
  text: string | string[];
  as?: "span" | "div" | "p";
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  variableSpeed?: { min: number; max: number };
};

export default function TextType({
  text,
  as: Component = "span",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  variableSpeed,
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const textArray = useMemo(() => Array.isArray(text) ? text : [text], [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    return Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min;
  }, [typingSpeed, variableSpeed]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;
    gsap.set(cursorRef.current, { opacity: 1 });
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => tween.kill();
  }, [cursorBlinkDuration, showCursor]);

  useEffect(() => {
    let timeout: ReturnType<typeof window.setTimeout> | undefined;
    const currentText = textArray[currentTextIndex] ?? "";

    if (isDeleting) {
      if (!displayedText) {
        setIsDeleting(false);
        if (!loop && currentTextIndex === textArray.length - 1) return;
        setCurrentTextIndex((index) => (index + 1) % textArray.length);
        setCurrentCharIndex(0);
      } else {
        timeout = window.setTimeout(() => setDisplayedText((value) => value.slice(0, -1)), deletingSpeed);
      }
    } else if (currentCharIndex < currentText.length) {
      timeout = window.setTimeout(() => {
        setDisplayedText((value) => value + currentText[currentCharIndex]);
        setCurrentCharIndex((index) => index + 1);
      }, currentCharIndex === 0 && !displayedText ? initialDelay : (variableSpeed ? getRandomSpeed() : typingSpeed));
    } else if (loop) {
      timeout = window.setTimeout(() => setIsDeleting(true), pauseDuration);
    }

    return () => { if (timeout) window.clearTimeout(timeout); };
  }, [currentCharIndex, currentTextIndex, deletingSpeed, displayedText, getRandomSpeed, initialDelay, isDeleting, loop, pauseDuration, textArray, typingSpeed, variableSpeed]);

  const shouldHideCursor = hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex] ?? "").length || isDeleting);

  return (
    <Component className={`text-type ${className}`.trim()}>
      <span className="text-type__content">{displayedText}</span>
      {showCursor && <span ref={cursorRef} className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? "text-type__cursor--hidden" : ""}`.trim()}>{cursorCharacter}</span>}
    </Component>
  );
}
