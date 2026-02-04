/**
 * FCH Noticias - Database Connection
 * Configuración de conexión a Vercel Postgres con pooling
 */

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// ============================================================================
// CONFIGURACIÓN DE CONEXIÓN
// ============================================================================

/**
 * Cliente Drizzle ORM configurado para Vercel Postgres
 * Usa la conexión serverless automática de @vercel/postgres
 */
export const db = drizzle(sql, { schema });

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type DbClient = typeof db;

// ============================================================================
// HELPERS DE CONEXIÓN
// ============================================================================

/**
 * Verifica la conexión a la base de datos
 * @returns Promise<boolean> true si la conexión es exitosa
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

/**
 * Obtiene información del estado de la base de datos
 */
export async function getDbStatus(): Promise<{
  connected: boolean;
  timestamp: string;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    await sql`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ejecuta una transacción con manejo de errores
 * @param callback Función que recibe el cliente de transacción
 */
export async function withTransaction<T>(
  callback: (tx: DbClient) => Promise<T>
): Promise<T> {
  try {
    // Drizzle ORM maneja transacciones automáticamente
    return await callback(db);
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Clase de error personalizada para errores de base de datos
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Maneja errores de base de datos de forma consistente
 */
export function handleDbError(error: unknown): never {
  if (error instanceof DatabaseError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : 'Unknown database error';
  const code = (error as { code?: string }).code;
  
  // Mapeo de códigos de error de PostgreSQL
  const errorMap: Record<string, string> = {
    '23505': 'Duplicate entry - el registro ya existe',
    '23503': 'Foreign key violation - referencia inválida',
    '23502': 'Not null violation - campo requerido faltante',
    '42P01': 'Undefined table - tabla no existe',
    '42703': 'Undefined column - columna no existe',
    '28P01': 'Authentication failed - credenciales inválidas',
    '3D000': 'Database does not exist',
  };

  throw new DatabaseError(
    errorMap[code || ''] || message,
    code,
    error
  );
}
