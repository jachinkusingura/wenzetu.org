import 'dotenv/config';
import mysql from 'mysql2/promise';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DB || 'healthbridge'
};

const PG_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'healthbridge'
};

async function testConnection(dbType: 'mysql' | 'postgres'): Promise<boolean> {
  try {
    if (dbType === 'mysql') {
      const connection = await mysql.createConnection(MYSQL_CONFIG);
      await connection.end();
      console.log('✓ MySQL connection successful');
      return true;
    } else {
      // Connect to default 'postgres' database to test credentials
      const client = new pg.Client({
        ...PG_CONFIG,
        database: 'postgres'
      });
      await client.connect();
      await client.end();
      console.log('✓ PostgreSQL connection successful');
      return true;
    }
  } catch (error) {
    console.error(`✗ ${dbType.toUpperCase()} connection failed:`, (error as Error).message);
    return false;
  }
}

async function setupMysql() {
  console.log('\n📦 Setting up MySQL database...');
  
  try {
    const connection = await mysql.createConnection({
      host: MYSQL_CONFIG.host,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      port: MYSQL_CONFIG.port,
    });

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_CONFIG.database}`);
    console.log(`✓ Database "${MYSQL_CONFIG.database}" ready`);

    // Switch to database
    await connection.query(`USE ${MYSQL_CONFIG.database}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schemas', 'mysql-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('✓ Tables created successfully');
    }

    await connection.end();
    console.log('✓ MySQL setup complete');
  } catch (error) {
    console.error('MySQL setup failed:', error);
    throw error;
  }
}

async function setupPostgres() {
  console.log('\n📦 Setting up PostgreSQL database...');
  
  try {
    const client = new pg.Client({
      host: PG_CONFIG.host,
      user: PG_CONFIG.user,
      password: PG_CONFIG.password,
      port: PG_CONFIG.port,
    });

    await client.connect();

    // Create database
    const dbExistsResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [PG_CONFIG.database]
    );

    if (dbExistsResult.rows.length === 0) {
      await client.query(`CREATE DATABASE ${PG_CONFIG.database}`);
      console.log(`✓ Database "${PG_CONFIG.database}" created`);
    } else {
      console.log(`✓ Database "${PG_CONFIG.database}" already exists`);
    }

    await client.end();

    // Connect to the actual database
    const dbClient = new pg.Client(PG_CONFIG);
    await dbClient.connect();

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schemas', 'postgres-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await dbClient.query(schema);
      console.log('✓ Schema executed successfully');
    }

    await dbClient.end();
    console.log('✓ PostgreSQL setup complete');
  } catch (error) {
    console.error('PostgreSQL setup failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🏥 HealthBridge Database Setup\n');

  // Test MySQL
  const mysqlAvailable = await testConnection('mysql');

  // Test PostgreSQL
  const pgAvailable = await testConnection('postgres');

  if (!mysqlAvailable && !pgAvailable) {
    console.error('\n❌ No database server is available. Please ensure MySQL or PostgreSQL is running.');
    process.exit(1);
  }

  if (mysqlAvailable) {
    try {
      await setupMysql();
    } catch (error) {
      console.error('Failed to setup MySQL:', error);
    }
  }

  if (pgAvailable) {
    try {
      await setupPostgres();
    } catch (error) {
      console.error('Failed to setup PostgreSQL:', error);
    }
  }

  console.log('\n✅ Database setup complete!\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
