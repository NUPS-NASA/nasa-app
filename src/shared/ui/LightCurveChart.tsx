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
        'flex flex-col gap-6 rounded-2xl border border-dashed border-violet-500 bg-slate-100/60 p-6 lg:flex-row',
        className,
      )}
    >
      <div className="w-full max-w-[220px] shrink-0">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-violet-600">
          <span className="h-2 w-2 rounded-full bg-violet-600" aria-hidden />
          {title}
        </div>
        <ul className="space-y-2">
          {series.map((item) => {
            const isActive = item.id === resolvedSelectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'border-violet-500 bg-violet-100 text-violet-900 shadow-sm'
                      : 'border-transparent bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50',
                  )}
                >
                  <div>{item.name}</div>
                  <div className="text-xs font-normal text-slate-400">
                    {item.points.length.toLocaleString()} points
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
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

            {/* Grid */}
            {xTicks.map((tick) => {
              const x = scaleValue(tick, minX, maxX, CHART_WIDTH, CHART_PADDING, false);
              return (
                <line
                  key={`grid-x-${tick}`}
                  x1={x}
                  y1={CHART_PADDING}
                  x2={x}
                  y2={CHART_HEIGHT - CHART_PADDING / 2}
                  stroke="#E2E8F0"
                  strokeWidth={1}
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

            {/* Series */}
            {sortedPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#lightcurve-gradient)"
                strokeWidth={6}
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

            {sortedPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#7C3AED"
                strokeWidth={2.5}
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
                  r={4}
                  fill="#1E293B"
                  opacity={0.45}
                />
              );
            })}
          </svg>
          {selectedSeries?.description && (
            <div className="absolute right-5 top-5 max-w-[220px] rounded-lg border border-violet-100 bg-violet-50/80 p-4 text-xs text-slate-600">
              <div className="mb-1 text-sm font-semibold text-violet-700">{selectedSeries.name}</div>
              <p>{selectedSeries.description}</p>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
            <div className="rounded-lg border border-violet-100 bg-white p-3 text-center">
              <div className="text-xs uppercase tracking-wide text-violet-500">Observations</div>
              <div className="text-lg font-semibold text-slate-900">{stats.count}</div>
            </div>
            <div className="rounded-lg border border-violet-100 bg-white p-3 text-center">
              <div className="text-xs uppercase tracking-wide text-violet-500">Min</div>
              <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.min)}</div>
            </div>
            <div className="rounded-lg border border-violet-100 bg-white p-3 text-center">
              <div className="text-xs uppercase tracking-wide text-violet-500">Mean</div>
              <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.mean)}</div>
            </div>
            <div className="rounded-lg border border-violet-100 bg-white p-3 text-center">
              <div className="text-xs uppercase tracking-wide text-violet-500">Max</div>
              <div className="text-lg font-semibold text-slate-900">{toPrecision(stats.max)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightCurveChart;
