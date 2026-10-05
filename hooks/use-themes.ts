"use client";

import { useSyncExternalStore } from "react";
import { PRESET_THEMES, themeCss, type Theme } from "@/lib/themes";

export const CUSTOM_THEMES_KEY = "fokus-custom-themes";
export const ACTIVE_THEME_KEY = "fokus-active-theme";
// Compiled CSS of the active theme, read by the boot script in app/layout.tsx.
export const THEME_CSS_KEY = "fokus-theme-css";

type State = { custom: Theme[]; activeId: string };

const SERVER_STATE: State = { custom: [], activeId: PRESET_THEMES[0].id };
const listeners = new Set<() => void>();
let state: State | null = null;

function read(): State {
  try {
    return {
      custom: JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) ?? "[]"),
      activeId: localStorage.getItem(ACTIVE_THEME_KEY) ?? SERVER_STATE.activeId,
    };
  } catch {
    return SERVER_STATE;
  }
}

const getSnapshot = () => (state ??= read());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function findTheme(s: State) {
  return (
    [...PRESET_THEMES, ...s.custom].find((t) => t.id === s.activeId) ??
    PRESET_THEMES[0]
  );
}

/** Writes a theme onto the page without persisting it (used for live preview). */
export function applyTheme(theme: Theme) {
  let el = document.getElementById("fokus-theme");
  if (!el) {
    el = document.createElement("style");
    el.id = "fokus-theme";
    document.head.appendChild(el);
  }
  el.textContent = themeCss(theme);
}

function commit(next: State) {
  state = next;
  const active = findTheme(next);
  const css = themeCss(active);
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(next.custom));
  localStorage.setItem(ACTIVE_THEME_KEY, next.activeId);
  localStorage.setItem(THEME_CSS_KEY, css);
  applyTheme(active);
  listeners.forEach((l) => l());
}

export function useThemes() {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);

  return {
    presets: PRESET_THEMES,
    custom: s.custom,
    active: findTheme(s),
    setActive: (id: string) => commit({ ...getSnapshot(), activeId: id }),
    /** Insert or replace a custom theme, then activate it. */
    saveTheme: (theme: Theme) => {
      const { custom } = getSnapshot();
      const exists = custom.some((t) => t.id === theme.id);
      commit({
        custom: exists
          ? custom.map((t) => (t.id === theme.id ? theme : t))
          : [...custom, theme],
        activeId: theme.id,
      });
    },
    deleteTheme: (id: string) => {
      const prev = getSnapshot();
      commit({
        custom: prev.custom.filter((t) => t.id !== id),
        activeId: prev.activeId === id ? SERVER_STATE.activeId : prev.activeId,
      });
    },
    /** Restore the persisted theme after a preview. */
    resetPreview: () => applyTheme(findTheme(getSnapshot())),
  };
}
