import { Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import type { OrderStatus } from '@/api/types'
import { cn, ORDER_STATUS_LABEL } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-salvia-wash', className)} aria-hidden />
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
  size = 'md',
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  label: string
  size?: 'sm' | 'md'
}) {
  const btn = cn(
    'grid place-items-center rounded-full text-tomilho transition-colors hover:bg-salvia-wash disabled:opacity-40',
    size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
  )
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-linha bg-white p-0.5"
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir">
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

const statusTone: Record<OrderStatus, string> = {
  received: 'bg-acafrao-wash text-[#7A5A12]',
  preparing: 'bg-massa text-[#6B5420]',
  ready: 'bg-salvia-wash text-tomilho',
  completed: 'bg-linha text-tomilho-soft',
  cancelled: 'bg-beterraba-wash text-beterraba-dark',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusTone[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-linha px-6 py-14 text-center">
      <h3 className="text-2xl">{title}</h3>
      {children && <p className="max-w-sm text-salvia">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-beterraba/30 bg-beterraba-wash px-5 py-4 text-beterraba-dark" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 text-sm font-semibold underline underline-offset-4">
          Tentar de novo
        </button>
      )}
    </div>
  )
}
