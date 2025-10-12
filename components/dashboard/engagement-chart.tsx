'use client';

import { useMemo, useState } from 'react';

interface EngagementChartProps {
  data: Array<{ date: string; impressions: number; likes: number; comments: number }>;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;
const PADDING_X = 56;
const PADDING_Y = 40;
const colors = {
  impressions: '#6366F1',
  likes: '#F97316',
  comments: '#22C55E',
} as const;

type SeriesKey = keyof Omit<EngagementChartProps['data'][number], 'date'>;

export function EngagementChart({ data }: EngagementChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(
      ...data.flatMap((item) => [item.impressions, item.likes, item.comments])
    );
  }, [data]);

  const points = useMemo(() => {
    if (!data.length) return { impressions: [], likes: [], comments: [] } as Record<SeriesKey, Array<{ x: number; y: number }>>;
    const xStep = (CHART_WIDTH - PADDING_X * 2) / Math.max(1, data.length - 1);
    return (['impressions', 'likes', 'comments'] as SeriesKey[]).reduce((acc, key) => {
      acc[key] = data.map((item, index) => ({
        x: PADDING_X + xStep * index,
        y: CHART_HEIGHT - PADDING_Y - ((item[key] || 0) / Math.max(1, maxValue)) * (CHART_HEIGHT - PADDING_Y * 2),
      }));
      return acc;
    }, {} as Record<SeriesKey, Array<{ x: number; y: number }>>);
  }, [data, maxValue]);

  const buildAreaPath = (series: SeriesKey) => {
    const seriesPoints = points[series];
    if (!seriesPoints.length) return '';
    const first = seriesPoints[0];
    const last = seriesPoints[seriesPoints.length - 1];
    const baseline = CHART_HEIGHT - PADDING_Y;
    const linePoints = seriesPoints.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    return `M ${first.x.toFixed(2)} ${baseline.toFixed(2)} ${linePoints} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
  };

  const buildLinePath = (series: SeriesKey) => {
    const seriesPoints = points[series];
    if (!seriesPoints.length) return '';
    const first = seriesPoints[0];
    const path = seriesPoints.slice(1).map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${path}`;
  };

  return (
    <div className="relative h-[320px] w-full">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-full w-full">
        <defs>
          <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${colors.impressions}B3`} />
            <stop offset="100%" stopColor={`${colors.impressions}0F`} />
          </linearGradient>
          <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${colors.likes}B3`} />
            <stop offset="100%" stopColor={`${colors.likes}0F`} />
          </linearGradient>
          <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${colors.comments}B3`} />
            <stop offset="100%" stopColor={`${colors.comments}0F`} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const y = PADDING_Y + ((CHART_HEIGHT - PADDING_Y * 2) / 3) * idx;
          return <line key={`grid-${idx}`} x1={PADDING_X} x2={CHART_WIDTH - PADDING_X} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />;
        })}

        {/* Axes */}
        <line x1={PADDING_X} x2={CHART_WIDTH - PADDING_X} y1={CHART_HEIGHT - PADDING_Y} y2={CHART_HEIGHT - PADDING_Y} stroke="#CBD5F5" strokeWidth={1.2} />
        <line x1={PADDING_X} x2={PADDING_X} y1={PADDING_Y} y2={CHART_HEIGHT - PADDING_Y} stroke="#CBD5F5" strokeWidth={1.2} />

        {/* Areas */}
        <path d={buildAreaPath('impressions')} fill="url(#impressionsGradient)" />
        <path d={buildAreaPath('likes')} fill="url(#likesGradient)" />
        <path d={buildAreaPath('comments')} fill="url(#commentsGradient)" />

        {/* Lines */}
        <path d={buildLinePath('impressions')} stroke={colors.impressions} strokeWidth={2} fill="transparent" />
        <path d={buildLinePath('likes')} stroke={colors.likes} strokeWidth={2} fill="transparent" />
        <path d={buildLinePath('comments')} stroke={colors.comments} strokeWidth={2} fill="transparent" />

        {/* Points */}
        {(['impressions', 'likes', 'comments'] as SeriesKey[]).map((series) =>
          points[series].map((point, index) => (
            <circle
              key={`${series}-${index}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors[series]}
              opacity={activeIndex === index || activeIndex === null ? 1 : 0.3}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ))
        )}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const xStep = (CHART_WIDTH - PADDING_X * 2) / Math.max(1, data.length - 1);
          const x = PADDING_X + xStep * index;
          return (
            <text key={`label-${item.date}`} x={x} y={CHART_HEIGHT - PADDING_Y + 24} textAnchor="middle" fontSize={12} fill="#64748B">
              {item.date}
            </text>
          );
        })}

        {/* Y-axis labels */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const value = Math.round((maxValue / 3) * idx);
          const y = CHART_HEIGHT - PADDING_Y - ((CHART_HEIGHT - PADDING_Y * 2) / 3) * idx;
          return (
            <text key={`y-label-${idx}`} x={PADDING_X - 12} y={y + 4} textAnchor="end" fontSize={12} fill="#94A3B8">
              {value.toLocaleString()}
            </text>
          );
        })}
      </svg>

      {activeIndex !== null && data[activeIndex] && (
        <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-start justify-end p-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-subtle">
            <p className="text-sm font-semibold text-slate-800">{data[activeIndex].date}</p>
            <p className="mt-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand" /> Impressions: <span className="font-semibold text-slate-800">{data[activeIndex].impressions.toLocaleString()}</span></p>
            <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> Likes: <span className="font-semibold text-slate-800">{data[activeIndex].likes.toLocaleString()}</span></p>
            <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /> Comments: <span className="font-semibold text-slate-800">{data[activeIndex].comments.toLocaleString()}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
