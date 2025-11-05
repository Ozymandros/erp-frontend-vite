import * as ToastPrimitive from '@radix-ui/react-toast'
import React from 'react'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

import type { ToastItem } from '@/contexts/toast.types'

interface ToastCardProps {
  toast: ToastItem
  onClose: (id: string) => void
}

export const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const { id, title, description, type } = toast

  const icon = (() => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-sky-500" />
    }
  })()

  return (
    <ToastPrimitive.Root
      className="group pointer-events-auto mb-2 w-full max-w-sm rounded-md bg-white/90 p-3 shadow-lg border border-gray-100"
      defaultOpen
      duration={toast.duration ?? 5000}
      onOpenChange={(open) => {
        if (!open) onClose(id)
      }}
    >
      <div className="flex items-start gap-3">
        <div>{icon}</div>
        <div className="flex-1">
          {title && <ToastPrimitive.Title className="font-medium text-sm">{title}</ToastPrimitive.Title>}
          {description && (
            <ToastPrimitive.Description className="text-xs text-gray-600">{description}</ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close asChild>
          <button className="opacity-60 group-hover:opacity-100 p-1 rounded focus:outline-none" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  )
}

export default ToastCard
