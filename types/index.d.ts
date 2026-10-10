export type Translation = {
  language: string
  text: string
  status: 'translating' | 'done' | 'error'
}

declare module 'claude-code' {
  interface PluginState {
    'translate-output': { language: string | null; latest: Translation | null }
  }
}
