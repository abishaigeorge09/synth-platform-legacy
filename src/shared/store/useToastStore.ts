import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  kind: ToastKind
  message: string
  createdAt: number
}

type ToastState = {
  toasts: ToastItem[]
  push: (message: string, kind?: ToastKind) => void
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = 'info') =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`, kind, message, createdAt: Date.now() },
      ],
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

// Lightweight helper used across the demo UI. A proper ToastContainer can subscribe later.
export function toast(message: string, kind: ToastKind = 'info') {
  try {
    useToastStore.getState().push(message, kind)
  } catch {
    // eslint-disable-next-line no-console
    console.log(`[toast:${kind}]`, message)
  }
}

