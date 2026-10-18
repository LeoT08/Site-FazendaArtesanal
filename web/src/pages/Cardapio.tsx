import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useCategories, useProducts } from '@/api/queries'
import type { CategorySlug, ProductSort } from '@/api/types'
import { PageTransition } from '@/components/layout/Layout'
import { Input, Select } from '@/components/ui/field'
import { EmptyState, ErrorState } from '@/components/ui/misc'
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/ProductCard'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn } from '@/lib/utils'

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Mais pedidos' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome (A a Z)' },
]

export default function Cardapio() {
  usePageTitle('Cardápio')
  const [params, setParams] = useSearchParams()
  const category = (params.get('categoria') as CategorySlug | null) ?? undefined
  const sort = (params.get('ordem') as ProductSort | null) ?? 'featured'
  const q = params.get('busca') ?? ''
  const deferredQ = useDeferredValue(q)

  const categories = useCategories()
  const products = useProducts({ category, sort, q: deferredQ.trim() || undefined })

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const activeCategory = categories.data?.find((c) => c.slug === category)

  return (
    <PageTransition>
      <section className="container-page pb-6 pt-10 sm:pt-14">
        <h1 className="text-display-lg">{activeCategory?.name ?? 'Cardápio'}</h1>
        <p className="mt-3 max-w-prose text-lg text-tomilho-soft">
          {activeCategory?.description ??
            'Tudo é feito sob encomenda, em pequenos lotes. Tortas com 2 dias de antecedência, massas com 1.'}
        </p>
      </section>

      <div className="sticky top-16 z-30 border-y border-linha bg-porcelana/90 backdrop-blur-md sm:top-20">
        <div className="container-page flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Categorias">
            {[{ slug: undefined, name: 'Tudo' }, ...(categories.data ?? [])].map((c) => {
              const active = c.slug === category
              return (
                <button
                  key={c.name}
                  role="tab"
                  aria-selected={active}
                  onClick={() => update('categoria', c.slug)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-[0.9375rem] transition-colors',
                    active ? 'bg-tomilho text-porcelana' : 'text-tomilho-soft hover:bg-salvia-wash',
                  )}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 md:w-72 md:flex-none">
              <span className="sr-only">Buscar no cardápio</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-salvia" />
              <Input
                type="search"
                value={q}
                onChange={(e) => update('busca', e.target.value)}
                placeholder="Buscar ingrediente ou nome"
                className="py-2.5 pl-10"
              />
            </label>
            <label>
              <span className="sr-only">Ordenar por</span>
              <Select
                value={sort}
                onChange={(e) => update('ordem', e.target.value === 'featured' ? undefined : e.target.value)}
                className="py-2.5 pr-4"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      </div>

      <section className="container-page pt-12" aria-live="polite" aria-busy={products.isFetching}>
        {products.isError ? (
          <ErrorState message={products.error.message} onRetry={() => products.refetch()} />
        ) : products.data?.length === 0 ? (
          <EmptyState
            title="Nada com esse nome por aqui"
            action={
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className="font-medium text-beterraba underline underline-offset-4"
              >
                Limpar a busca
              </button>
            }
          >
            Tente outro ingrediente, como palmito, queijo ou abóbora.
          </EmptyState>
        ) : (
          <div
            className={cn(
              'grid grid-cols-2 gap-x-5 gap-y-14 transition-opacity sm:gap-x-8 lg:grid-cols-3 xl:grid-cols-4',
              products.isFetching && !products.isLoading && 'opacity-60',
            )}
          >
            {products.isLoading
              ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
              : products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </PageTransition>
  )
}
