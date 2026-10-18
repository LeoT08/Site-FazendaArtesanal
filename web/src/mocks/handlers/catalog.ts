import { http, HttpResponse } from 'msw'
import type { Product, ProductSort } from '@/api/types'
import { db } from '../db'
import { apiError, latency, route } from './utils'

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const sorters: Record<ProductSort, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  'price-asc': (a, b) => a.priceCents - b.priceCents,
  'price-desc': (a, b) => b.priceCents - a.priceCents,
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
}

export const catalogHandlers = [
  http.get(route('/categories'), async () => {
    await latency()
    return HttpResponse.json(db.categories)
  }),

  http.get(route('/products'), async ({ request }) => {
    await latency()
    const params = new URL(request.url).searchParams
    const category = params.get('category')
    const q = params.get('q')
    const sort = (params.get('sort') ?? 'featured') as ProductSort
    const featured = params.get('featured') === 'true'

    let list = db.products.filter((p) => p.available)
    if (category) list = list.filter((p) => p.category === category)
    if (featured) list = list.filter((p) => p.featured)
    if (q) {
      const term = normalize(q)
      list = list.filter((p) =>
        normalize([p.name, p.summary, ...p.ingredients].join(' ')).includes(term),
      )
    }
    list = [...list].sort(sorters[sort] ?? sorters.featured)
    return HttpResponse.json(list)
  }),

  http.get(route('/products/:slug'), async ({ params }) => {
    await latency()
    const product = db.products.find((p) => p.slug === params.slug && p.available)
    if (!product) return apiError(404, 'NOT_FOUND', 'Este produto não existe ou saiu do cardápio.')
    return HttpResponse.json(product)
  }),
]
