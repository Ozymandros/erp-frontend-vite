/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_DAPR?: string
  readonly VITE_DAPR_APP_ID?: string
  readonly VITE_DAPR_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
