"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Goals = Record<string, number>;
type GoalsContextValue = {
  goals: Goals;
  setGoal: (key: string, value: number) => void;
  getGoal: (key: string) => number | undefined;
};

const STORAGE_KEY = "dashboard.goals";
const GoalsContext = createContext<GoalsContextValue | null>(null);

function safeParse(raw: string | null): Goals {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Goals;
    }
  } catch (error) {
    console.warn("Failed to parse stored goals", error);
  }
  return {};
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goals>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    setGoals(stored);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals, initialized]);

  const setGoal = useCallback((key: string, value: number) => {
    setGoals((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getGoal = useCallback((key: string) => goals[key], [goals]);

  const value = useMemo(
    () => ({ goals, setGoal, getGoal }),
    [goals, setGoal, getGoal]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) {
    throw new Error("useGoals must be used within GoalsProvider");
  }
  return ctx;
}
