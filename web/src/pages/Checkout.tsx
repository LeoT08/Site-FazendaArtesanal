import { useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'
import { useCreateOrder } from '@/api/queries'
import type { Order } from '@/api/types'
import { PageTransition } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { useSession } from '@/features/auth/session'
import { cartLeadDays, cartSubtotal, useCart } from '@/features/cart/cart'
import { DELIVERY_FEE_CENTS } from '@/lib/constants'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn, earliestDate, formatPrice, toYmd } from '@/lib/utils'

const schema = z
  .object({
    fulfillment: z.enum(['pickup', 'delivery']),
    scheduledFor: z.string().min(1, 'Escolha uma data.'),
    notes: z.string().max(500, 'Use no máximo 500 caracteres.').optional(),
    address: z.object({
      zip: z.string(),
      street: z.string(),
      number: z.string(),
      district: z.string(),
      city: z.string(),
      complement: z.string().optional(),
    }),
  })
  .superRefine((v, ctx) => {
    const day = new Date(`${v.scheduledFor}T12:00:00`).getDay()
    if (day === 0 || day === 1) {
      ctx.addIssue({ code: 'custom', path: ['scheduledFor'], message: 'Não entregamos aos domingos e segundas.' })
    }
    if (v.fulfillment !== 'delivery') return
    const required: [keyof typeof v.address, string][] = [
      ['zip', 'Informe o CEP.'],
      ['street', 'Informe a rua.'],
      ['number', 'Informe o número.'],
      ['district', 'Informe o bairro.'],
      ['city', 'Informe a cidade.'],
    ]
    for (const [key, message] of required) {
      if (!v.address[key]?.trim()) ctx.addIssue({ code: 'custom', path: ['address', key], message })
    }
  })

type FormValues = z.infer<typeof schema>

export default function Checkout() {
  usePageTitle('Finalizar pedido')
  const user = useSession((s) => s.user)
  const { lines, clear } = useCart()
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const submitted = useRef(false)

  const minDate = toYmd(earliestDate(cartLeadDays(lines)))
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fulfillment: 'pickup',
      scheduledFor: minDate,
      notes: '',
      address: { zip: '', street: '', number: '', district: '', city: 'Cotia', complement: '' },
    },
  })
  const { register, handleSubmit, setError, formState: { errors } } = form
  const fulfillment = useWatch({ control: form.control, name: 'fulfillment' })

  useEffect(() => {
    // se a sacola mudou e a data ficou antes do mínimo, ajusta
    if (form.getValues('scheduledFor') < minDate) form.setValue('scheduledFor', minDate)
  }, [minDate, form])

  if (!user) return <Navigate to="/entrar?voltar=/finalizar" replace />
  // depois de enviar, a sacola é esvaziada: não redirecionar para o cardápio nesse momento
  if (lines.length === 0 && !submitted.current) return <Navigate to="/cardapio" replace />

  const subtotal = cartSubtotal(lines)
  const fee = fulfillment === 'delivery' ? DELIVERY_FEE_CENTS : 0

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order: Order = await createOrder.mutateAsync({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        fulfillment: values.fulfillment,
        address: values.fulfillment === 'delivery' ? values.address : undefined,
        scheduledFor: values.scheduledFor,
        notes: values.notes,
      })
      submitted.current = true
      clear()
      navigate(`/pedido/${order.code}`, { state: { order }, replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [path, message] of Object.entries(err.fields)) {
          setError(path as keyof FormValues, { message })
        }
      }
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar o pedido.')
    }
  })

  return (
    <PageTransition>
      <div className="container-page pt-10 sm:pt-14">
        <h1 className="text-display-lg">Finalizar pedido</h1>
        <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="space-y-10">
            <fieldset>
              <legend className="font-display text-2xl">Como você quer receber?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'pickup', title: 'Retirar na fazenda', text: 'Sem custo. Combinamos o horário pelo WhatsApp.' },
                  { value: 'delivery', title: 'Receber em casa', text: `${formatPrice(DELIVERY_FEE_CENTS)} em Cotia e Granja Viana.` },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'cursor-pointer rounded-2xl border p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-beterraba',
                      fulfillment === opt.value ? 'border-tomilho bg-salvia-wash' : 'border-linha hover:border-salvia-light',
                    )}
                  >
                    <input type="radio" value={opt.value} className="sr-only" {...register('fulfillment')} />
                    <span className="block font-medium">{opt.title}</span>
                    <span className="mt-1 block text-sm text-salvia">{opt.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {fulfillment === 'delivery' && (
              <fieldset className="grid gap-4 sm:grid-cols-6">
                <legend className="mb-4 font-display text-2xl">Endereço de entrega</legend>
                <Field label="CEP" error={errors.address?.zip?.message} className="sm:col-span-2">
                  {(p) => <Input {...p} inputMode="numeric" autoComplete="postal-code" {...register('address.zip')} />}
                </Field>
                <Field label="Rua" error={errors.address?.street?.message} className="sm:col-span-4">
                  {(p) => <Input {...p} autoComplete="address-line1" {...register('address.street')} />}
                </Field>
                <Field label="Número" error={errors.address?.number?.message} className="sm:col-span-2">
                  {(p) => <Input {...p} {...register('address.number')} />}
                </Field>
                <Field label="Complemento" className="sm:col-span-4">
                  {(p) => <Input {...p} autoComplete="address-line2" {...register('address.complement')} />}
                </Field>
                <Field label="Bairro" error={errors.address?.district?.message} className="sm:col-span-3">
                  {(p) => <Input {...p} {...register('address.district')} />}
                </Field>
                <Field label="Cidade" error={errors.address?.city?.message} className="sm:col-span-3">
                  {(p) => <Input {...p} autoComplete="address-level2" {...register('address.city')} />}
                </Field>
              </fieldset>
            )}

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 font-display text-2xl">Quando?</legend>
              <Field
                label="Data"
                error={errors.scheduledFor?.message}
                hint="Produzimos de terça a sábado."
              >
                {(p) => <Input {...p} type="date" min={minDate} {...register('scheduledFor')} />}
              </Field>
              <Field label="Observações" error={errors.notes?.message} className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    placeholder="Alergias, ponto da massa, recado para o cartão…"
                    {...register('notes')}
                  />
                )}
              </Field>
            </fieldset>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-[0_0_0_1px_#E2E6DF] lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Resumo</h2>
            <ul className="mt-5 space-y-4">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center gap-3">
                  <img src={l.image} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <span className="flex-1 text-[0.9375rem]">
                    {l.quantity}x {l.name}
                  </span>
                  <span>{formatPrice(l.unitPriceCents * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-linha pt-5 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-salvia">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-salvia">Entrega</dt>
                <dd>{fee ? formatPrice(fee) : 'Grátis'}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-3xl">{formatPrice(subtotal + fee)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-6 w-full" loading={createOrder.isPending}>
              Enviar pedido
            </Button>
            <p className="mt-3 text-center text-sm text-salvia">
              O pagamento é combinado na confirmação, por Pix ou cartão. <Link to="/cardapio" className="underline">Continuar escolhendo</Link>
            </p>
          </aside>
        </form>
      </div>
    </PageTransition>
  )
}
