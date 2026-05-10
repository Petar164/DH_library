import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-white/60 border border-zinc-300 p-3 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors resize-none',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
