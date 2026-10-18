import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ApiError } from '@/api/client'
import { useAdminProducts, useDeleteProduct, useSaveProduct } from '@/api/queries'
import type { Product, ProductInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { ErrorState, Skeleton } from '@/components/ui/misc'
import { Sheet } from '@/components/ui/sheet'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn, formatPrice } from '@/lib/utils'

const IMAGES = [
  'torta-jardim', 'torta-jardim-de-carne', 'torta-martinica', 'torta-cremosa-de-palmito', 'torta-de-cebola',
  'torta-bosque', 'agnoloti-acafrao', 'fiocchi-de-queijo', 'caramelle-colorida', 'fagottini',
  'farfale-colorido', 'tortelone-de-carne',
].map((n) => `/images/${n}.jpg`)

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome.'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Use só letras minúsculas, números e hífens.'),
  category: z.enum(['tortas', 'massas']),
  summary: z.string().trim().min(5, 'Escreva um resumo curto.').max(90, 'Use até 90 caracteres.'),
  description: z.string().trim().min(10, 'Descreva o produto.'),
  price: z.string().regex(/^\d+([.,]\d{1,2})?$/, 'Use o formato 119,90.'),
  image: z.string().min(1),
  ingredients: z.string().trim().min(2, 'Liste os ingredientes.'),
  serves: z.string().trim().min(2, 'Informe o rendimento.'),
  preparation: z.string().trim().min(5, 'Explique como preparar.'),
  leadTimeDays: z.coerce.number().int().min(0).max(14),
  featured: z.boolean(),
  available: z.boolean(),
})
type FormValues = z.infer<typeof schema>

const toForm = (p?: Product): FormValues => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  category: p?.category ?? 'tortas',
  summary: p?.summary ?? '',
  description: p?.description ?? '',
  price: p ? (p.priceCents / 100).toFixed(2).replace('.', ',') : '',
  image: p?.image ?? IMAGES[0],
  ingredients: p?.ingredients.join(', ') ?? '',
  serves: p?.serves ?? '',
  preparation: p?.preparation ?? '',
  leadTimeDays: p?.leadTimeDays ?? 2,
  featured: p?.featured ?? false,
  available: p?.available ?? true,
})

const toInput = (v: FormValues): ProductInput => ({
  name: v.name,
  slug: v.slug,
  category: v.category,
  summary: v.summary,
  description: v.description,
  priceCents: Math.round(Number(v.price.replace(',', '.')) * 100),
  image: v.image,
  ingredients: v.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
  serves: v.serves,
  preparation: v.preparation,
  leadTimeDays: v.leadTimeDays,
  featured: v.featured,
  available: v.available,
})

function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const save = useSaveProduct()
  const { register, handleSubmit, setValue, setError, watch, formState: { errors, dirtyFields } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(product) })
  const image = watch('image')

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      { id: product?.id, input: toInput(values) },
      {
        onSuccess: (p) => {
          toast.success(product ? `${p.name} atualizado` : `${p.name} criado`)
          onDone()
        },
        onError: (err) => {
          if (err instanceof ApiError && err.fields) {
            for (const [k, m] of Object.entries(err.fields)) setError((k === 'priceCents' ? 'price' : k) as keyof FormValues, { message: m })
          } else toast.error(err.message)
        },
      },
    ),
  )

  return (
    <form id="product-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome" error={errors.name?.message} className="sm:col-span-2">
        {(p) => (
          <Input
            {...p}
            {...register('name', {
              onChange: (e) => {
                if (!product && !dirtyFields.slug) setValue('slug', slugify(e.target.value))
              },
            })}
          />
        )}
      </Field>
      <Field label="Endereço (slug)" error={errors.slug?.message} hint={`/produto/${watch('slug') || '...'}`}>
        {(p) => <Input {...p} {...register('slug')} />}
      </Field>
      <Field label="Categoria" error={errors.category?.message}>
        {(p) => (
          <Select {...p} {...register('category')}>
            <option value="tortas">Tortas</option>
            <option value="massas">Massas</option>
          </Select>
        )}
      </Field>
      <Field label="Preço (R$)" error={errors.price?.message}>
        {(p) => <Input {...p} inputMode="decimal" placeholder="119,90" {...register('price')} />}
      </Field>
      <Field label="Antecedência (dias)" error={errors.leadTimeDays?.message}>
        {(p) => <Input {...p} type="number" min={0} max={14} {...register('leadTimeDays')} />}
      </Field>
      <Field label="Resumo" error={errors.summary?.message} className="sm:col-span-2" hint="Aparece nos cards do cardápio.">
        {(p) => <Input {...p} {...register('summary')} />}
      </Field>
      <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
        {(p) => <Textarea {...p} {...register('description')} />}
      </Field>
      <Field label="Ingredientes" error={errors.ingredients?.message} className="sm:col-span-2" hint="Separados por vírgula.">
        {(p) => <Input {...p} {...register('ingredients')} />}
      </Field>
      <Field label="Rendimento" error={errors.serves?.message}>
        {(p) => <Input {...p} placeholder="8 fatias (26 cm)" {...register('serves')} />}
      </Field>
      <Field label="Preparo em casa" error={errors.preparation?.message}>
        {(p) => <Input {...p} {...register('preparation')} />}
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium">Foto</legend>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {IMAGES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setValue('image', src, { shouldDirty: true })}
              className={cn(
                'aspect-square overflow-hidden rounded-full ring-offset-2 transition',
                image === src ? 'ring-2 ring-beterraba' : 'opacity-70 hover:opacity-100',
              )}
              aria-label={`Usar foto ${src.split('/').pop()}`}
              aria-pressed={image === src}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <label className="inline-flex items-center gap-2 text-[0.9375rem]">
          <input type="checkbox" className="h-4 w-4 accent-beterraba" {...register('featured')} />
          Destaque na página inicial
        </label>
        <label className="inline-flex items-center gap-2 text-[0.9375rem]">
          <input type="checkbox" className="h-4 w-4 accent-beterraba" {...register('available')} />
          Disponível no cardápio
        </label>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          {product ? 'Salvar alterações' : 'Criar produto'}
        </Button>
      </div>
    </form>
  )
}

export default function AdminProdutos() {
  usePageTitle('Produtos')
  const products = useAdminProducts()
  const remove = useDeleteProduct()
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" aria-hidden />
          Novo produto
        </Button>
      </div>

      <div className="mt-6">
        {products.isLoading && <Skeleton className="h-96" />}
        {products.isError && <ErrorState message={products.error.message} onRetry={() => products.refetch()} />}
        {products.data && (
          <ul className="divide-y divide-linha rounded-2xl border border-linha bg-white">
            {products.data.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-salvia">
                    {p.category === 'tortas' ? 'Torta' : 'Massa'}
                    {p.featured && ', em destaque'}
                    {!p.available && ', fora do cardápio'}
                  </p>
                </div>
                <span className="hidden sm:block">{formatPrice(p.priceCents)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="rounded-full p-2 text-salvia hover:bg-salvia-wash hover:text-tomilho"
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Excluir ${p.name}? Esta ação não pode ser desfeita.`)) return
                      remove.mutate(p.id, {
                        onSuccess: () => toast.success(`${p.name} excluído`),
                        onError: (e) => toast.error(e.message),
                      })
                    }}
                    className="rounded-full p-2 text-salvia hover:bg-beterraba-wash hover:text-beterraba"
                    aria-label={`Excluir ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        side="center"
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === 'new' ? 'Novo produto' : `Editar ${editing?.name ?? ''}`}
      >
        {editing !== null && (
          <ProductForm product={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
        )}
      </Sheet>
    </div>
  )
}
