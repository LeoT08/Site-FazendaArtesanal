import { describe, expect, it, beforeEach } from 'vitest'
import { cartCount, cartLeadDays, cartSubtotal, MAX_QTY, useCart } from '@/features/cart/cart'
import { seedProducts } from '@/mocks/seed'
import { earliestDate } from '@/lib/utils'

const [torta] = seedProducts.filter((p) => p.category === 'tortas')
const [massa] = seedProducts.filter((p) => p.category === 'massas')

describe('sacola', () => {
  beforeEach(() => useCart.getState().clear())

  it('soma quantidades do mesmo produto', () => {
    useCart.getState().add(torta)
    useCart.getState().add(torta, 2)
    const { lines } = useCart.getState()
    expect(lines).toHaveLength(1)
    expect(cartCount(lines)).toBe(3)
    expect(cartSubtotal(lines)).toBe(torta.priceCents * 3)
  })

  it('limita a quantidade máxima e remove ao zerar', () => {
    useCart.getState().add(massa, 50)
    expect(useCart.getState().lines[0].quantity).toBe(MAX_QTY)
    useCart.getState().setQuantity(massa.id, 0)
    expect(useCart.getState().lines).toHaveLength(0)
  })

  it('usa a maior antecedência entre os itens', () => {
    useCart.getState().add(massa)
    useCart.getState().add(torta)
    expect(cartLeadDays(useCart.getState().lines)).toBe(Math.max(torta.leadTimeDays, massa.leadTimeDays))
  })
})

describe('earliestDate', () => {
  it('pula domingo e segunda', () => {
    const saturday = new Date('2026-10-17T10:00:00')
    expect(earliestDate(1, saturday).getDay()).toBe(2) // sábado + 1 = domingo, vai para terça
  })
})
