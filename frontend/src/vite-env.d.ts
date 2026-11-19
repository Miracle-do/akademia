/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_SUPABASE_URL?: string; readonly VITE_SUPABASE_ANON_KEY?: string }
interface ImportMeta { readonly env: ImportMetaEnv }

/** Identifiant unique de la version construite (défini dans vite.config.ts). */
declare const __BUILD_ID__: string;

/** Numéro de version affiché (champ "version" de package.json). */
declare const __APP_VERSION__: string;
