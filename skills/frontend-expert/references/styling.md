# Estilização Avançada

## Tailwind CSS — Padrões Profissionais

### Design Tokens via CSS Variables
```css
/* globals.css */
@layer base {
  :root {
    --color-bg: 0 0% 100%;
    --color-fg: 222 47% 11%;
    --color-muted: 215 16% 47%;
    --color-border: 214 32% 91%;
    --color-primary: 221 83% 53%;
    --color-primary-fg: 0 0% 100%;
    --color-destructive: 0 84% 60%;

    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
  }

  .dark {
    --color-bg: 222 47% 8%;
    --color-fg: 210 40% 98%;
    --color-muted: 215 20% 65%;
    --color-border: 217 33% 17%;
    --color-primary: 217 91% 60%;
  }
}
```

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--color-bg) / <alpha-value>)',
        fg: 'hsl(var(--color-fg) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          fg: 'hsl(var(--color-primary-fg) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
} satisfies Config
```

---

## Dark Mode com next-themes

```tsx
// providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// ThemeToggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
      className="rounded-lg p-2 text-muted hover:bg-border transition-colors"
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
```

---

## Animações CSS — Micro-interações

### Keyframes customizados no Tailwind
```js
// tailwind.config.ts — extend animations
keyframes: {
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(8px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-in-right': {
    '0%': { opacity: '0', transform: 'translateX(16px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  'scale-in': {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
},
animation: {
  'fade-in': 'fade-in 0.2s ease-out',
  'slide-in-right': 'slide-in-right 0.2s ease-out',
  'scale-in': 'scale-in 0.15s ease-out',
  shimmer: 'shimmer 1.5s infinite linear',
},
```

### Respeitar prefers-reduced-motion
```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Hook para checar
import { useEffect, useState } from 'react'
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
```

---

## Framer Motion — Animações declarativas

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Entrada suave com stagger em lista
export function AnimatedList({ items }: { items: string[] }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          }}
          className="py-2 border-b last:border-0"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

// AnimatePresence para unmount com animação
export function Notification({ show, message }: { show: boolean; message: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Layout animation (reordenação suave de listas)
export function SortableList({ items }: { items: { id: string; label: string }[] }) {
  return (
    <ul>
      {items.map(item => (
        <motion.li key={item.id} layout transition={{ duration: 0.2, ease: 'easeOut' }}>
          {item.label}
        </motion.li>
      ))}
    </ul>
  )
}
```

---

## CSS Grid — Layouts Avançados

```tsx
// Masonry-like com CSS Grid
function MasonryGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gridAutoRows: 'masonry', // Chrome com flag; fallback abaixo
      }}
    >
      {children}
    </div>
  )
}

// Holy Grail layout responsivo
// grid-cols: [sidebar] [main] | no mobile: [main]
const layout = `
  grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_200px]
  min-h-screen gap-0
`
```

---

## Shimmer / Skeleton avançado

```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--color-border)) 25%,
    hsl(var(--color-bg)) 50%,
    hsl(var(--color-border)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Scroll suave e snapping

```css
/* Scroll snap horizontal (carrossel sem JS) */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.carousel > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```
