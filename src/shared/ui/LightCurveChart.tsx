import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../utils';

export type LightCurvePoint = { x: number; y: number };
export type LightCurveSeries = {
  id: string;
  name: string;
  points: LightCurvePoint[];
  description?: string;
};

export interface LightCurveChartProps {
  /** Only what's visible in the screenshot. */
  series: LightCurveSeries[];
  selectedId?: string;
  onSelect?: (seriesId: string) => void;
  className?: string;
  emptyMessage?: string;

  /** Top header (pill + heading) */
  statusLabel?: string; // e.g. "Success"
  heading?: string; // e.g. "5. Planet Candidate Candidate (3)"

  /** Vertical highlighted band (transit window) */
  highlightRange?: [number, number] | null;

  /** Right-side black info panel */
  info?: { header?: string; lines: string[] };

  /** Chart actions (top-right) */
  actions?: { downloadAll?: () => void; downloadCurrent?: () => void };

  /** Small caption at top-left above the plot (e.g., "Star 001 @ (x=1576.8, y=856.1)") */
  chartNote?: string;
}

const CHART_WIDTH = 620;
const CHART_HEIGHT = 380;
const CHART_PADDING = 48;

// Create evenly spaced ticks across a range
const createTicks = (min: number, max: number, steps = 5) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];
  const step = (max - min) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => min + i * step);
};

// Sort points by x (required for polyline)
const sortPoints = (pts: LightCurvePoint[]) => [...pts].sort((a, b) => a.x - b.x);

// Human-friendly label formatting
const toPrecision = (v: number) => {
  if (!Number.isFinite(v)) return '0';
  if (Math.abs(v) >= 1000 || Math.abs(v) < 0.01) return v.toExponential(2);
  return v.toFixed(3);
};

