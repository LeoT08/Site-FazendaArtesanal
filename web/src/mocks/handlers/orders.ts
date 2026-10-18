import { http, HttpResponse } from 'msw'
import type { CreateOrderInput, Order } from '@/api/types'
import { DELIVERY_FEE_CENTS } from '@/lib/constants'
import { db, newId, persist } from '../db'
import { apiError, authenticate, latency, route } from './utils'

export const ordersHandlers = [
  http.post(route('/orders'), async ({ request }) => {
    await latency()
    const auth = authenticate(request)
    if ('response' in auth) return auth.response
    const body = (await request.json()) as CreateOrderInput

    if (!body.items?.length) return apiError(422, 'EMPTY_ORDER', 'Adicione pelo menos um produto.')

    const items = []
    for (const line of body.items) {
      const product = db.products.find((p) => p.id === line.productId)
      if (!product || !product.available) {
        return apiError(422, 'PRODUCT_UNAVAILABLE', `Um dos produtos saiu do cardápio. Remova-o da sacola.`)
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
        return apiError(422, 'INVALID_QUANTITY', `Quantidade inválida para ${product.name}.`)
      }
      items.push({
        productId: product.id,
        name: product.name,
        unitPriceCents: product.priceCents,
        quantity: line.quantity,
      })
    }

    const fields: Record<string, string> = {}
    if (body.fulfillment === 'delivery') {
      const a = body.address
      if (!a?.street) fields['address.street'] = 'Informe a rua.'
      if (!a?.number) fields['address.number'] = 'Informe o número.'
      if (!a?.district) fields['address.district'] = 'Informe o bairro.'
      if (!a?.city) fields['address.city'] = 'Informe a cidade.'
      if (!a?.zip) fields['address.zip'] = 'Informe o CEP.'
    }
    const leadDays = Math.max(
      ...items.map((i) => db.products.find((p) => p.id === i.productId)!.leadTimeDays),
    )
    const earliest = new Date()
    earliest.setHours(0, 0, 0, 0)
    earliest.setDate(earliest.getDate() + leadDays)
    const scheduled = new Date(`${body.scheduledFor}T00:00:00`)
    if (Number.isNaN(scheduled.getTime())) fields.scheduledFor = 'Escolha uma data.'
    else if (scheduled < earliest) fields.scheduledFor = `Precisamos de ${leadDays} dia(s) de antecedência.`
    else if (scheduled.getDay() === 0 || scheduled.getDay() === 1) {
      fields.scheduledFor = 'Não entregamos aos domingos e segundas.'
    }
    if (Object.keys(fields).length) {
      return apiError(422, 'VALIDATION_ERROR', 'Confira os dados do pedido.', fields)
    }

    const subtotalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0)
    const deliveryFeeCents = body.fulfillment === 'delivery' ? DELIVERY_FEE_CENTS : 0
    db.orderSeq += 1
    const order: Order = {
      id: newId('ord'),
      code: `FA-${db.orderSeq}`,
      userId: auth.user.id,
      customerName: auth.user.name,
      items,
      fulfillment: body.fulfillment,
      address: body.fulfillment === 'delivery' ? body.address! : null,
      scheduledFor: body.scheduledFor,
      notes: body.notes?.trim() ?? '',
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents,
      status: 'received',
      createdAt: new Date().toISOString(),
    }
    db.orders.unshift(order)
    persist()
    return HttpResponse.json(order, { status: 201 })
  }),

  http.get(route('/orders/me'), async ({ request }) => {
    await latency()
    const auth = authenticate(request)
    if ('response' in auth) return auth.response
    const mine = db.orders
      .filter((o) => o.userId === auth.user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json(mine)
  }),
]
