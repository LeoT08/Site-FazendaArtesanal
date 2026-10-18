import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useProduct, useProducts } from '@/api/queries'
import { ApiError } from '@/api/client'
import { PageTransition } from '@/components/layout/Layout'
import { Button, ButtonLink } from '@/components/ui/button'
import { EmptyState, ErrorState, QuantityStepper, Skeleton } from '@/components/ui/misc'
import { useCart } from '@/features/cart/cart'
import { ProductCard } from '@/features/catalog/ProductCard'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatPrice } from '@/lib/utils'

export default function Produto() {
  const { slug = '' } = useParams()
  const { data: product, isLoading, error, refetch } = useProduct(slug)
  const related = useProducts({ category: product?.category })
  const add = useCart((s) => s.add)
  const openCart = useCart((s) => s.open)
  const [qty, setQty] = useState(1)
  usePageTitle(product?.name)

  if (isLoading) {
    return (
      <div className="container-page grid gap-12 pt-12 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-page pt-16">
        {error instanceof ApiError && error.status === 404 ? (
          <EmptyState title="Produto não encontrado" action={<ButtonLink to="/cardapio">Voltar ao cardápio</ButtonLink>}>
            {error.message}
          </EmptyState>
        ) : (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}
      </div>
    )
  }

  if (!product) return null

  return (
    <PageTransition>
      <div className="container-page pt-6 sm:pt-10">
        <Link
          to={`/cardapio?categoria=${product.category}`}
          className="inline-flex items-center gap-1 text-[0.9375rem] text-salvia hover:text-tomilho"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {product.category === 'tortas' ? 'Tortas' : 'Massas'}
        </Link>

        <div className="mt-6 grid gap-12 md:grid-cols-2 lg:gap-20">
          <motion.img
            src={product.image}
            alt={product.name}
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="aspect-square w-full rounded-full object-cover shadow-[0_40px_80px_-40px_rgba(38,48,42,0.5)]"
          />

          <div className="flex flex-col">
            <h1 className="text-display-lg">{product.name}</h1>
            <p className="mt-4 text-lg text-tomilho-soft">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="font-display text-3xl">{formatPrice(product.priceCents)}</span>
              <QuantityStepper label="Quantidade" value={qty} onChange={setQty} />
            </div>
            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto sm:self-start"
              onClick={() => {
                add(product, qty)
                setQty(1)
                toast.success(`${qty}x ${product.name} na sacola`, {
                  action: { label: 'Ver sacola', onClick: openCart },
                })
              }}
            >
              Adicionar à sacola
            </Button>

            {/* Ficha no estilo etiqueta de herbário: a moldura agrupa os dados técnicos do produto */}
            <dl className="specimen mt-10 divide-y divide-tomilho/15 text-[0.9375rem]">
              <div className="grid grid-cols-[8.5rem_1fr] gap-4 px-5 py-4">
                <dt className="text-salvia">Rendimento</dt>
                <dd>{product.serves}</dd>
              </div>
              <div className="grid grid-cols-[8.5rem_1fr] gap-4 px-5 py-4">
                <dt className="text-salvia">Encomenda</dt>
                <dd>
                  Com {product.leadTimeDays} {product.leadTimeDays === 1 ? 'dia' : 'dias'} de antecedência
                </dd>
              </div>
              <div className="grid grid-cols-[8.5rem_1fr] gap-4 px-5 py-4">
                <dt className="text-salvia">Ingredientes</dt>
                <dd>{product.ingredients.join(', ')}.</dd>
              </div>
              <div className="grid grid-cols-[8.5rem_1fr] gap-4 px-5 py-4">
                <dt className="text-salvia">Em casa</dt>
                <dd>{product.preparation}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {related.data && related.data.length > 1 && (
        <section className="container-page pt-24" aria-labelledby="relacionados">
          <h2 id="relacionados" className="text-display-md">
            Outras {product.category === 'tortas' ? 'tortas' : 'massas'} da casa
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {related.data
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </PageTransition>
  )
}
