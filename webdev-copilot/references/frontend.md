# Frontend Reference

## React + TypeScript

### Componente funcional padrão
```tsx
import { useState, useCallback } from 'react'

interface Props {
  title: string
  onSubmit: (value: string) => void
}

export function MyComponent({ title, onSubmit }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return
    onSubmit(value)
    setValue('')
  }, [value, onSubmit])

  return (
    <div>
      <h2>{title}</h2>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        aria-label={title}
      />
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  )
}
```

### Custom Hook
```ts
import { useState, useEffect } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<T>
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}
```

---

## Next.js 14+ (App Router)

### Server Component com fetch
```tsx
// app/posts/page.tsx
import { PostCard } from '@/components/PostCard'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // ISR: revalida a cada 60s
  })
  if (!res.ok) throw new Error('Falha ao buscar posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <main>
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  )
}
```

### Route Handler (API Route)
```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 })
  }

  // ... salvar no banco
  return NextResponse.json({ success: true }, { status: 201 })
}
```

---

## Tailwind CSS

### Padrões de componentes
```tsx
// Botão com variantes
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
```

---

## Formulários com React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // chamada à API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('password')} type="password" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

---

## Estado Global com Zustand

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

---

## Acessibilidade

- Sempre use `aria-label` em ícones sem texto
- Use `role` semântico: `role="dialog"`, `role="alert"`, `role="navigation"`
- Foco visível: nunca remova `outline` sem alternativa
- Ordem de foco lógica no DOM
- `<img>` sempre com `alt` descritivo
- Contraste mínimo 4.5:1 para texto normal

---

## Performance Frontend

- `React.memo` para componentes pesados sem props mutáveis
- `useMemo` / `useCallback` apenas quando há custo real
- `React.lazy` + `Suspense` para code splitting por rota
- `next/image` para imagens otimizadas no Next.js
- `loading="lazy"` em `<img>` fora do viewport
- Bundle analysis: `next build --analyze` ou `webpack-bundle-analyzer`
