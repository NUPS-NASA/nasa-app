import { cn } from '../utils';

type Props = React.ButtonHTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: 'button' | 'card';
};

const Tile: React.FC<Props> = ({ className, children, variant = 'card' }) => {
  const finalClassName = cn(
    'cursor-pointer w-full shadow-[inset_0_0_0_1px_theme(colors.slate.200)] rounded-[10px] flex bg-white p-[12px] ',
    variant === 'button'
      ? 'hover:shadow-[inset_0_0_0_1px_theme(colors.primary.DEFAULT)] active:bg-gray-200'
      : '',
    className,
  );

  return <div className={finalClassName}>{children}</div>;
};

export default Tile;
