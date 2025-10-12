export type Metric = "engagement_rate" | "impressions" | "people";
export type Breakdown = "gender" | "age" | "geo";
export type Platform = "instagram" | "tiktok" | "facebook" | "x";

export type BreakdownRow = {
  key: string;            // e.g. "female", "18-24", "US"
  label: string;          // human readable
  value: number;          // total in range
  pct?: number;           // 0..1 (optional; engagement_rate may be pct)
};

export type BreakdownResponse = {
  metric: Metric;
  by: Breakdown;
  platform?: Platform | "all";
  rows: BreakdownRow[];
  total: number;
};

// MOCK data generator; replace with real connectors later
const GENDERS: BreakdownRow[] = [
  { key: "female", label: "Female", value: 0 },
  { key: "male",   label: "Male",   value: 0 },
  { key: "other",  label: "Other",  value: 0 },
];
const AGES = ["13-17","18-24","25-34","35-44","45-54","55-64","65+"];
const COUNTRIES = ["US","MA","FR","ES","DE","GB","IT","CA","AE","SA"];

function seedRand(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 13), 16777619)) >>> 0) / 2 ** 32;
}

export async function getBreakdown(params: {
  start: string; end: string;
  metric: Metric; by: Breakdown;
  platform?: Platform | "all";
}): Promise<BreakdownResponse> {
  const { start, end, metric, by, platform = "all" } = params;
  const rand = seedRand(`${start}|${end}|${metric}|${by}|${platform}`);

  let rows: BreakdownRow[] = [];
  if (by === "gender") {
    rows = GENDERS.map(r => ({ ...r, value: Math.round(1000 + rand() * 9000) }));
  } else if (by === "age") {
    rows = AGES.map(a => ({ key: a, label: a, value: Math.round(800 + rand() * 7000) }));
  } else {
    rows = COUNTRIES.map(c => ({ key: c, label: c, value: Math.round(400 + rand() * 6000) }));
    rows.sort((a,b)=>b.value - a.value);
  }

  // If engagement_rate, convert to average rate per segment (0–100)
  if (metric === "engagement_rate") {
    rows = rows.map(r => ({ ...r, value: Number((1 + rand() * 9).toFixed(2)) })); // 1%–10%
  }

  const total = metric === "engagement_rate"
    ? rows.reduce((a,b)=>a + b.value, 0)             // sum for reference
    : rows.reduce((a,b)=>a + b.value, 0);

  // compute pct share for non-rate metrics
  if (metric !== "engagement_rate" && total > 0) {
    rows = rows.map(r => ({ ...r, pct: r.value / total }));
  }

  return { metric, by, platform, rows, total };
}
