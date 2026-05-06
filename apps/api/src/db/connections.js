import mysql from 'mysql2/promise';

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
