# Componentes React — Padrões Avançados

## API de Props com TypeScript

```tsx
// ✅ Props bem tipadas com variantes e polimorfismo
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'

const buttonVariants = cva(
  // base
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
        ghost:     'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-400',
        danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        outline:   'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-400',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner className="size-4" aria-hidden />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```

---

## Padrão Compound Component

```tsx
// Exemplo: Tabs acessível e composable
import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabsCtx { active: string; setActive: (id: string) => void }
const TabsContext = createContext<TabsCtx | null>(null)
const useTabs = () => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('useTabs deve ser usado dentro de <Tabs>')
  return ctx
}

interface TabsProps { defaultTab: string; children: ReactNode }
export function Tabs({ defaultTab, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex border-b">{children}</div>
}

export function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs()
  const isActive = active === id
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActive(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
        ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </button>
  )
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs()
  if (active !== id) return null
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="pt-4">
      {children}
    </div>
  )
}

// Uso:
// <Tabs defaultTab="overview">
//   <TabList>
//     <Tab id="overview">Visão Geral</Tab>
//     <Tab id="details">Detalhes</Tab>
//   </TabList>
//   <TabPanel id="overview"><Overview /></TabPanel>
//   <TabPanel id="details"><Details /></TabPanel>
// </Tabs>
```

---

## Padrão Render Props / Slot (asChild)

```tsx
import { Slot } from '@radix-ui/react-slot'

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean
}

// Permite: <Card asChild><a href="/post">...</a></Card>
export function Card({ asChild, className, ...props }: CardProps) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      className={cn('rounded-xl border bg-white p-6 shadow-sm', className)}
      {...props}
    />
  )
}
```

---

## Data Display: Table com sorting e loading state

```tsx
import { useState } from 'react'

type SortDir = 'asc' | 'desc' | null
interface Column<T> { key: keyof T; label: string; sortable?: boolean }

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading,
}: {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
}) {
  const [sort, setSort] = useState<{ key: keyof T; dir: SortDir }>({ key: columns[0].key, dir: null })

  const sorted = [...data].sort((a, b) => {
    if (!sort.dir) return 0
    const va = String(a[sort.key]), vb = String(b[sort.key])
    return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-medium"
                aria-sort={sort.key === col.key ? (sort.dir ?? 'none') : undefined}
              >
                {col.sortable ? (
                  <button
                    onClick={() =>
                      setSort(s =>
                        s.key === col.key
                          ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : s.dir === 'desc' ? null : 'asc' }
                          : { key: col.key, dir: 'asc' }
                      )
                    }
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {col.label}
                    <SortIcon dir={sort.key === col.key ? sort.dir : null} />
                  </button>
                ) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                      {String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Modal acessível com Radix UI

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-gray-500">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button aria-label="Fechar" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

---

## Skeleton / Loading State

```tsx
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
}

// Uso:
export function UserCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
```

---

## Infinite Scroll com Intersection Observer

```tsx
import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node || !hasMore) return

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) onLoadMore()
    }, { threshold: 0.1 })

    observerRef.current.observe(node)
  }, [onLoadMore, hasMore])

  return sentinelRef
}

// Uso:
// const sentinel = useInfiniteScroll(fetchNextPage, hasNextPage)
// ...
// <div ref={sentinel} className="h-1" aria-hidden />
```
