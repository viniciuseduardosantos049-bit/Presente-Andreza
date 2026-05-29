# DevOps & Infra Reference

## Docker

### Dockerfile Node.js (multi-stage, produção)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Dockerfile Next.js (standalone output)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose (dev stack completo)
```yaml
# docker-compose.yml
version: '3.9'
services:
  api:
    build: .
    ports: ['3000:3000']
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on: [db, redis]
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ['5432:5432']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  pgdata:
```

---

## GitHub Actions

### CI — lint, test, build
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - run: npm run build
```

### Deploy para Vercel (Next.js)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## .env e segurança

### .env.example (sempre commitar, nunca o .env real)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=mude-para-uma-chave-secreta-com-32-chars-minimo
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
```

### .gitignore essencial
```
.env
.env.local
.env.production
node_modules/
dist/
.next/
*.log
```

---

## Scripts package.json recomendados

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

---

## tsconfig.json (Node.js strict)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no ambiente de produção
- [ ] Secrets não expostos no código ou logs
- [ ] HTTPS habilitado
- [ ] CORS configurado para domínios corretos
- [ ] Rate limiting ativado nas APIs públicas
- [ ] Health check endpoint (`GET /health`) disponível
- [ ] Migrations de banco de dados executadas
- [ ] Logs estruturados (JSON) configurados
- [ ] Monitoramento de erros ativo (Sentry, etc.)
- [ ] Backup de banco de dados agendado
