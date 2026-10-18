import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { EmptyState, QuantityStepper } from '@/components/ui/misc'
import { formatPrice } from '@/lib/utils'
import { cartSubtotal, useCart, MAX_QTY } from './cart'

export function CartSheet() {
  const { lines, isOpen, close, setQuantity, remove } = useCart()
  const navigate = useNavigate()
  const subtotal = cartSubtotal(lines)

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(o) => !o && close()}
      title="Sua sacola"
      description={lines.length ? 'Revise os itens antes de finalizar.' : undefined}
      footer={
        lines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-salvia">Subtotal</span>
              <span className="font-display text-2xl">{formatPrice(subtotal)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                close()
                navigate('/finalizar')
              }}
            >
              Finalizar pedido
            </Button>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          title="Sua sacola está vazia"
          action={
            <Link to="/cardapio" onClick={close} className="font-medium text-beterraba underline underline-offset-4">
              Ver o cardápio
            </Link>
          }
        >
          Escolha uma torta ou massa no cardápio e ela aparece aqui.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-linha">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.li
                key={line.productId}
                layout
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 py-4"
              >
                <img src={line.image} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/produto/${line.slug}`}
                      onClick={close}
                      className="font-display text-lg leading-tight hover:underline"
                    >
                      {line.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="rounded-full p-1.5 text-salvia hover:bg-beterraba-wash hover:text-beterraba"
                      aria-label={`Remover ${line.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantityStepper
                      size="sm"
                      label={`Quantidade de ${line.name}`}
                      value={line.quantity}
                      max={MAX_QTY}
                      min={0}
                      onChange={(n) => setQuantity(line.productId, n)}
                    />
                    <span>{formatPrice(line.unitPriceCents * line.quantity)}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Sheet>
  )
}
