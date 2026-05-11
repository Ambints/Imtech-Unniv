import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline-primary',
  ghost: 'btn btn-link',
  destructive: 'btn btn-danger',
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => {
    const cls = [variantClass[variant], sizeClass[size], className].filter(Boolean).join(' ');
    return <button ref={ref} className={cls} {...props} />;
  },
);
Button.displayName = 'Button';

