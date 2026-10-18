# Contrato da API

O front-end consome esta API em `${VITE_API_URL}/api`. Hoje ela é simulada no navegador pelo MSW (`src/mocks/`). Para trocar pela API real, basta implementar estas rotas e configurar:

```
VITE_API_URL=https://api.seudominio.com
VITE_USE_MOCKS=false
```

Os tipos TypeScript de cada payload ficam em `src/api/types.ts`, e a especificação OpenAPI em `docs/openapi.yaml`. O comportamento de referência (validações, códigos de erro) está nos handlers em `src/mocks/handlers/`.

## Convenções

- JSON em requisição e resposta. Datas e horas em ISO 8601 (`2026-10-18T14:00:00.000Z`); datas sem hora em `YYYY-MM-DD`.
- **Preços em centavos** (inteiro): `priceCents: 11900` = R$ 119,00.
- IDs são strings opacas (o mock usa `prd_xxx`, `ord_xxx`, `usr_xxx`; pode ser UUID).
- Autenticação: `Authorization: Bearer <token>`. O front só guarda e reenvia o token; o formato é livre (o mock gera um JWT sem assinatura com `sub`, `role` e `exp`).
- Ao receber `401` de uma rota autenticada, o front encerra a sessão e manda o usuário para o login.
- CORS: se a API estiver em outro domínio, liberar a origem do site e o header `Authorization`.

### Formato de erro

Toda resposta de erro (4xx/5xx) segue:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Confira os campos destacados.",
    "fields": { "email": "Informe um e-mail válido." }
  }
}
```

`message` é exibida ao usuário, então deve estar em português. `fields` é opcional; quando existe, cada chave aparece embaixo do campo correspondente do formulário (caminhos aninhados usam ponto, como `address.zip`).

| Status | `code` usados | Quando |
|---|---|---|
| 401 | `UNAUTHENTICATED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` | Sem token, token inválido/expirado, login errado |
| 403 | `FORBIDDEN` | Cliente acessando rota de admin |
| 404 | `NOT_FOUND` | Recurso não existe |
| 409 | `EMAIL_TAKEN` | Cadastro com e-mail já usado |
| 422 | `VALIDATION_ERROR`, `EMPTY_ORDER`, `PRODUCT_UNAVAILABLE`, `INVALID_QUANTITY`, `INVALID_STATUS` | Dados inválidos |

## Autenticação

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `200 { token, user }` |
| POST | `/auth/register` | `{ name, email, phone?, password }` | `201 { token, user }` |
| GET | `/auth/me` | | `200 User` |

`User`: `{ id, name, email, phone, role: "customer" | "admin", createdAt }`. Nunca devolver a senha. Cadastro sempre cria `customer`. Senha com pelo menos 6 caracteres.

## Catálogo (público)

| Método | Rota | Resposta |
|---|---|---|
| GET | `/categories` | `200 Category[]` |
| GET | `/products?category=&q=&sort=&featured=` | `200 Product[]` |
| GET | `/products/:slug` | `200 Product` ou `404` |

- Rotas públicas devolvem só produtos com `available: true`.
- `category`: `tortas` ou `massas`.
- `q`: busca em nome, resumo e ingredientes, sem diferenciar acentos nem maiúsculas.
- `sort`: `featured` (padrão, destaques primeiro), `price-asc`, `price-desc`, `name`.
- `featured=true`: só destaques (usado na home).

`Product`: `{ id, slug, name, category, summary, description, priceCents, image, ingredients: string[], serves, preparation, leadTimeDays, featured, available }`.

## Pedidos (cliente autenticado)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/orders` | `CreateOrderInput` | `201 Order` |
| GET | `/orders/me` | | `200 Order[]` (mais recentes primeiro) |

```json
{
  "items": [{ "productId": "prd_caramelle", "quantity": 2 }],
  "fulfillment": "delivery",
  "address": { "street": "Rua A", "number": "10", "district": "Centro", "city": "Cotia", "zip": "06700-000", "complement": "" },
  "scheduledFor": "2026-10-21",
  "notes": "Sem cebola"
}
```

Regras que o servidor deve validar (o front valida as mesmas, mas não é fonte de verdade):

- Pelo menos 1 item; quantidade inteira entre 1 e 20; produto existente e disponível.
- **Preço vem do banco**, nunca do cliente. O pedido guarda `unitPriceCents` e `name` do momento da compra.
- `scheduledFor` respeita a maior `leadTimeDays` entre os itens e não cai em domingo nem segunda.
- `delivery` exige `address` completo (exceto `complement`) e cobra `deliveryFeeCents = 1500`; `pickup` tem taxa 0.
- Pedido nasce com `status: "received"` e `code` legível e sequencial (`FA-1101`).

`Order`: `{ id, code, userId, customerName, items: [{ productId, name, unitPriceCents, quantity }], fulfillment, address | null, scheduledFor, notes, subtotalCents, deliveryFeeCents, totalCents, status, createdAt }`.

`status`: `received` → `preparing` → `ready` → `completed`, ou `cancelled`.

## Admin (`role: "admin"`)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/admin/stats` | | `200 AdminStats` |
| GET | `/admin/products` | | `200 Product[]` (inclui indisponíveis) |
| POST | `/admin/products` | `ProductInput` | `201 Product` |
| PUT | `/admin/products/:id` | `ProductInput` | `200 Product` |
| DELETE | `/admin/products/:id` | | `204` |
| GET | `/admin/orders?status=` | | `200 Order[]` |
| PATCH | `/admin/orders/:id/status` | `{ status }` | `200 Order` |

- `ProductInput` é `Product` sem `id`. `slug` é único e só aceita `[a-z0-9-]`.
- `AdminStats`: `{ ordersToday, revenueTodayCents, pendingOrders, revenueLast7Days: [{ date, totalCents }] (7 itens, do mais antigo para hoje), topProducts: [{ productId, name, quantity }] (até 5) }`. Pedidos cancelados não entram no faturamento; `pendingOrders` conta `received`, `preparing` e `ready`.

## Sugestão de modelo de dados

```
users       (id, name, email UNIQUE, phone, password_hash, role, created_at)
categories  (slug PK, name, description)
products    (id, slug UNIQUE, name, category_slug FK, summary, description, price_cents,
             image, ingredients JSON/TEXT[], serves, preparation, lead_time_days,
             featured, available)
orders      (id, code UNIQUE, user_id FK, fulfillment, address JSON NULL, scheduled_for DATE,
             notes, subtotal_cents, delivery_fee_cents, total_cents, status, created_at)
order_items (order_id FK, product_id FK, name, unit_price_cents, quantity)
```
