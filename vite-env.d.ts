/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUD_SYNC_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
