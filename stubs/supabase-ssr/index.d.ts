import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

type SameSite = 'lax' | 'strict' | 'none';

export interface CookieMethods {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  remove(name: string, options?: CookieOptions): void;
}

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: SameSite;
  secure?: boolean;
}

export interface ServerClientConfig<SchemaName extends string> {
  cookies?: CookieMethods;
  options?: SupabaseClientOptions<any, SchemaName>;
}

export interface ServerComponentCookies {
  get(name: string): { value?: string } | string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
}

export interface ServerComponentClientConfig<SchemaName extends string> {
  supabaseUrl: string;
  supabaseKey: string;
  cookies?: ServerComponentCookies;
  cookieOptions?: CookieOptions;
  options?: SupabaseClientOptions<any, SchemaName>;
}

export function createBrowserClient<Database = any, SchemaName extends string = 'public'>(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<Database, SchemaName>
): SupabaseClient<Database, SchemaName>;

export function createServerClient<Database = any, SchemaName extends string = 'public'>(
  supabaseUrl: string,
  supabaseKey: string,
  config?: ServerClientConfig<SchemaName>
): SupabaseClient<Database, SchemaName>;

export function createServerComponentClient<Database = any, SchemaName extends string = 'public'>(
  config: ServerComponentClientConfig<SchemaName>
): SupabaseClient<Database, SchemaName>;
