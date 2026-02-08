export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  id?: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number // milliseconds
}

export interface ToastItem extends Required<Pick<ToastOptions, 'id' | 'type'>> {
  title?: string
  description?: string
  duration?: number
}
