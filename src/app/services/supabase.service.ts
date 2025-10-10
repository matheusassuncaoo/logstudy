import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Retorna o cliente Supabase para uso direto nos services
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Helper para autenticação
   */
  get auth() {
    return this.supabase.auth;
  }

  /**
   * Helper para storage de arquivos
   */
  get storage() {
    return this.supabase.storage;
  }

  /**
   * Helper para realtime subscriptions
   */
  get realtime() {
    return this.supabase.realtime;
  }

  /**
   * Helper para queries em tabelas
   */
  from(table: string) {
    return this.supabase.from(table);
  }

  /**
   * Helper para chamar RPC (funções PostgreSQL)
   */
  rpc(fn: string, params?: any) {
    return this.supabase.rpc(fn, params);
  }
}
