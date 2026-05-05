import mysql from 'mysql2/promise';
import pg from 'pg';
import 'dotenv/config';

import { jsonDb } from './jsonDb';

const DB_TYPE = process.env.DB_TYPE || 'mysql';

// MySQL Connection Pool
let mysqlPool: mysql.Pool | null = null;

// PostgreSQL Client
let pgClient: pg.Client | null = null;

async function getMysqlConnection(): Promise<mysql.PoolConnection> {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DB || 'healthbridge',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return mysqlPool.getConnection();
}

async function getPostgresConnection(): Promise<pg.Client> {
  if (!pgClient) {
    pgClient = new pg.Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'healthbridge',
      port: parseInt(process.env.POSTGRES_PORT || '5432')
    });
    await pgClient.connect();
  }
  return pgClient;
}

export async function query(sql: string, values?: any[]): Promise<any> {
  if (DB_TYPE === 'file') {
    return jsonDb.query(sql, values);
  }
  
  let finalSql = sql;
  
  if (DB_TYPE === 'postgres') {
    // Convert ? to $1, $2, etc. for PostgreSQL
    let index = 1;
    finalSql = sql.replace(/\?/g, () => `$${index++}`);
    
    const client = await getPostgresConnection();
    const result = await client.query(finalSql, values);
    return result.rows;
  } else {
    const conn = await getMysqlConnection();
    try {
      const [rows] = await conn.execute(finalSql, values);
      return rows;
    } finally {
      conn.release();
    }
  }
}

export async function queryOne(sql: string, values?: any[]): Promise<any> {
  const rows = await query(sql, values);
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, values?: any[]): Promise<any> {
  return query(sql, values);
}

export async function closeConnections(): Promise<void> {
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
  }
}

// Check for PostGIS availability
let hasPostGIS = false;

export async function checkPostGIS(): Promise<boolean> {
  if (DB_TYPE !== 'postgres') return false;
  try {
    const result = await queryOne("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') as exists");
    hasPostGIS = result && result.exists;
    return hasPostGIS;
  } catch (error) {
    hasPostGIS = false;
    return false;
  }
}

export function isPostGISAvailable(): boolean {
  return hasPostGIS;
}

// Initialize PostGIS check
if (DB_TYPE === 'postgres') {
  checkPostGIS().catch(err => console.error('Error checking PostGIS:', err));
}
