// React import not required with new JSX transform
import { getApiClient } from '@/api/clients'
import { useToast } from '@/contexts/toast.context'

export default function ToastTestPage() {
  const toast = useToast()
  const client = getApiClient()

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Toast debug</h2>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 bg-green-600 text-white rounded"
          onClick={() => toast.success('Manual success', 'This is a test')}
        >
          Show success
        </button>
        <button
          className="px-3 py-2 bg-red-600 text-white rounded"
          onClick={() => toast.error('Manual error', 'This is a test')}
        >
          Show error
        </button>
        <button
          className="px-3 py-2 bg-sky-600 text-white rounded"
          onClick={async () => {
            try {
              await client.get('/__endpoint-not-found')
            } catch (err) {
              // api client will show toast
              console.error('expected error', err)
            }
          }}
        >
          Trigger API error
        </button>
      </div>
    </div>
  )
}
