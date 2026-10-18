import { NavLink, Outlet } from 'react-router-dom'
import { PageTransition } from '@/components/layout/Layout'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/admin', label: 'Resumo', end: true },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/produtos', label: 'Produtos' },
]

export default function AdminLayout() {
  return (
    <PageTransition>
      <div className="container-page pt-10 sm:pt-14">
        <h1 className="text-display-lg">Painel da fazenda</h1>
        <nav className="mt-6 flex gap-1 border-b border-linha" aria-label="Seções do painel">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  '-mb-px border-b-2 px-4 py-3 text-[0.9375rem] transition-colors',
                  isActive ? 'border-beterraba font-medium text-tomilho' : 'border-transparent text-salvia hover:text-tomilho',
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-8">
          <Outlet />
        </div>
      </div>
    </PageTransition>
  )
}
