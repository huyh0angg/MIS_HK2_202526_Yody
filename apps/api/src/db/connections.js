import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function readEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      return value;
    }
  }
  return undefined;
}

const mysqlHost = readEnv('MYSQL_HOST', 'MYSQLHOST', 'DB_HOST') || 'localhost';
const mysqlPort = parseInt(readEnv('MYSQL_PORT', 'MYSQLPORT', 'DB_PORT') || '3306', 10);
const mysqlUser = readEnv('MYSQL_USER', 'MYSQLUSER', 'DB_USER') || 'yody';
const mysqlPassword = readEnv('MYSQL_PASSWORD', 'MYSQLPASSWORD', 'DB_PASSWORD') || 'yody123';
const mysqlDatabase = readEnv('MYSQL_DATABASE', 'MYSQLDATABASE', 'DB_NAME', 'DATABASE_NAME') || 'yody_fashion';
const seedSqlPath = fileURLToPath(new URL('../../../../db/init-unified.sql', import.meta.url));

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function normalizeSeedSql(sql) {
  return sql
    .replace(/^SET SQL_MODE = .*?;\s*$/gmi, '')
    .replace(/^START TRANSACTION;\s*$/gmi, '')
    .replace(/^SET time_zone = .*?;\s*$/gmi, '')
    .replace(/^SET NAMES .*?;\s*$/gmi, '')
    .replace(/^SET CHARACTER SET .*?;\s*$/gmi, '')
    .replace(/^USE `[^`]+`;\s*$/gmi, '')
    .replace(/^COMMIT;\s*$/gmi, '')
    .replace(/CREATE TABLE\s+/g, 'CREATE TABLE IF NOT EXISTS ')
    .replace(/INSERT INTO\s+/g, 'INSERT IGNORE INTO ');
}

let bootstrapPromise = null;

async function ensureAutoIncrementId(tableName) {
  const [rows] = await pool.query(
    `SELECT EXTRA, COLUMN_TYPE
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = 'id'`,
    [mysqlDatabase, tableName]
  );

  const column = rows?.[0];
  if (!column) {
    return;
  }

  if (!String(column.EXTRA || '').toLowerCase().includes('auto_increment')) {
    await pool.query(`ALTER TABLE \`${tableName}\` MODIFY COLUMN id ${column.COLUMN_TYPE} NOT NULL AUTO_INCREMENT`);
  }
}

export async function ensureDatabaseSeeded() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        const [tableRows] = await pool.query(
          `SELECT COUNT(*) AS count
           FROM information_schema.tables
           WHERE table_schema = ? AND table_name = 'products'`,
          [mysqlDatabase]
        );

        const tableExists = Number(tableRows?.[0]?.count || 0) > 0;
        let shouldSeed = !tableExists;

        if (!shouldSeed) {
          const [productRows] = await pool.query('SELECT COUNT(*) AS count FROM products');
          shouldSeed = Number(productRows?.[0]?.count || 0) === 0;
        }

        if (!shouldSeed) {
          return { seeded: false };
        }

        const seedSql = normalizeSeedSql(await fs.readFile(seedSqlPath, 'utf8'));
        const statements = splitSqlStatements(seedSql);

        for (const statement of statements) {
          await pool.query(statement);
        }

        const tablesToFix = [
          'sessions',
          'addresses',
          'users',
          'categories',
          'banners',
          'products',
          'orders',
          'order_items',
          'cart_items',
          'terms_policies'
        ];

        for (const tableName of tablesToFix) {
          await ensureAutoIncrementId(tableName);
        }

        return { seeded: true };
      } catch (error) {
        console.error('Database bootstrap error:', error.message);
        return { seeded: false, error };
      }
    })();
  }

  return bootstrapPromise;
}

export const pool = mysql.createPool({
  host: mysqlHost,
  port: mysqlPort,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export async function queryOne(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

export async function queryAll(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
