import { Injectable, Logger } from '@nestjs/common';

interface CacheItem {
  value: any;
  expiry: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL: number = 3600; // 1 heure par défaut

  constructor() {}

  /**
   * Récupère une valeur depuis le cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.cache.get(key);
      if (!item) {
        this.logger.debug(`Cache MISS for key: ${key}`);
        return null;
      }

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        this.logger.debug(`Cache EXPIRED for key: ${key}`);
        return null;
      }

      this.logger.debug(`Cache HIT for key: ${key}`);
      return item.value;
    } catch (error: any) {
      this.logger.error(`Error getting cache for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Définit une valeur dans le cache avec TTL
   */
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { value, expiry });
      this.logger.debug(`Cache SET for key: ${key} (TTL: ${ttl}s)`);
    } catch (error: any) {
      this.logger.error(`Error setting cache for key ${key}:`, error.message);
    }
  }

  /**
   * Supprime une valeur du cache
   */
  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.logger.debug(`Cache DEL for key: ${key}`);
    } catch (error: any) {
      this.logger.error(`Error deleting cache for key ${key}:`, error.message);
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        this.cache.delete(key);
      }
      
      this.logger.debug(`Cache INVALIDATE pattern: ${pattern} (${keysToDelete.length} keys)`);
    } catch (error: any) {
      this.logger.error(`Error invalidating cache pattern ${pattern}:`, error.message);
    }
  }

  /**
   * Wrapper pour mettre en cache les résultats de fonction
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Vérifier d'abord le cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Exécuter la fonction et mettre en cache le résultat
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Génère une clé de cache pour les utilisateurs
   */
  static generateUserCacheKey(
    operation: string,
    params: { [key: string]: any }
  ): string {
    // Filtrer les paramètres undefined/null pour éviter "tid:undefined" dans les clés
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `users:${operation}:${filteredParams}`;
  }

  /**
   * Génère une clé de cache pour les statistiques
   */
  static generateStatsCacheKey(
    tenantId: string,
    type: string,
    params?: { [key: string]: any }
  ): string {
    const paramString = params 
      ? Object.keys(params)
          .sort()
          .map(key => `${key}:${params[key]}`)
          .join('|')
      : '';
    return `stats:${tenantId}:${type}${paramString ? ':' + paramString : ''}`;
  }

  /**
   * Invalide le cache lié à un tenant
   */
  async invalidateTenantCache(tenantId: string): Promise<void> {
    await this.invalidatePattern(`*:${tenantId}:*`);
    await this.invalidatePattern(`stats:${tenantId}:*`);
  }

  /**
   * Invalide le cache des utilisateurs
   */
  async invalidateUserCache(): Promise<void> {
    await this.invalidatePattern('users:*');
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Vérifie l'état du cache
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const testKey = 'health_check_' + Date.now();
      await this.set(testKey, 'test', 10);
      const value = await this.get(testKey);
      await this.del(testKey);
      
      if (value === 'test') {
        return { status: 'healthy', message: 'Memory cache is working properly' };
      } else {
        return { status: 'error', message: 'Cache read/write test failed' };
      }
    } catch (error: any) {
      return { 
        status: 'error', 
        message: `Cache health check failed: ${error.message}` 
      };
    }
  }

  /**
   * Retourne des statistiques sur le cache
   */
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implémenter le tracking des hits/misses
    };
  }
}
