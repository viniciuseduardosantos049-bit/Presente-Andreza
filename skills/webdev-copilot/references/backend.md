# Backend Reference

## Express + TypeScript

### Setup base com middlewares
```ts
// src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middlewares/errorHandler'
import { userRouter } from './routes/users'

export const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/users', userRouter)

app.use(errorHandler) // sempre por último
```

### Middleware de erro centralizado
```ts
// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public message: string, public statusCode = 500, public code?: string) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code }
    })
  }

  console.error(err)
  res.status(500).json({ error: { message: 'Erro interno' } })
}
```

### Controller padrão
```ts
// src/controllers/users.ts
import { RequestHandler } from 'express'
import { z } from 'zod'
import { AppError } from '../middlewares/errorHandler'
import { userService } from '../services/userService'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Dados inválidos', 400)
    }

    const user = await userService.create(parsed.data)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}
```

---

## Fastify (alternativa performática)

```ts
import Fastify from 'fastify'
import { z } from 'zod'

const app = Fastify({ logger: true })

const bodySchema = z.object({ name: z.string(), email: z.string().email() })

app.post('/users', async (request, reply) => {
  const body = bodySchema.parse(request.body)
  // ... lógica
  return reply.code(201).send({ id: 1, ...body })
})

app.listen({ port: 3000 }, (err) => {
  if (err) { app.log.error(err); process.exit(1) }
})
```

---

## NestJS

### Module + Controller + Service
```ts
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// users.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneOrFail(id)
  }
}
```

---

## Banco de Dados

### Prisma ORM
```ts
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Uso no service
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findUserWithPosts(id: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    include: { posts: { orderBy: { createdAt: 'desc' }, take: 10 } },
  })
}
```

### Redis (cache)
```ts
import { createClient } from 'redis'

const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

// Cachear resultado por 5 minutos
async function getCachedUser(id: string) {
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)

  const user = await db.findUser(id)
  await redis.setEx(`user:${id}`, 300, JSON.stringify(user))
  return user
}
```

---

## Autenticação JWT

```ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 12

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function generateToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
}

// Middleware Express
export const authenticate: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = verifyToken(auth.slice(7))
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}
```

---

## Variáveis de Ambiente

```ts
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten())
  process.exit(1)
}

export const env = parsed.data
```

---

## Testes Backend (Vitest / Jest)

```ts
import { describe, it, expect, vi } from 'vitest'
import { createUser } from '../services/userService'
import { prisma } from '../lib/prisma'

vi.mock('../lib/prisma', () => ({
  prisma: { user: { create: vi.fn(), findUnique: vi.fn() } }
}))

describe('userService.createUser', () => {
  it('cria usuário com sucesso', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' }
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

    const result = await createUser({ email: 'test@test.com', name: 'Test', password: '12345678' })
    expect(result.email).toBe('test@test.com')
  })

  it('lança erro para email duplicado', async () => {
    vi.mocked(prisma.user.create).mockRejectedValue({ code: 'P2002' })
    await expect(createUser({ email: 'dup@test.com', name: 'X', password: '12345678' }))
      .rejects.toThrow('E-mail já cadastrado')
  })
})
```
