// گام ۸ §12 — اسلایس هویت: شناسهٔ محلی + راز سروری + پروفایل + کد همگام‌سازی.

import type { StateCreator } from "zustand";
import type { StudyStore } from "../types";

export interface IdentitySlice {
  userId: string;
  userSecret: string; // Phase-0 «اعتماد» — server-issued write secret (empty until registered)
  userName: string;
  avatarColor: string;
  syncCode: string; // F3 learner code — empty when cloud sync is off

  setProfile: (name: string, color: string) => void;
  setSyncCode: (code: string) => void;
  ensureUserId: () => string;
  setIdentity: (userId: string, secret: string) => void;
}

export const createIdentitySlice: StateCreator<StudyStore, [], [], IdentitySlice> = (set, get) => ({
  userId: "",
  userSecret: "",
  userName: "",
  avatarColor: "emerald",
  syncCode: "",

  setProfile: (name, color) => set({ userName: name, avatarColor: color }),
  setSyncCode: (code) => set({ syncCode: code }),
  ensureUserId: () => {
    const existing = get().userId;
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set({ userId: id });
    return id;
  },
  setIdentity: (userId, secret) => set({ userId, userSecret: secret }),
});
