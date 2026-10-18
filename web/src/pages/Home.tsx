import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { useProducts } from '@/api/queries'
import { ButtonLink, buttonClass } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/misc'
import { PageTransition } from '@/components/layout/Layout'
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/ProductCard'
import { CONTACT } from '@/lib/constants'
import { usePageTitle } from '@/lib/usePageTitle'
import { whatsappLink } from '@/lib/utils'

// O único momento coreografado do site: os pratos chegam à mesa enquanto o título aparece.
const ease = [0.22, 1, 0.36, 1] as const
const line: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease, delay: 0.1 + i * 0.12 } }),
}
const plate: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -14 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 1.1, ease, delay: 0.25 + i * 0.18 },
  }),
}

function Hero() {
  return (
    <section className="container-page grid items-center gap-12 pb-20 pt-8 sm:pt-12 lg:grid-cols-[1.3fr_1fr] lg:gap-10 lg:pb-28">
      <motion.div initial="hidden" animate="show" className="max-w-2xl">
        <h1 className="text-display-xl">
          {['Tortas e massas', 'feitas à mão,', 'na fazenda.'].map((text, i) => (
            <motion.span key={text} custom={i} variants={line} className="block">
              {text}
            </motion.span>
          ))}
        </h1>
        <motion.p custom={3} variants={line} className="mt-7 max-w-prose text-lg text-tomilho-soft">
          Massa aberta no rolo, recheios com o que a horta dá na semana e ervas colhidas no dia do preparo.
          Você encomenda, a gente assa ou congela, e entrega na sua porta.
        </motion.p>
        <motion.div custom={4} variants={line} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink to="/cardapio" size="lg">
            Ver o cardápio
          </ButtonLink>
          <a
            href={whatsappLink('Olá! Gostaria de fazer uma encomenda.')}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('secondary', 'lg')}
          >
            Encomendar pelo WhatsApp
          </a>
        </motion.div>
      </motion.div>

      <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden>
        <motion.img
          src="/images/torta-jardim.jpg"
          alt=""
          custom={0}
          variants={plate}
          initial="hidden"
          animate="show"
          className="absolute inset-[6%] rounded-full object-cover shadow-[0_40px_80px_-40px_rgba(38,48,42,0.55)]"
        />
        <motion.img
          src="/images/caramelle-colorida.jpg"
          alt=""
          custom={1}
          variants={plate}
          initial="hidden"
          animate="show"
          className="absolute -bottom-2 -left-2 w-[34%] rounded-full border-[6px] border-porcelana object-cover sm:-left-6"
        />
        <motion.img
          src="/images/agnoloti-acafrao.jpg"
          alt=""
          custom={2}
          variants={plate}
          initial="hidden"
          animate="show"
          className="absolute -right-1 top-0 w-[26%] rounded-full border-[6px] border-porcelana object-cover sm:-right-4"
        />
      </div>
    </section>
  )
}

