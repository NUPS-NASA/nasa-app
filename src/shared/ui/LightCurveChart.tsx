import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../utils';

export type LightCurvePoint = {
  x: number;
  y: number;
};

export type LightCurveSeries = {
  id: string;
  name: string;
  points: LightCurvePoint[];
  description?: string;
};

export interface LightCurveChartProps {
  /**
   * Title rendered above the selector list. Defaults to "status" to match the product copy.
   */
  title?: string;
  /**
   * Collection of light-curve series that can be visualised.
   */
  series: LightCurveSeries[];
  /**
   * Controlled selected series id. When provided the component becomes controlled and relies on the parent.
   */
  selectedId?: string;
  /**
   * Callback fired whenever a user selects a different series from the list.
   */
  onSelect?: (seriesId: string) => void;
  /**
   * Message displayed when there is no data to show.
   */
  emptyMessage?: string;
  className?: string;
}

const CHART_WIDTH = 620;
const CHART_HEIGHT = 380;
const CHART_PADDING = 48;

const createTicks = (min: number, max: number, steps = 5) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }

  if (min === max) {
    return [min];
  }

  const step = (max - min) / (steps - 1);
  return Array.from({ length: steps }, (_, index) => min + index * step);
};

const sortPoints = (points: LightCurvePoint[]) =>
  [...points].sort((a, b) => a.x - b.x);

const toPrecision = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) {
    return value.toExponential(2);
  }

  return value.toFixed(3);
};

const getRange = (points: LightCurvePoint[]) => {
  if (!points.length) {
    return {
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
    };
  }

  return points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    {
      minX: points[0].x,
      maxX: points[0].x,
      minY: points[0].y,
      maxY: points[0].y,
    },
  );
};

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

const computeStatistics = (points: LightCurvePoint[]) => {
  if (!points.length) {
    return null;
  }

  const values = points.map((point) => point.y);
  const sum = values.reduce((acc, value) => acc + value, 0);
  const mean = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    mean,
    min,
    max,
    count: values.length,
  };
};

