import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90 shadow-md focus:ring-primary",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 focus:ring-secondary",
    outline: "border border-outline-variant text-on-surface hover:bg-surface-container-highest focus:ring-primary",
    ghost: "text-on-surface hover:bg-surface-container-highest focus:ring-primary",
    danger: "bg-error text-on-error hover:opacity-90 shadow-md focus:ring-error",
  };
  
  const sizes = {
    sm: "px-sm py-xs text-[12px]",
    md: "px-lg py-md",
    lg: "px-xl py-lg text-[16px]",
    icon: "p-2",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
