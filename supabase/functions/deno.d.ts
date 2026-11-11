// Ambient type definitions for Supabase Edge Functions running on Deno
// This provides TypeScript IntelliSense in VS Code without requiring the Deno extension.

declare namespace Deno {
  export interface ServeOptions {
    port?: number
    hostname?: string
    signal?: AbortSignal
    onListen?: (params: { port: number; hostname: string }) => void
    onError?: (error: unknown) => Response | Promise<Response>
  }

  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void

  export function serve(
    options: ServeOptions,
    handler: (req: Request) => Response | Promise<Response>
  ): void

  export const env: {
    get(key: string): string | undefined
    set(key: string, value: string): void
    delete(key: string): void
    has(key: string): boolean
    toObject(): Record<string, string>
  }
}

