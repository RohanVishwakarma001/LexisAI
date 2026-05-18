import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="space-y-xs w-full">
      {label && (
        <label className="font-label-md text-label-md text-on-surface-variant block ml-xs">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant/50 flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-md px-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            leftIcon && "pl-[48px]",
            rightIcon && "pr-[48px]",
            error && "border-error focus:ring-error/40 focus:border-error",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant/50 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="font-label-sm text-[12px] text-error ml-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
