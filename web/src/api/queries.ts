import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, catalogApi, ordersApi } from './endpoints'
import type { OrderStatus, ProductInput, ProductQuery } from './types'

export const queryKeys = {
  categories: ['categories'] as const,
  products: (q: ProductQuery) => ['products', q] as const,
  product: (slug: string) => ['product', slug] as const,
  myOrders: ['orders', 'me'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminProducts: ['admin', 'products'] as const,
  adminOrders: (status?: OrderStatus) => ['admin', 'orders', status ?? 'all'] as const,
}

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: catalogApi.categories, staleTime: Infinity })

export const useProducts = (q: ProductQuery = {}) =>
  useQuery({ queryKey: queryKeys.products(q), queryFn: () => catalogApi.products(q) })

export const useProduct = (slug: string) =>
  useQuery({ queryKey: queryKeys.product(slug), queryFn: () => catalogApi.product(slug) })

export const useMyOrders = () => useQuery({ queryKey: queryKeys.myOrders, queryFn: ordersApi.mine })

export const useAdminStats = () =>
  useQuery({ queryKey: queryKeys.adminStats, queryFn: adminApi.stats })

export const useAdminProducts = () =>
  useQuery({ queryKey: queryKeys.adminProducts, queryFn: adminApi.products })

export const useAdminOrders = (status?: OrderStatus) =>
  useQuery({ queryKey: queryKeys.adminOrders(status), queryFn: () => adminApi.orders(status) })

/** Qualquer mudança no catálogo invalida as listas públicas e as do admin. */
function useInvalidateCatalog() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: ['product'] })
    qc.invalidateQueries({ queryKey: queryKeys.adminProducts })
  }
}

export function useSaveProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProductInput }) =>
      id ? adminApi.updateProduct(id, input) : adminApi.createProduct(input),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({ mutationFn: adminApi.deleteProduct, onSuccess: invalidate })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: queryKeys.myOrders })
    },
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myOrders })
      qc.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}
