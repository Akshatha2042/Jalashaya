/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CESIUM_ION_TOKEN: string;
  readonly VITE_MAPTILER_API_KEY: string;
  readonly VITE_MAP_STYLE_URL: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
