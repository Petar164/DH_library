'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium tracking-[0.15em] uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed',
          {
            'bg-black text-white hover:bg-zinc-800 active:scale-[0.98]': variant === 'primary',
            'bg-transparent border border-black text-black hover:bg-black hover:text-white': variant === 'secondary',
            'bg-transparent text-zinc-500 hover:text-black': variant === 'ghost',
            'bg-black text-white hover:bg-zinc-800': variant === 'danger',
          },
          {
            'text-[10px] px-4 py-2': size === 'sm',
            'text-[10px] px-6 py-3': size === 'md',
            'text-[11px] px-8 py-4': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
