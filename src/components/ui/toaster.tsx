import * as ToastPrimitive from '@radix-ui/react-toast'
import React from 'react'
import ToastCard from './toast'
import type { ToastItem } from '@/contexts/toast.types'

interface ToasterProps {
  readonly toasts: ToastItem[];
  readonly onDismiss: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, onDismiss }) => {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <div aria-live="polite">
        {toasts?.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={onDismiss} />
        ))}
      </div>

      <ToastPrimitive.Viewport
        className="fixed bottom-4 right-4 flex flex-col p-2 gap-2 w-96 max-w-full z-50"
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      />
    </ToastPrimitive.Provider>
  )
}

export default Toaster
