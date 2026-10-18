import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShoppingBag, User } from 'lucide-react'
import { useSession } from '@/features/auth/session'
import { cartCount, useCart } from '@/features/cart/cart'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const links = [
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/#historia', label: 'Nossa história' },
  { to: '/#como-pedir', label: 'Como pedir' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useSession((s) => s.user)
  const count = useCart((s) => cartCount(s.lines))
  const openCart = useCart((s) => s.open)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname, hash])

  const accountHref = user ? (user.role === 'admin' ? '/admin' : '/minha-conta') : '/entrar'
  const accountLabel = user ? (user.role === 'admin' ? 'Painel' : 'Minha conta') : 'Entrar'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,box-shadow] duration-300',
        scrolled ? 'bg-porcelana/85 shadow-[0_1px_0_#E2E6DF] backdrop-blur-md' : 'bg-porcelana',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Fazenda Artesanal, página inicial">
          <img src="/images/logo.png" alt="" className="h-11 w-11 sm:h-12 sm:w-12" width={48} height={48} />
          <span className="font-display text-xl leading-none sm:text-[1.375rem]">Fazenda Artesanal</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-[0.9375rem] text-tomilho-soft transition-colors hover:text-tomilho',
                  isActive && !l.to.includes('#') && 'text-tomilho underline decoration-acafrao decoration-2 underline-offset-8',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to={accountHref}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] text-tomilho-soft transition-colors hover:bg-salvia-wash hover:text-tomilho sm:inline-flex"
          >
            <User className="h-[18px] w-[18px]" aria-hidden />
            {accountLabel}
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] transition-colors hover:bg-salvia-wash"
            aria-label={`Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Sacola</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-beterraba px-1.5 text-xs font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-salvia-wash md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav className="flex flex-col" aria-label="Menu móvel">
          {[...links, { to: accountHref, label: accountLabel }].map((l) => (
            <Link key={l.to} to={l.to} className="border-b border-linha py-4 font-display text-2xl">
              {l.label}
            </Link>
          ))}
        </nav>
      </Sheet>
    </header>
  )
}
