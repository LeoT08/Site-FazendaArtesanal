import { api } from './client'
import type {
  AdminStats,
  AuthResponse,
  Category,
  CreateOrderInput,
  LoginInput,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  ProductQuery,
  RegisterInput,
  User,
} from './types'

export const authApi = {
  login: (input: LoginInput) => api<AuthResponse>('/auth/login', { method: 'POST', body: input }),
  register: (input: RegisterInput) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body: input }),
  me: () => api<User>('/auth/me'),
}

export const catalogApi = {
  categories: () => api<Category[]>('/categories'),
  products: (query: ProductQuery = {}) =>
    api<Product[]>('/products', {
      query: { ...query, featured: query.featured ? 'true' : undefined },
    }),
  product: (slug: string) => api<Product>(`/products/${encodeURIComponent(slug)}`),
}

export const ordersApi = {
  create: (input: CreateOrderInput) => api<Order>('/orders', { method: 'POST', body: input }),
  mine: () => api<Order[]>('/orders/me'),
}

export const adminApi = {
  stats: () => api<AdminStats>('/admin/stats'),
  products: () => api<Product[]>('/admin/products'),
  createProduct: (input: ProductInput) =>
    api<Product>('/admin/products', { method: 'POST', body: input }),
  updateProduct: (id: string, input: ProductInput) =>
    api<Product>(`/admin/products/${id}`, { method: 'PUT', body: input }),
  deleteProduct: (id: string) => api<void>(`/admin/products/${id}`, { method: 'DELETE' }),
  orders: (status?: OrderStatus) => api<Order[]>('/admin/orders', { query: { status } }),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    api<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
}
