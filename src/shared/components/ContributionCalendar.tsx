import React, { useMemo } from 'react';
import { cn } from '../utils';

type CalendarItem = {
  date: string;
  [key: string]: any;
};

type Cell = {
  ymd: string | null;
  iso?: string;
  count: number;
};

type MonthSeg = { label: string; weeks: number };

type Props = {
  items?: CalendarItem[];
  selectedYear?: number;
  onBoxClick?: (ymd: string) => void;
};

export function getTimeMinAndSecFromSec(sec: number): [number, number] {
  return [Math.floor(sec / 60), Math.floor(sec % 60)];
}

export const pad = (numberOrString: number | string, length = 2): string =>
  String(numberOrString).padStart(length, '0');

export const parseDateToYmd = (dateObj: Date, isHm = false): string => {
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  const hour = pad(dateObj.getHours());
  const minute = pad(Math.floor(dateObj.getMinutes() / 10) * 10);
  return isHm ? `${year}-${month}-${day} ${hour}:${minute}` : `${year}-${month}-${day}`;
};

export const parseItems = (items: CalendarItem[], isHm = false): Record<string, CalendarItem[]> => {
  const grouped: Record<string, CalendarItem[]> = {};
  items.forEach(item => {
    const dateObj = new Date(item.date);
    const key = parseDateToYmd(dateObj, isHm);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  return grouped;
};

const BOX_SIZE = 6;
const GAP_X = 2.36;
const CELL_GAP_Y = 2;
const WEEK_COL_WIDTH = BOX_SIZE + GAP_X;

function boxStyleByCount(count: number): string {
  if (count === 0)
    return 'bg-sky-50 shadow-[inset_0_0_0_0.5px_theme(colors.slate.300)] rounded-[1px]';
  if (count === 1) return 'bg-sky-200 rounded-[1px]';
  if (count === 2) return 'bg-sky-500 rounded-[1px]';
  if (count >= 3 && count <= 5) return 'bg-sky-800';
  if (count >= 6 && count <= 10) return 'bg-sky-950';
  return 'bg-transparent';
}

function useCalendarRange(selectedYear?: number) {
  return useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const year = selectedYear ? Number(selectedYear) : currentYear;
    let start: Date;
    let end: Date;

    if (year === currentYear) {
      end = today;
      const currentMonth = today.getMonth() + 1;
      if (currentMonth < 12) {
        start = new Date(`${currentYear - 1}-${pad(currentMonth + 1)}-01T00:00:00`);
      } else {
        start = new Date(`${year}-01-01T00:00:00`);
      }
    } else {
      start = new Date(`${year}-01-01T00:00:00`);
      end = new Date(`${year}-12-31T23:59:59`);
    }

    return { start, end, year };
  }, [selectedYear]);
}

function buildWeeks(start: Date, end: Date, parsedData: Record<string, CalendarItem[]>): Cell[][] {
  const weeks: Cell[][] = [];
  const firstDayOfWeek = start.getDay();

  let cur = new Date(start);
  let currentWeek: Cell[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ ymd: null, iso: undefined, count: -1 });
  }

  while (cur <= end) {
    const ymd = parseDateToYmd(cur, false);
    const items = parsedData[ymd];
    const count = items?.length || 0;

    currentWeek.push({ ymd, iso: cur.toISOString(), count });

    const next = new Date(cur);
    next.setDate(cur.getDate() + 1);
    cur = next;

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length) weeks.push(currentWeek);
  return weeks;
}

function buildMonthSegments(weeks: Cell[][]): MonthSeg[] {
  const segments: MonthSeg[] = [];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const weekFirstDate = (week: Cell[]) => {
    for (const cell of week) {
      if (cell.iso) return new Date(cell.iso);
    }
    return null;
  };

  let prevMonthIdx: number | null = null;
  let runWeeks = 0;

  weeks.forEach((week, idx) => {
    const d = weekFirstDate(week);
    const monthIdx = d ? d.getMonth() : prevMonthIdx ?? 0;

    if (idx === 0) {
      prevMonthIdx = monthIdx;
      runWeeks = 1;
    } else {
      if (monthIdx !== prevMonthIdx) {
        segments.push({ label: monthNames[prevMonthIdx!], weeks: runWeeks });
        prevMonthIdx = monthIdx;
        runWeeks = 1;
      } else {
        runWeeks += 1;
      }
    }
  });

  if (prevMonthIdx != null) {
    segments.push({ label: monthNames[prevMonthIdx], weeks: runWeeks });
  }

  return segments;
}

export default function ContributionCalendar({ items = [], selectedYear, onBoxClick }: Props) {
  const { start, end } = useCalendarRange(selectedYear);

  const filtered = useMemo(() => {
    return items.filter(it => {
      const d = new Date(it.date);
      return d >= start && d <= end;
    });
  }, [items, start, end]);

  const parsedData = useMemo(() => parseItems(filtered, false), [filtered]);
  const weeks = useMemo(() => buildWeeks(start, end, parsedData), [start, end, parsedData]);
  const monthSegments = useMemo(() => buildMonthSegments(weeks), [weeks]);

  return (
    <div id="calendar">
      <div className="w-full flex">
        <div className="mr-[10px] mt-[14px]">
          {['Mon', 'Wed', 'Fri'].map(label => (
            <div key={label} className="mt-[5px] h-[12px] text-body10">
              {label}
            </div>
          ))}
        </div>

        <div className="w-full overflow-x-auto">
          <div className="flex text-body10 flex-shrink-0" aria-hidden>
            {monthSegments.map((seg, i) => (
              <div
                key={`${seg.label}-${i}`}
                className="flex-none text-center"
                style={{ minWidth: `${WEEK_COL_WIDTH * 4}px` }}
              >
                {seg.label}
              </div>
            ))}
          </div>

          <div className="flex">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col mr-[2px]">
                {week.map((cell, cIdx) => {
                  const { count, ymd } = cell;
                  const clickable = count > 0 && !!ymd;

                  const title =
                    count > 0 && ymd
                      ? `${ymd} has a total of ${count} items.`
                      : count === 0 && ymd
                      ? `There is no activity on ${ymd}.`
                      : '';

                  const commonProps = {
                    title,
                    className: cn(
                      clickable ? 'cursor-pointer' : 'cursor-default',
                      boxStyleByCount(count),
                    ),
                    style: {
                      width: `${BOX_SIZE}px`,
                      height: `${BOX_SIZE}px`,
                      marginBottom: `${CELL_GAP_Y}px`,
                      marginRight: `${0.6}px`,
                    },
                  } as const;

                  if (clickable && ymd) {
                    return (
                      <div
                        key={`${wIdx}-${cIdx}`}
                        {...commonProps}
                        role="button"
                        tabIndex={0}
                        onClick={() => onBoxClick?.(ymd)}
                        onKeyDown={e => {
                          if ((e.key === 'Enter' || e.key === ' ') && onBoxClick) onBoxClick(ymd);
                        }}
                      />
                    );
                  }

                  return <div key={`${wIdx}-${cIdx}`} {...commonProps} />;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex text-body10 h-[12px] flex-shrink-0 w-full justify-end">
        <div className="text-body10 mr-[7px]">Less</div>
        <div className="flex gap-[5px] h-full items-center justify-center">
          {[1, 2, 3, 6].map(num => (
            <div className={cn(boxStyleByCount(num), 'w-[6px] h-[6px]')} key={num}></div>
          ))}
        </div>
        <div className="text-body10 ml-[7px]">Less</div>
      </div>
    </div>
  );
}
