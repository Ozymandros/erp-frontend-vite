import type { ToastApi } from './toast.context'

let _toastApi: ToastApi | null = null

type Queued = { method: keyof Omit<ToastApi, 'show' | 'dismiss' | 'clear'>; args: any[] }
const _queue: Queued[] = []

export function registerToastApi(api: ToastApi | null) {
  _toastApi = api
  if (api) {
    console.debug('[ToastService] registering toast API and flushing queue', _queue.length)
    try {
      // expose for debugging in dev only
      ;(globalThis as any).__TOAST_API = api
    } catch (e) {}
    // flush queue
    while (_queue.length) {
      const item = _queue.shift()!
      try {
        // @ts-ignore safe dynamic call
        (api as any)[item.method](...item.args)
      } catch (e) {
        // ignore
      }
    }
  }
  if (!api) {
    try {
      delete (globalThis as any).__TOAST_API
    } catch (e) {}
  }
}

export function getToastApi(): ToastApi | null {
  return _toastApi
}

// convenience helpers that will queue if provider not ready
function enqueue(method: Queued['method'], ...args: any[]) {
  if (_toastApi) {
    try {
      // @ts-ignore
      (_toastApi as any)[method](...args)
      return
    } catch (e) {
      // fallthrough to queue
    }
  }
  _queue.push({ method, args })
}

export function showToastError(title: string, description?: string) {
  enqueue('error', title, description)
}

export function showToastWarning(title: string, description?: string) {
  enqueue('warning', title, description)
}

export function showToastSuccess(title: string, description?: string) {
  enqueue('success', title, description)
}

export function showToastInfo(title: string, description?: string) {
  enqueue('info', title, description)
}
