import type { Category, Order, Product, User } from '@/api/types'

export interface UserRecord extends User {
  /** Só no mock. A API real guarda hash (bcrypt/argon2), nunca a senha. */
  password: string
}

export const DEMO_CUSTOMER = { email: 'cliente@fazenda.dev', password: 'cliente123' }
export const DEMO_ADMIN = { email: 'admin@fazenda.dev', password: 'admin123' }

export const seedCategories: Category[] = [
  {
    slug: 'tortas',
    name: 'Tortas',
    description: 'Massa amanteigada, recheios de horta e decoração com ervas frescas.',
  },
  {
    slug: 'massas',
    name: 'Massas',
    description: 'Massas frescas recheadas, coloridas com legumes e especiarias.',
  },
]

export const seedUsers: UserRecord[] = [
  {
    id: 'usr_admin',
    name: 'Monica Alves',
    email: DEMO_ADMIN.email,
    password: DEMO_ADMIN.password,
    phone: '11914838950',
    role: 'admin',
    createdAt: '2024-01-10T12:00:00.000Z',
  },
  {
    id: 'usr_demo',
    name: 'Cliente Demo',
    email: DEMO_CUSTOMER.email,
    password: DEMO_CUSTOMER.password,
    phone: '11999990000',
    role: 'customer',
    createdAt: '2025-03-02T15:30:00.000Z',
  },
]

const torta = (p: Omit<Product, 'category' | 'leadTimeDays' | 'available'>): Product => ({
  ...p,
  category: 'tortas',
  leadTimeDays: 2,
  available: true,
})

const massa = (p: Omit<Product, 'category' | 'leadTimeDays' | 'available'>): Product => ({
  ...p,
  category: 'massas',
  leadTimeDays: 1,
  available: true,
})

const TORTA_PREPARO =
  'Chega assada. Aqueça em forno preaquecido a 180 °C por 15 minutos. Na geladeira, dura até 4 dias.'
const MASSA_PREPARO =
  'Cozinhe em bastante água fervente com sal por 3 a 4 minutos, até subir. Congelada, dura 60 dias e vai direto do freezer para a panela.'

