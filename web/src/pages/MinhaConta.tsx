import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useMyOrders } from '@/api/queries'
import type { Order } from '@/api/types'
import { PageTransition } from '@/components/layout/Layout'
import { Button, ButtonLink } from '@/components/ui/button'
import { EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/misc'
import { useSession } from '@/features/auth/session'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatDate, formatPrice } from '@/lib/utils'

function OrderRow({ order }: { order: Order }) {
  return (
    <li className="grid gap-4 rounded-2xl border border-linha bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-xl">{order.code}</span>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-2 text-[0.9375rem] text-tomilho-soft">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
        <p className="mt-1 text-sm text-salvia">
          {order.fulfillment === 'delivery' ? 'Entrega' : 'Retirada'} em{' '}
          {formatDate(order.scheduledFor, { weekday: 'short', day: '2-digit', month: 'short' })}
        </p>
      </div>
      <span className="font-display text-2xl sm:text-right">{formatPrice(order.totalCents)}</span>
    </li>
  )
}

export default function MinhaConta() {
  usePageTitle('Minha conta')
  const user = useSession((s) => s.user)!
  const signOut = useSession((s) => s.signOut)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const orders = useMyOrders()

  const firstName = user.name.split(' ')[0]

  return (
    <PageTransition>
      <div className="container-page pt-10 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-display-lg">Olá, {firstName}</h1>
            <p className="mt-2 text-tomilho-soft">{user.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              signOut()
              qc.clear()
              navigate('/')
            }}
          >
            Sair da conta
          </Button>
        </div>

        <section className="mt-14" aria-labelledby="pedidos">
          <h2 id="pedidos" className="text-display-md">Seus pedidos</h2>
          <div className="mt-6">
            {orders.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            )}
            {orders.isError && <ErrorState message={orders.error.message} onRetry={() => orders.refetch()} />}
            {orders.data?.length === 0 && (
              <EmptyState title="Nenhum pedido ainda" action={<ButtonLink to="/cardapio">Ver o cardápio</ButtonLink>}>
                Quando você fizer uma encomenda, ela aparece aqui com o status atualizado.
              </EmptyState>
            )}
            {orders.data && orders.data.length > 0 && (
              <ul className="space-y-3">
                {orders.data.map((o) => <OrderRow key={o.id} order={o} />)}
              </ul>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
