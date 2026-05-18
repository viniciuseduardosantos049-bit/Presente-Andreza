# Testes Frontend

## Testing Library — Filosofia

> "Quanto mais seus testes se parecem com a forma como o software é usado, mais confiança eles darão."

**Regras de ouro:**
- Prefira queries por role, label, ou texto visível — não por `data-testid` ou classe CSS
- Não teste implementação (estado interno, refs) — teste comportamento visível
- Use `userEvent` (v14) em vez de `fireEvent` para interações realistas

---

## Setup com Vitest

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})

// src/test/setup.ts
import '@testing-library/jest-dom'
```

---

## Testes de Componente

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza com texto', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('chama onClick ao clicar', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Salvar</Button>)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('não chama onClick quando disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Salvar</Button>)
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('exibe spinner quando loading', () => {
    render(<Button loading>Salvar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })
})
```

---

## Testes de Formulário

```tsx
// LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('exibe erros de validação ao submeter vazio', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument()
    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
  })

  it('chama onSubmit com dados corretos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/e-mail/i), 'user@test.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'user@test.com', password: 'senha1234' })
    })
  })
})
```

---

## Testes de Custom Hook

```tsx
// useFetch.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from './useFetch'

global.fetch = vi.fn()

describe('useFetch', () => {
  it('retorna dados após fetch bem-sucedido', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: 'Test' }), { status: 200 })
    )
    const { result } = renderHook(() => useFetch<{ id: number; name: string }>('/api/test'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ id: 1, name: 'Test' })
    expect(result.current.error).toBeNull()
  })

  it('retorna erro em falha HTTP', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))
    const { result } = renderHook(() => useFetch('/api/test'))
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
  })
})
```

---

## Playwright — Testes E2E

```ts
// tests/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('user@test.com')
    await page.getByLabel('Senha').fill('senha1234')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('exibe erro para credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('wrong@test.com')
    await page.getByLabel('Senha').fill('errado123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toContainText('Credenciais inválidas')
  })
})
```

---

## Storybook 8

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
} satisfies Meta<typeof Button>
export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { children: 'Botão Primário', variant: 'primary' } }
export const Loading: Story = { args: { children: 'Carregando', loading: true } }
export const Disabled: Story = { args: { children: 'Desabilitado', disabled: true } }
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {(['primary', 'secondary', 'ghost', 'danger', 'outline'] as const).map(v => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
}
```
