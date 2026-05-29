# Performance Frontend

## Core Web Vitals — Metas

| Métrica | Bom | Ruim | O que afeta |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | > 4s | Imagens hero, fontes, SSR |
| FID / INP (Interaction to Next Paint) | ≤ 200ms | > 500ms | JS pesado no main thread |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | > 0.25 | Imagens sem dimensão, fontes |
| FCP (First Contentful Paint) | ≤ 1.8s | > 3s | Render blocking resources |
| TTFB (Time to First Byte) | ≤ 800ms | > 1.8s | Servidor, CDN, cache |

---

## Imagens

```tsx
// Next.js — sempre use next/image
import Image from 'next/image'

// ✅ LCP hero — priority para a maior imagem acima da dobra
<Image src="/hero.webp" alt="..." width={1200} height={600} priority />

// ✅ Galeria — lazy loading (padrão)
<Image src={item.src} alt={item.alt} width={400} height={300} />

// ✅ Imagens com aspecto dinâmico
<div className="relative aspect-video">
  <Image src={src} alt={alt} fill className="object-cover rounded-lg" sizes="(max-width: 768px) 100vw, 50vw" />
</div>
```

```tsx
// Fora do Next.js — sempre defina dimensões para evitar CLS
<img
  src={src}
  alt={alt}
  width={400}
  height={300}
  loading="lazy"
  decoding="async"
  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
/>
```

---

## Code Splitting

```tsx
import { lazy, Suspense } from 'react'

// Lazy loading por rota / componente pesado
const HeavyChart = lazy(() => import('./HeavyChart'))
const AdminPanel = lazy(() => import('./AdminPanel'))

// Com fallback adequado
function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}

// Next.js — dynamic import com SSR opcional
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})
```

---

## Evitar Re-renders Desnecessários

```tsx
import { memo, useMemo, useCallback } from 'react'

// memo: re-render apenas quando props mudam
const UserCard = memo(function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>
})

// useMemo: computação cara
function ProductList({ products, category }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.category === category),
    [products, category]
  )
  return <>{filtered.map(p => <ProductCard key={p.id} product={p} />)}</>
}

// useCallback: funções passadas como props para componentes memo
function Parent() {
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => setCount(c => c + 1), []) // deps vazias = estável
  return <MemoizedChild onClick={handleClick} />
}

// ⚠️ Não abuse: medir antes de otimizar com React DevTools Profiler
```

---

## Virtualização de Listas Longas

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // altura estimada de cada item em px
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }} className="relative">
        {virtualizer.getVirtualItems().map(vItem => (
          <div
            key={vItem.key}
            data-index={vItem.index}
            ref={virtualizer.measureElement}
            style={{ transform: `translateY(${vItem.start}px)` }}
            className="absolute inset-x-0 px-4 py-3 border-b"
          >
            {items[vItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Fontes — Sem Layout Shift

```tsx
// Next.js — font subsetting automático
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

// layout.tsx
<html className={`${inter.variable} ${playfair.variable}`}>
```

```css
/* Fallback com size-adjust para reduzir CLS */
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

---

## Prefetch e Cache

```tsx
// Next.js Link pré-faz prefetch automático em viewport
import Link from 'next/link'
<Link href="/produto/123" prefetch>Ver produto</Link>

// React Query — stale time para evitar refetch desnecessário
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 min em cache
  gcTime: 10 * 60 * 1000,   // 10 min antes de GC
})

// SWR
const { data } = useSWR('/api/users', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
})
```

---

## Bundle Analysis

```bash
# Next.js
npm install @next/bundle-analyzer
ANALYZE=true npm run build

# Vite
npm install rollup-plugin-visualizer
# vite.config.ts: plugins: [visualizer({ open: true })]
```

**Sinais de problema:**
- Chunk > 500KB não dividido
- Biblioteca inteira importada quando só parte é usada
- Polyfills desnecessários para browsers modernos
- `moment.js` (use `date-fns` ou `dayjs`)
- `lodash` inteiro (use importações específicas ou `lodash-es`)