const LightCurveChart: React.FC<LightCurveChartProps> = ({
  title = 'status',
  series,
  selectedId,
  onSelect,
  emptyMessage = '표시할 광도곡선이 없습니다.',
  className,
}) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(() =>
    selectedId ?? series[0]?.id ?? null,
  );

  useEffect(() => {
    if (selectedId !== undefined) {
      setInternalSelected(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!series.length) {
      setInternalSelected(null);
      return;
    }

    if (!internalSelected || !series.some((item) => item.id === internalSelected)) {
      setInternalSelected(series[0].id);
    }
  }, [series, internalSelected]);

  const resolvedSelectedId = selectedId ?? internalSelected;
  const selectedSeries = useMemo(
    () => series.find((item) => item.id === resolvedSelectedId) ?? series[0],
    [series, resolvedSelectedId],
  );

  const selectedIndex = useMemo(
    () => series.findIndex((item) => item.id === selectedSeries?.id),
    [series, selectedSeries?.id],
  );

  const sortedPoints = useMemo(() => sortPoints(selectedSeries?.points ?? []), [
    selectedSeries?.points,
  ]);

  const { minX, maxX, minY, maxY } = useMemo(
    () => getRange(sortedPoints),
    [sortedPoints],
  );

  const xTicks = useMemo(() => createTicks(minX, maxX), [minX, maxX]);
  const yTicks = useMemo(() => createTicks(minY, maxY), [minY, maxY]);

  const stats = useMemo(() => computeStatistics(sortedPoints), [sortedPoints]);

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

  const handleSelect = (seriesId: string) => {
    if (selectedId === undefined) {
      setInternalSelected(seriesId);
    }

    onSelect?.(seriesId);
  };

  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur lg:p-8',
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full max-w-[240px] shrink-0">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-violet-600" aria-hidden />
            {title}
          </div>
          <ul className="space-y-2">
            {series.map((item, index) => {
              const isActive = item.id === resolvedSelectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all',
                      isActive
                        ? 'border-violet-400 bg-violet-50/80 text-violet-900 shadow-sm ring-1 ring-violet-400'
                        : 'border-transparent bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/60',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base text-amber-400" aria-hidden>
                        ★
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {(index + 1).toString().padStart(3, '0')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Success
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {stats ? `${stats.count.toLocaleString()} observations` : 'No observations'}
                </span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {selectedIndex >= 0
                  ? `${selectedIndex + 1}. ${selectedSeries?.name ?? 'Light Curve'} (${selectedSeries?.points.length ?? 0})`
                  : selectedSeries?.name ?? 'Light Curve'}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-violet-600">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-violet-600 transition-colors hover:border-violet-400 hover:bg-violet-50"
              >
                Download all
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-violet-100 px-3 py-1.5 text-violet-700 transition-colors hover:border-violet-300 hover:bg-violet-200"
              >
                Download just this file
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
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
                <pattern id="lightcurve-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E2E8F0" strokeWidth="1" opacity="0.7" />
                </pattern>
                <radialGradient id="lightcurve-watermark" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="rgba(148, 163, 184, 0.18)" />
                  <stop offset="70%" stopColor="rgba(148, 163, 184, 0.1)" />
                  <stop offset="100%" stopColor="rgba(148, 163, 184, 0)" />
                </radialGradient>
              </defs>

              <rect
                x={CHART_PADDING}
                y={CHART_PADDING}
                width={CHART_WIDTH - CHART_PADDING * 1.5}
                height={CHART_HEIGHT - CHART_PADDING * 1.5}
                fill="url(#lightcurve-grid)"
                stroke="#CBD5F5"
                strokeWidth={1.5}
                rx={16}
                ry={16}
              />
              <rect
                x={CHART_PADDING}
                y={CHART_PADDING}
                width={CHART_WIDTH - CHART_PADDING * 1.5}
                height={CHART_HEIGHT - CHART_PADDING * 1.5}
                fill="url(#lightcurve-watermark)"
                rx={16}
                ry={16}
              />

              {xTicks.map((tick) => {
                const x = scaleValue(tick, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                return (
                  <line
                    key={`grid-x-${tick}`}
                    x1={x}
                    y1={CHART_PADDING}
                    x2={x}
                    y2={CHART_HEIGHT - CHART_PADDING / 2}
                    stroke="#CBD5F5"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                );
              })}
              {yTicks.map((tick) => {
                const y = scaleValue(tick, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                return (
                  <line
                    key={`grid-y-${tick}`}
                    x1={CHART_PADDING}
                    y1={y}
                    x2={CHART_WIDTH - CHART_PADDING / 2}
                    y2={y}
                    stroke="#CBD5F5"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                );
              })}

              <line
                x1={CHART_PADDING}
                y1={CHART_HEIGHT - CHART_PADDING / 2}
                x2={CHART_WIDTH - CHART_PADDING / 2}
                y2={CHART_HEIGHT - CHART_PADDING / 2}
                stroke="#64748B"
                strokeWidth={1.5}
              />
              <line
                x1={CHART_PADDING}
                y1={CHART_PADDING}
                x2={CHART_PADDING}
                y2={CHART_HEIGHT - CHART_PADDING / 2}
                stroke="#64748B"
                strokeWidth={1.5}
              />

              {xTicks.map((tick) => {
                const x = scaleValue(tick, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                return (
                  <text
                    key={`label-x-${tick}`}
                    x={x}
                    y={CHART_HEIGHT - CHART_PADDING / 2 + 24}
                    textAnchor="middle"
                    className="fill-slate-400 text-xs"
                  >
                    {toPrecision(tick)}
                  </text>
                );
              })}
              {yTicks.map((tick) => {
                const y = scaleValue(tick, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                return (
                  <text
                    key={`label-y-${tick}`}
                    x={CHART_PADDING - 12}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-xs"
                  >
                    {toPrecision(tick)}
                  </text>
                );
              })}

              {sortedPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="url(#lightcurve-gradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.35}
                  points={sortedPoints
                    .map((point) => {
                      const x = scaleValue(point.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                      const y = scaleValue(point.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {sortedPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sortedPoints
                    .map((point) => {
                      const x = scaleValue(point.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                      const y = scaleValue(point.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {sortedPoints.map((point, index) => {
                const x = scaleValue(point.x, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
                const y = scaleValue(point.y, minY, maxY, CHART_HEIGHT, CHART_PADDING, true);

                return (
                  <circle
                    key={`${point.x}-${point.y}-${index}`}
                    cx={x}
                    cy={y}
                    r={3}
                    fill="#0F172A"
                    opacity={0.6}
                  />
                );
              })}
            </svg>
            {selectedSeries?.description && (
              <div className="absolute right-5 top-5 max-w-[220px] rounded-xl border border-violet-100/70 bg-violet-50/70 p-4 text-xs text-slate-600 shadow-sm">
                <div className="mb-1 text-sm font-semibold text-violet-700">{selectedSeries.name}</div>
                <p>{selectedSeries.description}</p>
              </div>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white/90 p-3 text-center shadow-sm">
                <div className="text-xs uppercase tracking-wide text-violet-500">Observations</div>
                <div className="text-lg font-semibold text-slate-900">{stats.count}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/90 p-3 text-center shadow-sm">
                <div className="text-xs uppercase tracking-wide text-violet-500">Min</div>
                <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.min)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/90 p-3 text-center shadow-sm">
                <div className="text-xs uppercase tracking-wide text-violet-500">Mean</div>
                <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.mean)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/90 p-3 text-center shadow-sm">
                <div className="text-xs uppercase tracking-wide text-violet-500">Max</div>
                <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.max)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightCurveChart;
