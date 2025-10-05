import React from 'react';
import { cn } from '../utils/index';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'login' | 'default' | 'primary' | 'red' | 'tag';
  active?: boolean;
};

// Token-driven button variants mapped to utility classes.
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  login:
    'bg-white text-title14 text-black box-border px-[3px] hover:box-border hover:p-[3px] hover:w-[159px] hover:h-[35px] hover:border hover:border-white hover:',
  default: 'px-10 py-5 bg-white text-title14 border',
  primary:
    'bg-primary text-white text-body12 rounded-[8px] hover:border-[1px] hover:border-gray-300 hover:box-border active:bg-gray-300',
  red: 'bg-red-500 w-[105px] h-[22px] text-white text-body12 rounded-[8px] hover:border-[1px] hover:border-red-200 hover:box-border active:bg-red-200',
  tag: 'bg-slate-100 h-[22px] rounded-[8px] py-[4px] px-[8px] hover:bg-gray-50 hover:bg-gray-300 text-body12 text-black hover:shadow-[inset_0_0_0_1px_theme(colors.slate.200)] ',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, active = true, ...props }, ref) => {
    const finalProps = {
      ...props,
    } as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref}
        className={cn('select-none', variantClasses[variant], className)}
        {...finalProps}
      />
    );
  },
);
Button.displayName = 'Button';

export default Button;
