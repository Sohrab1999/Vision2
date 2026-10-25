"use client";

import { useEffect, useRef } from "react";

/**
 * Keyboard toolkit (audit §10 R-6) — one listener contract + layout-proof
 * digit parsing for every practice surface. قبل از این ماژول، هر مؤلفه
 * شنوندهٔ keydown خودش را داشت با گاردهای متفاوت: دیوئل فقط ارقام لاتین
 * می‌گرفت، موتور تست ارقام فارسی و کد فیزیکی را هم می‌فهمید، رش چیز دیگری.
 * اکنون: یک گارد ورودی متنی، یک خوانندهٔ رقم همه‌کیشه، یک سیم‌کش شنونده.
 */

/**
 * True when the keystroke belongs to a text field and must NOT be captured
 * by global shortcuts (typing «۲» in the search box must stay typing).
 */
export function isTypingTarget(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  // e.target can be a non-Element (document/window) without getAttribute
  return el.isContentEditable || el.getAttribute?.("role") === "textbox";
}

/**
 * The number the user meant, on any keyboard layout:
 * physical Digit/Numpad codes (layout-proof), Persian digits ۰–۹ and
 * Latin digits. Returns null when the key is not a digit.
 */
export function readDigit(e: KeyboardEvent): number | null {
  const codeNum = /^(?:Digit|Numpad)([0-9])$/.exec(e.code)?.[1];
  if (codeNum) return Number(codeNum);
  if (/^[0-9]$/.test(e.key)) return Number(e.key);
  if (/^[۰-۹]$/.test(e.key)) return "۰۱۲۳۴۵۶۷۸۹".indexOf(e.key);
  return null;
}

/**
 * Unified global keydown listener: attaches while `enabled`, always removed
 * on unmount or when `enabled` flips. `onKey` is captured fresh every render
 * (ref) so callers can pass inline closures without resetting the listener.
 */
export function useKeydown(onKey: (e: KeyboardEvent) => void, enabled = true): void {
  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  }, [onKey]);
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => onKeyRef.current(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}

/**
 * Convenience wrapper: run `onClose` on Escape — the shared modal dismiss
 * contract (official-report, shortcut-guide, …).
 */
export function useEscape(onClose: () => void, enabled = true): void {
  useKeydown(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    enabled,
  );
}