export const seedProducts: Product[] = [
  torta({
    id: 'prd_torta_jardim',
    slug: 'torta-jardim',
    name: 'Torta Jardim',
    summary: 'Legumes da horta e ervas frescas prensadas sobre a massa.',
    description:
      'A torta que deu nome à casa. Recheio cremoso de abobrinha, alho-poró e ricota, coberto por rodelas de cenoura, cebola roxa enrolada e ramos de tomilho e sálvia colhidos na manhã do preparo.',
    priceCents: 11900,
    image: '/images/torta-jardim.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Ricota', 'Abobrinha', 'Alho-poró', 'Cenoura', 'Cebola roxa', 'Tomilho', 'Sálvia'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: true,
  }),
  torta({
    id: 'prd_torta_jardim_carne',
    slug: 'torta-jardim-de-carne',
    name: 'Torta Jardim de Carne',
    summary: 'Carne cozida devagar com legumes, sob uma tampa de ervas.',
    description:
      'Acém desfiado depois de quatro horas de cozimento lento com vinho tinto, cenoura e cebola. A massa é decorada com folhas de sálvia e flores de massa, como a Torta Jardim.',
    priceCents: 13900,
    image: '/images/torta-jardim-de-carne.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Acém', 'Vinho tinto', 'Cenoura', 'Cebola', 'Sálvia', 'Louro'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: true,
  }),
  torta({
    id: 'prd_torta_martinica',
    slug: 'torta-martinica',
    name: 'Torta Martinica',
    summary: 'Frango, palmito e milho com toque de limão-siciliano.',
    description:
      'Frango caipira desfiado com palmito pupunha, milho verde e raspas de limão-siciliano, num creme leve de requeijão feito aqui na fazenda.',
    priceCents: 12400,
    image: '/images/torta-martinica.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Frango caipira', 'Palmito pupunha', 'Milho verde', 'Requeijão', 'Limão-siciliano'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: false,
  }),
  torta({
    id: 'prd_torta_palmito',
    slug: 'torta-cremosa-de-palmito',
    name: 'Torta Cremosa de Palmito',
    summary: 'Palmito pupunha em creme de queijo, massa que desmancha.',
    description:
      'Recheio generoso de palmito pupunha em pedaços, creme de queijo meia-cura e cheiro-verde. A massa leva manteiga de verdade e é aberta à mão.',
    priceCents: 10900,
    image: '/images/torta-cremosa-de-palmito.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Palmito pupunha', 'Queijo meia-cura', 'Creme de leite', 'Cheiro-verde'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: false,
  }),
  torta({
    id: 'prd_torta_cebola',
    slug: 'torta-de-cebola',
    name: 'Torta de Cebola',
    summary: 'Cebolas caramelizadas por horas, queijo e tomilho.',
    description:
      'Cebolas douradas em fogo baixo até virarem geleia, com queijo gruyère nacional e tomilho. Doce e salgada na medida.',
    priceCents: 9900,
    image: '/images/torta-de-cebola.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Cebola', 'Queijo tipo gruyère', 'Ovos', 'Tomilho'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: true,
  }),
  torta({
    id: 'prd_torta_bosque',
    slug: 'torta-bosque',
    name: 'Torta Bosque',
    summary: 'Cogumelos frescos, espinafre e queijo de cabra.',
    description:
      'Shiitake e paris salteados na manteiga, espinafre e queijo de cabra da região. Uma torta mais terrosa, que pede um vinho branco.',
    priceCents: 12900,
    image: '/images/torta-bosque.jpg',
    ingredients: ['Farinha de trigo', 'Manteiga', 'Shiitake', 'Cogumelo paris', 'Espinafre', 'Queijo de cabra', 'Alecrim'],
    serves: '8 fatias (26 cm)',
    preparation: TORTA_PREPARO,
    featured: false,
  }),
  massa({
    id: 'prd_agnoloti',
    slug: 'agnoloti-acafrao',
    name: 'Agnoloti de Açafrão',
    summary: 'Massa tingida com açafrão, recheio de queijo e abóbora.',
    description:
      'Massa fresca com açafrão-da-terra, dobrada à mão em pequenos agnoloti recheados com abóbora cabotiá assada e parmesão. Vai bem só com manteiga e sálvia.',
    priceCents: 6200,
    image: '/images/agnoloti-acafrao.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Açafrão-da-terra', 'Abóbora cabotiá', 'Parmesão', 'Noz-moscada'],
    serves: '500 g, serve 3 pessoas',
    preparation: MASSA_PREPARO,
    featured: true,
  }),
  massa({
    id: 'prd_fiocchi',
    slug: 'fiocchi-de-queijo',
    name: 'Fiocchi de Queijo',
    summary: 'Trouxinhas de massa com quatro queijos e pera.',
    description:
      'Pequenas trouxinhas fechadas uma a uma, recheadas com gorgonzola, parmesão, muçarela de búfala, ricota e um toque de pera.',
    priceCents: 6800,
    image: '/images/fiocchi-de-queijo.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Gorgonzola', 'Parmesão', 'Muçarela de búfala', 'Ricota', 'Pera'],
    serves: '500 g, serve 3 pessoas',
    preparation: MASSA_PREPARO,
    featured: false,
  }),
  massa({
    id: 'prd_caramelle',
    slug: 'caramelle-colorida',
    name: 'Caramelle Colorida',
    summary: 'Massa em forma de bala, tingida com beterraba, cenoura e açafrão.',
    description:
      'Cada cor vem de um legume: beterraba, cenoura e açafrão. O recheio é de ricota de búfala com limão-siciliano e manjericão. Fica lindo com molho de tomate assado.',
    priceCents: 7200,
    image: '/images/caramelle-colorida.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Beterraba', 'Cenoura', 'Açafrão-da-terra', 'Ricota de búfala', 'Manjericão'],
    serves: '500 g, serve 3 pessoas',
    preparation: MASSA_PREPARO,
    featured: true,
  }),
  massa({
    id: 'prd_fagottini',
    slug: 'fagottini',
    name: 'Fagottini',
    summary: 'Trouxinhas de espinafre com ricota e nozes.',
    description:
      'Massa verde de espinafre fechada em trouxinhas, com recheio de ricota fresca, nozes tostadas e raspas de limão.',
    priceCents: 6400,
    image: '/images/fagottini.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Espinafre', 'Ricota', 'Nozes', 'Limão-siciliano'],
    serves: '500 g, serve 3 pessoas',
    preparation: MASSA_PREPARO,
    featured: false,
  }),
  massa({
    id: 'prd_farfalle',
    slug: 'farfale-colorido',
    name: 'Farfalle Colorido',
    summary: 'Gravatinhas listradas de massa fresca, sem recheio.',
    description:
      'Massa laminada com faixas de beterraba, espinafre e açafrão, cortada em gravatinhas. Sem recheio, pede molhos leves de azeite e legumes.',
    priceCents: 4800,
    image: '/images/farfale-colorido.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Beterraba', 'Espinafre', 'Açafrão-da-terra'],
    serves: '500 g, serve 4 pessoas',
    preparation: 'Cozinhe em água fervente com sal por 2 a 3 minutos. Congelada, dura 60 dias.',
    featured: false,
  }),
  massa({
    id: 'prd_tortelone',
    slug: 'tortelone-de-carne',
    name: 'Tortelone de Carne',
    summary: 'Recheio de carne de panela desfiada, massa fina e firme.',
    description:
      'Tortelone grande recheado com carne de panela cozida por horas, com cebola e vinho. Combina com o próprio caldo reduzido ou molho de tomate.',
    priceCents: 6900,
    image: '/images/tortelone-de-carne.jpg',
    ingredients: ['Farinha de trigo', 'Ovos caipiras', 'Músculo bovino', 'Cebola', 'Vinho tinto', 'Salsinha'],
    serves: '500 g, serve 3 pessoas',
    preparation: MASSA_PREPARO,
    featured: false,
  }),
]

