import { create } from 'zustand'

export type AppTheme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'synth:theme'
let mediaListenerBound = false

function readInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
    return 'light'
  } catch {
    return 'light'
  }
}

function resolveTheme(theme: AppTheme): 'light' | 'dark' {
  if (theme === 'dark' || theme === 'light') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(theme)
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)
  document.documentElement.setAttribute('data-theme', resolved)
}

type ThemeState = {
  theme: AppTheme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: AppTheme) => void
  setThemeChoice: (theme: AppTheme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitialTheme(),
  resolvedTheme: resolveTheme(readInitialTheme()),
  setTheme: (theme) => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore private mode quota errors
    }
    set({ theme, resolvedTheme: resolveTheme(theme) })
  },
  setThemeChoice: (theme) => get().setTheme(theme),
  toggleTheme: () => {
    const next = get().resolvedTheme === 'light' ? 'dark' : 'light'
    get().setTheme(next)
  },
}))

// Keep this available for startup sync before route render.
export function syncThemeToDom() {
  const { theme } = useThemeStore.getState()
  applyTheme(theme)
  useThemeStore.setState({ resolvedTheme: resolveTheme(theme) })

  if (typeof window === 'undefined' || mediaListenerBound) return
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    const current = useThemeStore.getState().theme
    if (current !== 'system') return
    applyTheme('system')
    useThemeStore.setState({ resolvedTheme: resolveTheme('system') })
  }
  media.addEventListener('change', onChange)
  mediaListenerBound = true
}

