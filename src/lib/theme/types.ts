export type Theme = 'light' | 'dark'

export const THEMES: readonly Theme[] = ['light', 'dark'] as const
export const DEFAULT_THEME: Theme = 'light'
