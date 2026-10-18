import { PageTransition } from '@/components/layout/Layout'
import { ButtonLink } from '@/components/ui/button'
import { usePageTitle } from '@/lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <PageTransition>
      <section className="container-page flex flex-col items-center pt-20 text-center">
        <img src="/images/farfale-colorido.jpg" alt="" className="h-40 w-40 rounded-full object-cover" />
        <h1 className="mt-8 text-display-lg">Esta página não existe</h1>
        <p className="mt-3 max-w-md text-lg text-tomilho-soft">
          O endereço pode ter mudado ou o produto saiu do cardápio.
        </p>
        <div className="mt-8 flex gap-3">
          <ButtonLink to="/cardapio">Ver o cardápio</ButtonLink>
          <ButtonLink to="/" variant="secondary">Ir para o início</ButtonLink>
        </div>
      </section>
    </PageTransition>
  )
}
