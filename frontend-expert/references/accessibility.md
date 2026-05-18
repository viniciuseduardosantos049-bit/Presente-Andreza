# Acessibilidade — WCAG 2.1 AA

## Checklist rápida por componente

| Componente | Requisitos |
|---|---|
| Button | `type`, foco visível, texto ou `aria-label` |
| Link | Destino descritivo, nunca "clique aqui" |
| Input | `<label>` associado ou `aria-label`, erro com `aria-describedby` |
| Modal | `role="dialog"`, `aria-modal`, foco preso, fecha com Esc |
| Dropdown | `role="listbox"` ou `role="menu"`, navegação por teclado |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Toast | `role="status"` ou `role="alert"` (live region) |
| Loader | `aria-busy`, spinner com `aria-label`, `role="status"` |
| Imagem | `alt` descritivo; decorativas: `alt=""` + `role="presentation"` |

---

## Focus Management

```tsx
import { useRef, useEffect } from 'react'

// Trap focus dentro de modal
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }, [active])

  return containerRef
}

// Restaurar foco ao fechar modal
export function useFocusRestore(open: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
    } else {
      triggerRef.current?.focus()
    }
  }, [open])
}
```

---

## Live Regions (Toast / Alerts)

```tsx
// Anúncio acessível sem popup visual
export function ScreenReaderOnly({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Alert urgente
export function Alert({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="assertive" aria-atomic="true"
      className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 flex gap-2"
    >
      <span aria-hidden>⚠️</span>
      {message}
    </div>
  )
}
```

---

## Formulários Acessíveis

```tsx
interface FieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  children: React.ReactElement
}

export function Field({ id, label, error, required, children }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {required && <span aria-hidden className="text-red-500 ml-0.5">*</span>}
        {required && <span className="sr-only">(obrigatório)</span>}
      </label>

      {React.cloneElement(children, {
        id,
        'aria-describedby': error ? errorId : undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required,
      })}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## Skip to Content

```tsx
// Sempre o primeiro elemento do <body>
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg focus:shadow-lg"
    >
      Pular para o conteúdo principal
    </a>
  )
}
// No layout: <main id="main-content" tabIndex={-1}>
```

---

## Contraste e Cores

```ts
// Verificar contraste programaticamente (WCAG AA = 4.5:1 texto normal, 3:1 texto grande)
function getLuminance(hex: string) {
  const rgb = parseInt(hex.slice(1), 16)
  const r = (rgb >> 16) / 255, g = ((rgb >> 8) & 0xff) / 255, b = (rgb & 0xff) / 255
  const [rs, gs, bs] = [r, g, b].map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(hex1: string, hex2: string) {
  const l1 = getLuminance(hex1), l2 = getLuminance(hex2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
// getContrastRatio('#1d4ed8', '#ffffff') → ~7.2 ✅
```

---

## Teclado — Padrões de navegação

| Widget | Enter/Space | Arrows | Esc |
|---|---|---|---|
| Button | Ativa | — | — |
| Select/Listbox | Abre/seleciona | Navega opções | Fecha |
| Menu | Abre / seleciona item | Navega itens | Fecha |
| Dialog | — | — | Fecha |
| Tabs | Ativa tab | Muda tab ativa | — |
| Combobox | Seleciona / confirma | Navega sugestões | Fecha lista |
