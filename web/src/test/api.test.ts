import { describe, expect, it, beforeEach } from 'vitest'
import { ApiError } from '@/api/client'
import { adminApi, authApi, catalogApi, ordersApi } from '@/api/endpoints'
import { useSession } from '@/features/auth/session'
import { DEMO_ADMIN, DEMO_CUSTOMER } from '@/mocks/seed'
import { earliestDate, toYmd } from '@/lib/utils'

async function signInAs(creds: { email: string; password: string }) {
  const auth = await authApi.login(creds)
  useSession.getState().signIn(auth)
  return auth
}

describe('API fictícia', () => {
  beforeEach(() => useSession.getState().signOut())

  it('lista produtos filtrando por categoria e busca sem acento', async () => {
    const massas = await catalogApi.products({ category: 'massas' })
    expect(massas.length).toBeGreaterThan(0)
    expect(massas.every((p) => p.category === 'massas')).toBe(true)

    const busca = await catalogApi.products({ q: 'acafrao' })
    expect(busca.map((p) => p.slug)).toContain('agnoloti-acafrao')
  })

  it('ordena por preço', async () => {
    const list = await catalogApi.products({ sort: 'price-asc' })
    const prices = list.map((p) => p.priceCents)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('devolve 404 para produto inexistente', async () => {
    await expect(catalogApi.product('nao-existe')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' })
  })

  it('recusa login com senha errada', async () => {
    await expect(authApi.login({ email: DEMO_CUSTOMER.email, password: 'errada' })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
  })

  it('não deixa cadastrar e-mail repetido', async () => {
    await expect(
      authApi.register({ name: 'Outra', email: DEMO_CUSTOMER.email, password: '123456' }),
    ).rejects.toMatchObject({ status: 409, fields: { email: expect.any(String) } })
  })

  it('cria pedido e ele aparece em /orders/me', async () => {
    await signInAs(DEMO_CUSTOMER)
    const [product] = await catalogApi.products({ category: 'massas' })
    const order = await ordersApi.create({
      items: [{ productId: product.id, quantity: 2 }],
      fulfillment: 'delivery',
      address: { street: 'Rua A', number: '1', district: 'Centro', city: 'Cotia', zip: '06700-000' },
      scheduledFor: toYmd(earliestDate(2)),
    })
    expect(order.totalCents).toBe(product.priceCents * 2 + 1500)
    const mine = await ordersApi.mine()
    expect(mine[0].id).toBe(order.id)
  })

  it('valida antecedência do pedido', async () => {
    await signInAs(DEMO_CUSTOMER)
    const [torta] = await catalogApi.products({ category: 'tortas' })
    const err = await ordersApi
      .create({ items: [{ productId: torta.id, quantity: 1 }], fulfillment: 'pickup', scheduledFor: toYmd(new Date()) })
      .catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.fields.scheduledFor).toBeDefined()
  })

  it('bloqueia rotas de admin para clientes e libera para admin', async () => {
    await expect(adminApi.stats()).rejects.toMatchObject({ status: 401 })
    await signInAs(DEMO_CUSTOMER)
    await expect(adminApi.stats()).rejects.toMatchObject({ status: 403 })
    await signInAs(DEMO_ADMIN)
    const stats = await adminApi.stats()
    expect(stats.revenueLast7Days).toHaveLength(7)
  })

  it('admin muda o status de um pedido', async () => {
    await signInAs(DEMO_ADMIN)
    const [first] = await adminApi.orders('received')
    const updated = await adminApi.updateOrderStatus(first.id, 'preparing')
    expect(updated.status).toBe('preparing')
  })

  it('token inválido encerra a sessão', async () => {
    useSession.getState().signIn({ token: 'a.b.c', user: { id: 'x', name: 'X', email: 'x@x', phone: null, role: 'customer', createdAt: '' } })
    await expect(ordersApi.mine()).rejects.toMatchObject({ status: 401 })
    expect(useSession.getState().token).toBeNull()
  })
})
