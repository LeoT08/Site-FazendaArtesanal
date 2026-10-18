import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/api/types'

export interface CartLine {
  productId: string
  slug: string
  name: string
  image: string
  unitPriceCents: number
  leadTimeDays: number
  quantity: number
}

export const MAX_QTY = 20

interface CartState {
  lines: CartLine[]
  isOpen: boolean
  add: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  open: () => void
  close: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (product, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === product.id)
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.productId === product.id
                  ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) }
                  : l,
              ),
            }
          }
          return {
            lines: [
              ...s.lines,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                unitPriceCents: product.priceCents,
                leadTimeDays: product.leadTimeDays,
                quantity: Math.min(MAX_QTY, quantity),
              },
            ],
          }
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines:
            quantity < 1
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) =>
                  l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l,
                ),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'fa:cart', partialize: (s) => ({ lines: s.lines }) },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0)
export const cartLeadDays = (lines: CartLine[]) => Math.max(1, ...lines.map((l) => l.leadTimeDays))
