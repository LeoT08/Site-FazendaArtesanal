# Fazenda Artesanal (web)

Loja de tortas e massas artesanais: catálogo, sacola, checkout com agendamento, conta do cliente e painel administrativo. Projeto de portfólio.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, TanStack Query, Zustand, React Hook Form + Zod, MSW (API simulada), Vitest.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes (Vitest + MSW em Node)
npm run lint
npm run build      # gera dist/
npm run preview    # serve o build
```

Contas de demonstração (API fictícia):

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | cliente@fazenda.dev | cliente123 |
| Admin | admin@fazenda.dev | admin123 |

## API

Sem back-end por enquanto: o [MSW](https://mswjs.io) intercepta as chamadas a `/api/*` no navegador e responde a partir de um banco em memória salvo no `localStorage` (`fa:mockdb`). Para zerar os dados, apague essa chave.

O contrato que a API real precisa seguir está em [`docs/api.md`](docs/api.md) e [`docs/openapi.yaml`](docs/openapi.yaml). Para apontar para ela:

```bash
# .env
VITE_API_URL=https://api.seudominio.com
VITE_USE_MOCKS=false
```

## Publicando por FTP

1. `npm run build`
2. Envie **o conteúdo** de `dist/` (não a pasta) para a raiz do site (`public_html`, `www`…).
3. Confira se o `.htaccess` subiu (o FileZilla pode esconder arquivos que começam com ponto: menu Servidor, Forçar exibição de arquivos ocultos).

O `.htaccess` faz as rotas da SPA funcionarem no Apache e pede para não indexar. O `robots.txt` e a meta `noindex` reforçam isso.

O site precisa de **HTTPS**: a API fictícia roda num service worker, que o navegador só ativa em conexão segura (ou em localhost).