// Compute min/max bounds from data
const getRange = (pts: LightCurvePoint[]) => {
  if (!pts.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  return pts.reduce(
    (acc, p) => ({
      minX: Math.min(acc.minX, p.x),
      maxX: Math.max(acc.maxX, p.x),
      minY: Math.min(acc.minY, p.y),
      maxY: Math.max(acc.maxY, p.y),
    }),
    { minX: pts[0].x, maxX: pts[0].x, minY: pts[0].y, maxY: pts[0].y },
  );
};

// Map data value -> pixel
const scaleValue = (
  value: number,
  min: number,
  max: number,
  size: number,
  padding: number,
  invert = false,
) => {
  const safeMin = min === max ? min - 1 : min;
  const safeMax = min === max ? max + 1 : max;
  const relative = (value - safeMin) / (safeMax - safeMin);
  const scaled = padding + relative * (size - padding * 2);
  return invert ? size - scaled : scaled;
};

const LightCurveChart: React.FC<LightCurveChartProps> = ({
  series,
  selectedId,
  onSelect,
  className,
  emptyMessage = '표시할 광도곡선이 없습니다.',
  statusLabel = 'Success',
  heading = '5. Planet Candidate Candidate (3)',
  highlightRange = null,
  info,
  actions,
  chartNote,
}) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(
    () => selectedId ?? series[0]?.id ?? null,
  );

  // Keep internal selection in sync with controlled prop
  useEffect(() => {
    if (selectedId !== undefined) setInternalSelected(selectedId);
  }, [selectedId]);

  // Reset selection when series changes
  useEffect(() => {
    if (!series.length) {
      setInternalSelected(null);
      return;
    }
    if (!internalSelected || !series.some(s => s.id === internalSelected))
      setInternalSelected(series[0].id);
  }, [series, internalSelected]);

  const resolvedSelectedId = selectedId ?? internalSelected;
  const selectedSeries = useMemo(
    () => series.find(s => s.id === resolvedSelectedId) ?? series[0],
    [series, resolvedSelectedId],
  );

  const sortedPoints = useMemo(
    () => sortPoints(selectedSeries?.points ?? []),
    [selectedSeries?.points],
  );
  const { minX, maxX, minY, maxY } = useMemo(() => getRange(sortedPoints), [sortedPoints]);
  const xTicks = useMemo(() => createTicks(minX, maxX), [minX, maxX]);
  const yTicks = useMemo(() => createTicks(minY, maxY), [minY, maxY]);

  if (!series.length) {
    return (
      <div
        className={cn(
          'flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-violet-400 bg-slate-50 text-center text-body14 text-slate-500',
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const handleSelect = (id: string) => {
    if (selectedId === undefined) setInternalSelected(id);
    onSelect?.(id);
  };

  // Highlight band positions
  const bandX1 = highlightRange
    ? scaleValue(highlightRange[0], minX, maxX, CHART_WIDTH, CHART_PADDING, false)
    : null;
  const bandX2 = highlightRange
    ? scaleValue(highlightRange[1], minX, maxX, CHART_WIDTH, CHART_PADDING, false)
    : null;
  const bandWidth = bandX1 !== null && bandX2 !== null ? Math.max(0, bandX2 - bandX1) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header (status pill + heading) */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {statusLabel}
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
      </div>

      {/* Main layout: Left list / Chart / Info panel */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-300 bg-white p-3 md:grid-cols-[220px_1fr_260px]">
        {/* Left sidebar (LIST ONLY — no subheader, per screenshot) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:h-full">
          <ul className="space-y-1">
            {series.map(item => {
              const active = item.id === resolvedSelectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
                      active
                        ? 'bg-violet-100 text-violet-900 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <span
                      className={cn('text-base', active ? 'text-violet-700' : 'text-slate-500')}
                    >
                      ★
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Center chart */}
        <div className="relative rounded-lg border border-slate-200 bg-white p-3">
          {/* Top-right actions */}
          <div className="absolute right-3 top-2 hidden gap-3 text-xs text-slate-500 md:flex">
            <button
              type="button"
              className={cn(
                'underline underline-offset-2 hover:text-slate-700',
                !actions?.downloadAll && 'cursor-default opacity-50',
              )}
              onClick={actions?.downloadAll}
            >
              Download all
            </button>
            <button
              type="button"
              className={cn(
                'underline underline-offset-2 hover:text-slate-700',
                !actions?.downloadCurrent && 'cursor-default opacity-50',
              )}
              onClick={actions?.downloadCurrent}
            >
              Download just this file
            </button>
          </div>

          {/* Small note at top-left (like the screenshot) */}
          {chartNote && (
            <div className="absolute left-3 top-2 z-10 text-xs text-slate-500">{chartNote}</div>
          )}

          <svg
            role="img"
            aria-label={`${selectedSeries?.name ?? 'series'} light curve`}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[320px] w-full"
          >
            <defs>
              <linearGradient id="lightcurve-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(124, 58, 237, 0.35)" />
                <stop offset="100%" stopColor="rgba(124, 58, 237, 0.05)" />
              </linearGradient>
            </defs>

            {/* Highlight band */}
            {bandWidth !== null && bandWidth > 0 && (
              <rect
                x={bandX1!}
                y={CHART_PADDING}
                width={bandWidth}
                height={CHART_HEIGHT - CHART_PADDING * 1.5}
                fill="#CBD5E1"
                opacity={0.45}
                rx={4}
              />
            )}

            {/* Gridlines */}
            {xTicks.map(t => {
              const x = scaleValue(t, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
              return (
                <line
                  key={`gx-${t}`}
                  x1={x}
                  y1={CHART_PADDING}
                  x2={x}
                  y2={CHART_HEIGHT - CHART_PADDING / 2}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
              );
            })}
            {yTicks.map(t => {
              const y = scaleValue(t, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
              return (
                <line
                  key={`gy-${t}`}
                  x1={CHART_PADDING}
                  y1={y}
                  x2={CHART_WIDTH - CHART_PADDING / 2}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
              );
            })}

            {/* Axes */}
            <line
              x1={CHART_PADDING}
              y1={CHART_HEIGHT - CHART_PADDING / 2}
              x2={CHART_WIDTH - CHART_PADDING / 2}
              y2={CHART_HEIGHT - CHART_PADDING / 2}
              stroke="#94A3B8"
              strokeWidth={1.5}
            />
            <line
              x1={CHART_PADDING}
              y1={CHART_PADDING}
              x2={CHART_PADDING}
              y2={CHART_HEIGHT - CHART_PADDING / 2}
              stroke="#94A3B8"
              strokeWidth={1.5}
            />

            {/* Axis labels */}
            {xTicks.map(t => {
              const x = scaleValue(t, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
              return (
                <text
                  key={`lx-${t}`}
                  x={x}
                  y={CHART_HEIGHT - CHART_PADDING / 2 + 24}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  {toPrecision(t)}
                </text>
              );
            })}
            {yTicks.map(t => {
              const y = scaleValue(t, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
              return (
                <text
                  key={`ly-${t}`}
                  x={CHART_PADDING - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px]"
                >
                  {toPrecision(t)}
                </text>
              );
            })}

            {/* Series ribbons + line + scatter */}
            {sortedPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#lightcurve-gradient)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sortedPoints
                  .map(p => {
                    const x = scaleValue(p.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                    const y = scaleValue(p.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
            {sortedPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sortedPoints
                  .map(p => {
                    const x = scaleValue(p.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                    const y = scaleValue(p.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
            {sortedPoints.map((p, i) => {
              const x = scaleValue(p.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
              const y = scaleValue(p.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
              return (
                <circle
                  key={`${p.x}-${p.y}-${i}`}
                  cx={x}
                  cy={y}
                  r={3.5}
                  fill="#0F172A"
                  opacity={0.45}
                />
              );
            })}
          </svg>
        </div>

        {/* Right info panel */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-[12px] text-emerald-300">
          <div className="mb-3 font-mono font-semibold text-emerald-300">
            {info?.header ?? (selectedSeries ? `star_num: ${selectedSeries.name}` : 'Info')}
          </div>
          <div className="space-y-2 font-mono leading-5">
            {(info?.lines ?? []).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightCurveChart;
