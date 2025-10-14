"use client";

import { useEffect, useMemo, useState } from "react";
import { useGoals } from "@/app/providers/goals";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GoalBadgeProps {
  metricKey: string;
  current: number;
  unit?: string;
}

export default function GoalBadge({ metricKey, current, unit }: GoalBadgeProps) {
  const { getGoal, setGoal } = useGoals();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const goal = getGoal(metricKey);

  useEffect(() => {
    if (editing) {
      setDraft(goal?.toString() ?? "");
    }
  }, [editing, goal]);

  const pct = useMemo(() => {
    if (!goal || goal <= 0) return 0;
    return (current / goal) * 100;
  }, [current, goal]);

  const color = useMemo(() => {
    if (pct >= 100) return "text-emerald-500";
    if (pct >= 70) return "text-amber-500";
    return "text-destructive";
  }, [pct]);

  const handleSave = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGoal(metricKey, 0);
    } else {
      setGoal(metricKey, parsed);
    }
    setEditing(false);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">
          Goal: {goal && goal > 0 ? `${goal.toLocaleString()}${unit ?? ""}` : "not set"}
        </span>
        <div className="flex items-center gap-2">
          {goal && goal > 0 ? <span className={color}>{Math.round(pct)}%</span> : null}
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            variant="outline"
            onClick={() => (editing ? handleSave() : setEditing(true))}
          >
            {editing ? "Save" : goal && goal > 0 ? "Edit goal" : "Set goal"}
          </Button>
        </div>
      </div>

      {editing && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="any"
            placeholder="Target"
            className="h-8 w-36 rounded-md border bg-background px-2 text-sm"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
            }}
            autoFocus
          />
          {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
        </div>
      )}

      {goal && goal > 0 ? <Progress value={pct} /> : null}
    </div>
  );
}
