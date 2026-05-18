import React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: "bg-surface-container-highest text-on-surface-variant border-outline-variant/30",
    primary: "bg-primary-container/20 text-primary border-primary/20",
    secondary: "bg-secondary-container/20 text-secondary border-secondary/20",
    success: "bg-tertiary-container/20 text-tertiary border-tertiary/20",
    error: "bg-error-container/20 text-error border-error/20",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge };
