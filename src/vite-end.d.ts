/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string
declare const __CAPITAL_BUILD_ID__: string

interface ImportMetaEnv {
  readonly VITE_ISLANDS?: string
  readonly VITE_DEFAULT_MODE?: string
  readonly VITE_QA?: string
  readonly VITE_BUILD_ID?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_TELEMETRY_URL?: string
  readonly VITE_SRE_DEBUG?: string
  readonly VITE_KILL_HARBOR_3D?: string
  readonly VITE_KILL_SW?: string
  readonly VITE_KILL_TELEMETRY?: string
  readonly VITE_KILL_FAMILY?: string
  readonly VITE_KILL_GALLERY?: string
  readonly VITE_KILL_PARTY?: string
  /** Public billing API origin only — never put Stripe secrets here. */
  readonly VITE_BILLING_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
