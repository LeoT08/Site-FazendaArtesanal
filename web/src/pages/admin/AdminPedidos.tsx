import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminOrders, useUpdateOrderStatus } from '@/api/queries'
import type { OrderStatus } from '@/api/types'
import { Select } from '@/components/ui/field'
import { EmptyState, ErrorState, Skeleton, StatusBadge } from '@/components/ui/misc'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn, formatDate, formatPrice, ORDER_STATUS_LABEL } from '@/lib/utils'

const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]

export default function AdminPedidos() {
  usePageTitle('Pedidos')
  const [filter, setFilter] = useState<OrderStatus | undefined>()
  const orders = useAdminOrders(filter)
  const update = useUpdateOrderStatus()

  return (
    <div>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Filtrar por status">
        {[undefined, ...STATUSES].map((s) => (
          <button
            key={s ?? 'all'}
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm transition-colors',
              filter === s ? 'bg-tomilho text-porcelana' : 'text-tomilho-soft hover:bg-salvia-wash',
            )}
          >
            {s ? ORDER_STATUS_LABEL[s] : 'Todos'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {orders.isLoading && <Skeleton className="h-64" />}
        {orders.isError && <ErrorState message={orders.error.message} onRetry={() => orders.refetch()} />}
        {orders.data?.length === 0 && <EmptyState title="Nenhum pedido com esse status" />}
        {orders.data && orders.data.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-linha bg-white">
            <table className="w-full min-w-[760px] text-left text-[0.9375rem]">
              <thead className="border-b border-linha text-sm text-salvia">
                <tr>
                  <th className="px-5 py-3 font-medium">Pedido</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Itens</th>
                  <th className="px-5 py-3 font-medium">Para</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {orders.data.map((o) => (
                  <tr key={o.id} className="align-top">
                    <td className="px-5 py-4">
                      <span className="font-medium">{o.code}</span>
                      <span className="mt-0.5 block text-xs text-salvia">
                        {formatDate(o.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">{o.customerName}</td>
                    <td className="max-w-64 px-5 py-4 text-tomilho-soft">
                      {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      {o.notes && <span className="mt-1 block text-xs italic text-salvia">“{o.notes}”</span>}
                    </td>
                    <td className="px-5 py-4">
                      {formatDate(o.scheduledFor, { weekday: 'short', day: '2-digit', month: 'short' })}
                      <span className="block text-xs text-salvia">{o.fulfillment === 'delivery' ? 'Entrega' : 'Retirada'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">{formatPrice(o.totalCents)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={o.status} />
                        <label>
                          <span className="sr-only">Mudar status do pedido {o.code}</span>
                          <Select
                            value={o.status}
                            disabled={update.isPending && update.variables?.id === o.id}
                            onChange={(e) =>
                              update.mutate(
                                { id: o.id, status: e.target.value as OrderStatus },
                                {
                                  onSuccess: (u) => toast.success(`${u.code} agora está ${ORDER_STATUS_LABEL[u.status].toLowerCase()}`),
                                  onError: (err) => toast.error(err.message),
                                },
                              )
                            }
                            className="w-36 px-3 py-1.5 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                            ))}
                          </Select>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
