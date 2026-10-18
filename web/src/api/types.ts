// DTOs do contrato da API. A API real (back-end) deve devolver exatamente estes formatos.
// Documentação completa em docs/api.md e docs/openapi.yaml.

export type Role = 'customer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  phone?: string
  password: string
}

export type CategorySlug = 'tortas' | 'massas'

export interface Category {
  slug: CategorySlug
  name: string
  description: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  /** Uma frase, usada nos cards */
  summary: string
  description: string
  /** Preço em centavos */
  priceCents: number
  image: string
  ingredients: string[]
  /** Ex.: "6 a 8 fatias", "500 g, serve 3 pessoas" */
  serves: string
  /** Como preparar/aquecer em casa */
  preparation: string
  /** Prazo de encomenda em dias */
  leadTimeDays: number
  featured: boolean
  available: boolean
}

export type ProductInput = Omit<Product, 'id'>

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  category?: CategorySlug
  q?: string
  sort?: ProductSort
  featured?: boolean
}

export type FulfillmentType = 'pickup' | 'delivery'

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  unitPriceCents: number
  quantity: number
}

export interface Address {
  street: string
  number: string
  district: string
  city: string
  zip: string
  complement?: string
}

export interface Order {
  id: string
  code: string
  userId: string
  customerName: string
  items: OrderItem[]
  fulfillment: FulfillmentType
  address: Address | null
  /** Data desejada (YYYY-MM-DD) */
  scheduledFor: string
  notes: string
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[]
  fulfillment: FulfillmentType
  address?: Address
  scheduledFor: string
  notes?: string
}

export interface AdminStats {
  ordersToday: number
  revenueTodayCents: number
  pendingOrders: number
  revenueLast7Days: { date: string; totalCents: number }[]
  topProducts: { productId: string; name: string; quantity: number }[]
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}
