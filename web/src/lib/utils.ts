import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrderStatus } from '@/api/types'
import { WHATSAPP_NUMBER } from './constants'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatPrice = (cents: number) => brl.format(cents / 100)

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) =>
  new Intl.DateTimeFormat('pt-BR', opts).format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso))

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recebido',
  preparing: 'Em preparo',
  ready: 'Pronto',
  completed: 'Entregue',
  cancelled: 'Cancelado',
}

/** Próxima data válida para encomenda: respeita antecedência e pula domingo/segunda. */
export function earliestDate(leadDays: number, from = new Date()) {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + leadDays)
  while (d.getDay() === 0 || d.getDay() === 1) d.setDate(d.getDate() + 1)
  return d
}

export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
