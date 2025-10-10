import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private initialized = false;

  constructor(private storage: Storage) {
    this.init();
  }

  /**
   * Inicializa o storage
   */
  async init() {
    if (this.initialized) {
      return;
    }

    const storage = await this.storage.create();
    this._storage = storage;
    this.initialized = true;
  }

  /**
   * Salva um valor no storage
   */
  async set(key: string, value: any): Promise<any> {
    await this.ensureInitialized();
    return await this._storage?.set(key, value);
  }

  /**
   * Obtém um valor do storage
   */
  async get(key: string): Promise<any> {
    await this.ensureInitialized();
    return await this._storage?.get(key);
  }

  /**
   * Remove um valor do storage
   */
  async remove(key: string): Promise<any> {
    await this.ensureInitialized();
    return await this._storage?.remove(key);
  }

  /**
   * Limpa todo o storage
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    return await this._storage?.clear();
  }

  /**
   * Obtém todas as chaves do storage
   */
  async keys(): Promise<string[]> {
    await this.ensureInitialized();
    return await this._storage?.keys() || [];
  }

  /**
   * Obtém o tamanho do storage
   */
  async length(): Promise<number> {
    await this.ensureInitialized();
    return await this._storage?.length() || 0;
  }

  /**
   * Itera sobre todos os itens do storage
   */
  async forEach(callback: (value: any, key: string, iterationNumber: Number) => any): Promise<void> {
    await this.ensureInitialized();
    return await this._storage?.forEach(callback);
  }

  /**
   * Salva dados de rotina offline
   */
  async saveRoutineOffline(routine: any): Promise<void> {
    const offlineRoutines = await this.get('offline_routines') || [];
    offlineRoutines.push(routine);
    await this.set('offline_routines', offlineRoutines);
  }

  /**
   * Salva sessão Pomodoro offline
   */
  async savePomodoroSessionOffline(session: any): Promise<void> {
    const offlineSessions = await this.get('offline_pomodoro_sessions') || [];
    offlineSessions.push(session);
    await this.set('offline_pomodoro_sessions', offlineSessions);
  }

  /**
   * Obtém dados offline pendentes de sincronização
   */
  async getPendingSync(): Promise<{
    routines: any[];
    sessions: any[];
  }> {
    return {
      routines: await this.get('offline_routines') || [],
      sessions: await this.get('offline_pomodoro_sessions') || []
    };
  }

  /**
   * Limpa dados sincronizados
   */
  async clearSyncedData(): Promise<void> {
    await this.remove('offline_routines');
    await this.remove('offline_pomodoro_sessions');
  }

  /**
   * Garante que o storage está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }
}
