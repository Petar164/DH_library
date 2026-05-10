import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function brandLabel(brand: string): string {
  return brand === 'dior_homme' ? 'Dior Homme' : 'Saint Laurent'
}

export function seasonLabel(period: string, year: number): string {
  return `${period} ${year}`
}
