import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-transparent border-b border-zinc-400 py-2.5 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors',
            error && 'border-red-500 focus:border-red-600',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
