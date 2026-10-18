import { http, HttpResponse } from 'msw'
import type { AdminStats, OrderStatus, ProductInput } from '@/api/types'
import { db, newId, persist } from '../db'
import { apiError, authenticate, latency, route } from './utils'

const STATUSES: OrderStatus[] = ['received', 'preparing', 'ready', 'completed', 'cancelled']

function validateProduct(body: ProductInput, ignoreId?: string) {
  const fields: Record<string, string> = {}
  if (!body.name?.trim()) fields.name = 'Informe o nome.'
  if (!body.slug?.trim() || !/^[a-z0-9-]+$/.test(body.slug)) {
    fields.slug = 'Use só letras minúsculas, números e hífens.'
  } else if (db.products.some((p) => p.slug === body.slug && p.id !== ignoreId)) {
    fields.slug = 'Já existe um produto com este endereço.'
  }
  if (!['tortas', 'massas'].includes(body.category)) fields.category = 'Escolha uma categoria.'
  if (!Number.isInteger(body.priceCents) || body.priceCents <= 0) fields.priceCents = 'Informe um preço válido.'
  if (!body.summary?.trim()) fields.summary = 'Escreva um resumo curto.'
  return fields
}

export const adminHandlers = [
  http.get(route('/admin/stats'), async ({ request }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response

    const today = new Date().toDateString()
    const valid = db.orders.filter((o) => o.status !== 'cancelled')
    const todays = valid.filter((o) => new Date(o.createdAt).toDateString() === today)

    const revenueLast7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toDateString()
      return {
        date: d.toISOString().slice(0, 10),
        totalCents: valid
          .filter((o) => new Date(o.createdAt).toDateString() === key)
          .reduce((s, o) => s + o.totalCents, 0),
      }
    })

    const counts = new Map<string, { productId: string; name: string; quantity: number }>()
    for (const o of valid) {
      for (const i of o.items) {
        const cur = counts.get(i.productId) ?? { productId: i.productId, name: i.name, quantity: 0 }
        cur.quantity += i.quantity
        counts.set(i.productId, cur)
      }
    }

    const stats: AdminStats = {
      ordersToday: todays.length,
      revenueTodayCents: todays.reduce((s, o) => s + o.totalCents, 0),
      pendingOrders: db.orders.filter((o) => ['received', 'preparing', 'ready'].includes(o.status)).length,
      revenueLast7Days,
      topProducts: [...counts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    }
    return HttpResponse.json(stats)
  }),

  http.get(route('/admin/products'), async ({ request }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    return HttpResponse.json(db.products)
  }),

  http.post(route('/admin/products'), async ({ request }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    const body = (await request.json()) as ProductInput
    const fields = validateProduct(body)
    if (Object.keys(fields).length) return apiError(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', fields)
    const product = { ...body, id: newId('prd') }
    db.products.push(product)
    persist()
    return HttpResponse.json(product, { status: 201 })
  }),

  http.put(route('/admin/products/:id'), async ({ request, params }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    const idx = db.products.findIndex((p) => p.id === params.id)
    if (idx === -1) return apiError(404, 'NOT_FOUND', 'Produto não encontrado.')
    const body = (await request.json()) as ProductInput
    const fields = validateProduct(body, String(params.id))
    if (Object.keys(fields).length) return apiError(422, 'VALIDATION_ERROR', 'Confira os campos destacados.', fields)
    db.products[idx] = { ...body, id: db.products[idx].id }
    persist()
    return HttpResponse.json(db.products[idx])
  }),

  http.delete(route('/admin/products/:id'), async ({ request, params }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    const idx = db.products.findIndex((p) => p.id === params.id)
    if (idx === -1) return apiError(404, 'NOT_FOUND', 'Produto não encontrado.')
    db.products.splice(idx, 1)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(route('/admin/orders'), async ({ request }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    const status = new URL(request.url).searchParams.get('status')
    const list = db.orders
      .filter((o) => !status || o.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json(list)
  }),

  http.patch(route('/admin/orders/:id/status'), async ({ request, params }) => {
    await latency()
    const auth = authenticate(request, 'admin')
    if ('response' in auth) return auth.response
    const order = db.orders.find((o) => o.id === params.id)
    if (!order) return apiError(404, 'NOT_FOUND', 'Pedido não encontrado.')
    const { status } = (await request.json()) as { status: OrderStatus }
    if (!STATUSES.includes(status)) return apiError(422, 'INVALID_STATUS', 'Status inválido.')
    order.status = status
    persist()
    return HttpResponse.json(order)
  }),
]
