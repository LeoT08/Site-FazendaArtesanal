import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/api/types'
import { Skeleton } from '@/components/ui/misc'
import { useCart } from '@/features/cart/cart'
import { formatPrice } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add)

  return (
    <article className="group relative flex h-full flex-col">
      <Link to={`/produto/${product.slug}`} className="block rounded-full" aria-label={product.name}>
        {/* As fotos são pratos vistos de cima: o recorte redondo mantém o prato inteiro */}
        <div className="aspect-square overflow-hidden rounded-full bg-salvia-wash">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:rotate-[4deg] group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl leading-snug sm:text-[1.375rem]">
            <Link to={`/produto/${product.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-[0.9375rem] text-salvia">{product.summary}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="font-medium">{formatPrice(product.priceCents)}</span>
        <button
          type="button"
          onClick={() => {
            add(product)
            toast.success(`${product.name} foi para a sacola`, {
              action: { label: 'Ver sacola', onClick: () => useCart.getState().open() },
            })
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-tomilho/25 p-2 text-sm sm:px-3.5 sm:py-1.5 font-medium transition-colors hover:border-beterraba hover:bg-beterraba hover:text-white"
          aria-label={`Adicionar ${product.name} à sacola`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Adicionar</span>
        </button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square rounded-full" />
      <Skeleton className="mt-5 h-6 w-2/3" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-4 h-8 w-1/3" />
    </div>
  )
}
