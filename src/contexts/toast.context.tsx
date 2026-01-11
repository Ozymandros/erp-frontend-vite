import React, { createContext, useContext, useCallback, useEffect, useMemo, useReducer } from 'react'
// lightweight id generator to avoid adding a runtime dependency
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
import { getApiClient } from '@/api/clients'
import { registerToastApi } from './toast.service'
import { Toaster } from '@/components/ui/toaster'
import type { ToastOptions, ToastItem } from './toast.types'

type State = ToastItem[]

type Action =
  | { type: 'add'; toast: ToastItem }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      // keep newest at the end
      return [...state, action.toast]
    case 'remove':
      return state.filter((t) => t.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

export interface ToastApi {
  show: (opts: ToastOptions) => string
  success: (title: string, description?: string, opts?: Partial<ToastOptions>) => string
  error: (title: string, description?: string, opts?: Partial<ToastOptions>) => string
  info: (title: string, description?: string, opts?: Partial<ToastOptions>) => string
  warning: (title: string, description?: string, opts?: Partial<ToastOptions>) => string
  dismiss: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastApi | null>(null)

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastContextProvider')
  return ctx
}

export const ToastContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, [])

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? genId()
    const toast: ToastItem = {
      id,
      title: opts.title,
      description: opts.description,
      type: opts.type ?? 'info',
      duration: opts.duration,
    }
    dispatch({ type: 'add', toast })
    return id
  }, [])

  const dismiss = useCallback((id: string) => dispatch({ type: 'remove', id }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const api: ToastApi = useMemo(() => ({
    show,
    success: (title, description, opts) => show({ title, description, type: 'success', ...opts }),
    error: (title, description, opts) => show({ title, description, type: 'error', ...opts }),
    info: (title, description, opts) => show({ title, description, type: 'info', ...opts }),
    warning: (title, description, opts) => show({ title, description, type: 'warning', ...opts }),
    dismiss,
    clear,
  }), [show, dismiss, clear])

  // Wire API client proxy error handling: when the app provider mounts, attach a handler
  useEffect(() => {
    // register this provider's API for use by non-react modules (api clients)
    registerToastApi(api)

    try {
      const client = getApiClient()
      if (client) {
        // Don't override existing onError if consumer set it; wrap it to also show toast
        const prev = client.onError
        client.onError = (err: any) => {
          try {
            // api error shape expected: ApiClientError with message and status
            const message = err?.message ?? 'An error occurred'
            const status = err?.status
            // show a friendly toast for network/errors
            api.error(
              status ? `Error ${status}` : 'Error',
              typeof message === 'string' ? message : JSON.stringify(message),
            )
          } catch (e) {
            // ignore toast errors
          }
          if (typeof prev === 'function') {
            try {
              prev(err)
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      // if api client not available, skip
    }

    return () => {
      registerToastApi(null)
    }
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={state} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export default ToastContextProvider
