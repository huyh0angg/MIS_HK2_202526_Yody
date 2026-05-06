import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'yody',
  password: process.env.MYSQL_PASSWORD || 'yody123',
  database: process.env.DB_NAME || 'yody_fashion',
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