function Featured() {
  const { data, isLoading, isError, refetch } = useProducts({ featured: true })
  return (
    <section className="container-page py-16 sm:py-20" aria-labelledby="destaques">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="destaques" className="text-display-lg">Saindo do forno esta semana</h2>
          <p className="mt-3 max-w-prose text-tomilho-soft">Os mais pedidos pelos clientes da fazenda nas últimas semanas.</p>
        </div>
        <Link to="/cardapio" className="font-medium text-beterraba underline decoration-1 underline-offset-4 hover:decoration-2">
          Ver todo o cardápio
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
        {isLoading && Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
        {data?.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {isError && <ErrorState message="Não foi possível carregar os destaques." onRetry={() => refetch()} />}
    </section>
  )
}

function Categories() {
  const items = [
    {
      slug: 'tortas',
      title: 'Tortas',
      text: 'Massa amanteigada e decorada com legumes e ervas, como um jardim. Chegam assadas, prontas para aquecer.',
      image: '/images/torta-de-cebola.jpg',
    },
    {
      slug: 'massas',
      title: 'Massas frescas',
      text: 'Coloridas com beterraba, espinafre e açafrão, recheadas uma a uma. Chegam congeladas e vão direto para a panela.',
      image: '/images/fiocchi-de-queijo.jpg',
    },
  ]
  return (
    <section className="bg-salvia-wash py-20 sm:py-24">
      <div className="container-page grid gap-6 md:grid-cols-2">
        {items.map((c) => (
          <Link
            key={c.slug}
            to={`/cardapio?categoria=${c.slug}`}
            className="group flex items-center gap-6 rounded-[2rem] bg-porcelana p-6 transition-colors hover:bg-white sm:gap-8 sm:p-8"
          >
            <img
              src={c.image}
              alt=""
              loading="lazy"
              className="h-28 w-28 shrink-0 rounded-full object-cover transition-transform duration-700 group-hover:rotate-6 sm:h-36 sm:w-36"
            />
            <div>
              <h2 className="text-display-md">{c.title}</h2>
              <p className="mt-2 text-[0.9375rem] text-tomilho-soft">{c.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Story() {
  return (
    <section id="historia" className="container-page scroll-mt-24 py-20 sm:py-28">
      <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1fr] lg:gap-20">
        <img
          src="/images/sobre.jpg"
          alt="Monica Alves e o chef da casa sentados no jardim da fazenda"
          loading="lazy"
          className="w-full rounded-t-full object-cover md:max-w-md"
        />
        <div className="max-w-prose">
          <h2 className="text-display-lg">Uma cozinha no meio da horta</h2>
          <div className="mt-6 space-y-5 text-lg text-tomilho-soft">
            <p>
              A Fazenda Artesanal começou com as tortas que Monica Alves fazia para a família aos domingos. A massa
              era a da avó; a decoração vinha do que estivesse no canteiro, como cenoura, cebola roxa, sálvia e tomilho.
            </p>
            <p>
              Os vizinhos começaram a encomendar, depois os amigos dos vizinhos. Hoje a cozinha também faz massas
              frescas, tingidas com legumes e recheadas à mão, sempre em pequenos lotes.
            </p>
            <p>
              Nada fica em vitrine. Cada pedido entra na fila de produção do dia e sai daqui direto para a sua mesa.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowToOrder() {
  // Aqui a numeração é um processo de verdade, por isso os números.
  const steps = [
    { title: 'Escolha no cardápio', text: 'Monte a sacola com tortas e massas. Os preços já incluem tudo.' },
    {
      title: 'Agende a data',
      text: 'Tortas pedem 2 dias de antecedência; massas, 1 dia. Produzimos de terça a sábado.',
    },
    {
      title: 'Retire ou receba',
      text: `Busque na fazenda sem custo ou receba em ${CONTACT.region} por R$ 15.`,
    },
  ]
  return (
    <section id="como-pedir" className="scroll-mt-24 border-y border-linha bg-massa/40 py-20 sm:py-24">
      <div className="container-page">
        <h2 className="text-display-lg">Como pedir</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-5">
              <span className="font-display text-5xl leading-none text-acafrao" aria-hidden>
                {i + 1}
              </span>
              <div>
                <h3 className="text-2xl">{s.title}</h3>
                <p className="mt-2 text-tomilho-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="container-page pt-20 sm:pt-28">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-display-lg">Tem uma data especial chegando?</h2>
          <p className="mt-3 text-lg text-tomilho-soft">
            Para festas, almoços de família e encomendas acima de 10 unidades, combine direto com a Monica.
          </p>
        </div>
        <a
          href={whatsappLink('Olá! Gostaria de combinar uma encomenda para um evento.')}
          target="_blank"
          rel="noreferrer"
          className={buttonClass('primary', 'lg')}
        >
          Combinar pelo WhatsApp
        </a>
      </div>
    </section>
  )
}

export default function Home() {
  usePageTitle()
  return (
    <PageTransition>
      <Hero />
      <Featured />
      <Categories />
      <Story />
      <HowToOrder />
      <ClosingCta />
    </PageTransition>
  )
}
