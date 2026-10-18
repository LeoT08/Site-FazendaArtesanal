import { Link } from 'react-router-dom'
import { CONTACT } from '@/lib/constants'
import { whatsappLink } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="mt-24 bg-tomilho text-porcelana/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl text-porcelana">Fazenda Artesanal</p>
          <p className="mt-3 max-w-sm">
            Tortas e massas frescas feitas à mão por Monica Alves, com o que a horta dá em cada estação.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold text-porcelana">Encomendas</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={whatsappLink('Olá! Gostaria de fazer uma encomenda.')} target="_blank" rel="noreferrer" className="hover:text-porcelana">
                WhatsApp {CONTACT.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-porcelana">
                {CONTACT.email}
              </a>
            </li>
            <li>{CONTACT.hours}</li>
            <li>Entregas em {CONTACT.region}</li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold text-porcelana">Navegue</h2>
          <ul className="mt-4 space-y-2">
            <li><Link to="/cardapio?categoria=tortas" className="hover:text-porcelana">Tortas</Link></li>
            <li><Link to="/cardapio?categoria=massas" className="hover:text-porcelana">Massas</Link></li>
            <li><Link to="/#historia" className="hover:text-porcelana">Nossa história</Link></li>
            <li><Link to="/minha-conta" className="hover:text-porcelana">Meus pedidos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-porcelana/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-porcelana/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Fazenda Artesanal</p>
          <p>Desenvolvido por Leonardo Vieira Teixeira</p>
        </div>
      </div>
    </footer>
  )
}
