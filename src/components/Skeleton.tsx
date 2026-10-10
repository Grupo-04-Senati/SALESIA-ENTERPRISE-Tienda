import type { ReactNode } from 'react'

interface Props {
  children?: ReactNode
  className?: string
}

export default function Skeleton({ children, className = '' }: Props) {
  return (
    <div className={`skeleton ${className}`}>
      {children ?? '\u00A0'}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)]">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-20" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-16 rounded-[var(--radius-full)]" />
        </div>
      </div>
    </div>
  )
}
