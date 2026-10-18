import type { Category, Order, Product } from '@/api/types'
import { seedCategories, seedOrders, seedProducts, seedUsers, type UserRecord } from './seed'

// "Banco" da API fictícia: tabelas em memória, salvas no localStorage para sobreviver ao F5.
// Para zerar: localStorage.removeItem('fa:mockdb') ou resetDb().

const STORAGE_KEY = 'fa:mockdb'
const VERSION = 1

interface Tables {
  version: number
  users: UserRecord[]
  categories: Category[]
  products: Product[]
  orders: Order[]
  orderSeq: number
}

function fresh(): Tables {
  return {
    version: VERSION,
    users: structuredClone(seedUsers),
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    orders: seedOrders(),
    orderSeq: 1100,
  }
}

function load(): Tables {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Tables
      if (parsed.version === VERSION) return parsed
    }
  } catch {
    // localStorage indisponível ou corrompido: começa do seed
  }
  return fresh()
}

export const db: Tables = load()

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // sem persistência; segue em memória
  }
}

export function resetDb() {
  Object.assign(db, fresh())
  persist()
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
