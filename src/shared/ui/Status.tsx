import React from 'react';
import { cn } from '../utils';

type StatusState = 'pending' | 'working' | 'success' | 'failed';

export interface StatusItem {
  label: string;
  state: StatusState;
}

export interface StatusProps {
  /**
   * Section title rendered next to the indicator icon.
   */
  title?: string;
  /**
   * Status labels displayed inside the dashed container. Defaults to the four
   * canonical states from the design reference.
   */
  items?: StatusItem[];
  className?: string;
}

const STATE_STYLES: Record<StatusState, string> = {
  pending:
    'border-slate-300 bg-slate-100 text-slate-500 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)]',
  working:
    'border-amber-300 bg-amber-50 text-amber-600 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.45)]',
  success:
    'border-emerald-400 bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]',
  failed:
    'border-rose-400 bg-rose-50 text-rose-600 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.45)]',
};

const DEFAULT_ITEMS: StatusItem[] = [
  { label: 'Pending', state: 'pending' },
  { label: 'Working', state: 'working' },
  { label: 'Success', state: 'success' },
  { label: 'Failed', state: 'failed' },
];

const Status: React.FC<StatusProps> = ({
  title = 'status',
  items = DEFAULT_ITEMS,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative inline-flex w-fit flex-col gap-4 rounded-3xl border-2 border-dashed border-violet-500 bg-slate-100/80 px-10 py-8 text-body14 text-slate-600 shadow-sm',
        className,
      )}
    >
      <div className="absolute -top-3 left-7 flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-600">
        <span className="inline-flex h-2 w-2 rounded-full bg-violet-600" aria-hidden />
        {title}
      </div>
      <ul className="mt-2 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label}>
            <span
              className={cn(
                'inline-flex min-w-[140px] items-center justify-center rounded-full border-2 px-5 py-1.5 text-base font-semibold',
                STATE_STYLES[item.state],
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Status;
