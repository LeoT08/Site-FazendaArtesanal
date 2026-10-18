import { Navigate, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Order } from '@/api/types'
import { PageTransition } from '@/components/layout/Layout'
import { ButtonLink, buttonClass } from '@/components/ui/button'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatDate, formatPrice, whatsappLink } from '@/lib/utils'

function whatsappMessage(order: Order) {
  const items = order.items.map((i) => `- ${i.quantity}x ${i.name}`).join('\n')
  const when = formatDate(order.scheduledFor, { weekday: 'long', day: '2-digit', month: 'long' })
  const how = order.fulfillment === 'delivery' ? 'entrega' : 'retirada na fazenda'
  return `Olá! Acabei de fazer o pedido ${order.code} pelo site:\n${items}\n\nTotal: ${formatPrice(order.totalCents)}\nPara ${when}, ${how}.`
}

export default function PedidoConfirmado() {
  usePageTitle('Pedido enviado')
  const { code } = useParams()
  const order = (useLocation().state as { order?: Order } | null)?.order
  if (!order || order.code !== code) return <Navigate to="/minha-conta" replace />

  return (
    <PageTransition>
      <section className="container-page flex max-w-2xl flex-col items-center pt-16 text-center sm:pt-24">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-salvia-wash text-tomilho"
        >
          <Check className="h-8 w-8" aria-hidden />
        </motion.span>
        <h1 className="mt-6 text-display-lg">Pedido {order.code} enviado</h1>
        <p className="mt-4 text-lg text-tomilho-soft">
          Recebemos seu pedido para{' '}
          {formatDate(order.scheduledFor, { weekday: 'long', day: '2-digit', month: 'long' })}. A Monica confirma
          pelo WhatsApp e combina o pagamento. Você acompanha o status em Minha conta.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={whatsappLink(whatsappMessage(order))} target="_blank" rel="noreferrer" className={buttonClass('primary', 'lg')}>
            Avisar pelo WhatsApp
          </a>
          <ButtonLink to="/minha-conta" variant="secondary" size="lg">
            Acompanhar pedido
          </ButtonLink>
        </div>
      </section>
    </PageTransition>
  )
}