/** Alguns pedidos para o painel e a conta demo não começarem vazios. */
export function seedOrders(now = new Date()): Order[] {
  const day = (offset: number, hour = 10) => {
    const d = new Date(now)
    d.setDate(d.getDate() - offset)
    d.setHours(hour, 0, 0, 0)
    return d
  }
  const ymd = (d: Date) => d.toISOString().slice(0, 10)
  const make = (
    n: number,
    offset: number,
    items: [string, number][],
    status: Order['status'],
    fulfillment: Order['fulfillment'] = 'pickup',
    userId = 'usr_demo',
    customerName = 'Cliente Demo',
  ): Order => {
    const lines = items.map(([id, quantity]) => {
      const p = seedProducts.find((x) => x.id === id)!
      return { productId: id, name: p.name, unitPriceCents: p.priceCents, quantity }
    })
    const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0)
    const deliveryFeeCents = fulfillment === 'delivery' ? 1500 : 0
    const created = day(offset, 9 + (n % 8))
    const scheduled = new Date(created)
    scheduled.setDate(scheduled.getDate() + 2)
    return {
      id: `ord_seed_${n}`,
      code: `FA-${String(1000 + n)}`,
      userId,
      customerName,
      items: lines,
      fulfillment,
      address:
        fulfillment === 'delivery'
          ? { street: 'Rua das Hortênsias', number: '120', district: 'Granja Viana', city: 'Cotia', zip: '06709-000' }
          : null,
      scheduledFor: ymd(scheduled),
      notes: '',
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents,
      status,
      createdAt: created.toISOString(),
    }
  }
  return [
    make(1, 6, [['prd_torta_jardim', 1], ['prd_caramelle', 2]], 'completed'),
    make(2, 5, [['prd_torta_cebola', 1]], 'completed', 'delivery', 'usr_x1', 'Ana Ribeiro'),
    make(3, 4, [['prd_agnoloti', 3]], 'completed', 'pickup', 'usr_x2', 'Paulo Mendes'),
    make(4, 3, [['prd_torta_bosque', 1], ['prd_fagottini', 1]], 'completed', 'delivery', 'usr_x3', 'Juliana Prado'),
    make(5, 2, [['prd_torta_jardim_carne', 2]], 'ready', 'pickup', 'usr_x1', 'Ana Ribeiro'),
    make(6, 1, [['prd_tortelone', 2], ['prd_fiocchi', 1]], 'preparing'),
    make(7, 0, [['prd_torta_jardim', 1]], 'received', 'delivery', 'usr_x4', 'Rafael Costa'),
    make(8, 0, [['prd_caramelle', 1], ['prd_farfalle', 2]], 'received', 'pickup', 'usr_x2', 'Paulo Mendes'),
  ]
}
