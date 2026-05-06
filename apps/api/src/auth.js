import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { queryOne, queryAll, execute } from './db/connections.js';

const SALT_ROUNDS = 10;

export async function createSession(connection, userId = null) {
  const sessionId = uuidv4();
  await connection.execute(
    'INSERT INTO sessions (session_id, user_id) VALUES (?, ?)',
    [sessionId, userId]
  );
  return sessionId;
}

export async function getSessionById(sessionId) {
  return queryOne('SELECT * FROM sessions WHERE session_id = ?', [sessionId]);
}

export async function updateSessionUser(sessionId, userId) {
  return execute(
    'UPDATE sessions SET user_id = ?, updated_at = NOW() WHERE session_id = ?',
    [userId, sessionId]
  );
}

export async function deleteSession(sessionId) {
  return execute('DELETE FROM sessions WHERE session_id = ?', [sessionId]);
}

export async function registerUser(email, password, fullName = null) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await execute(
    'INSERT INTO users (email, password_hash, full_name, role, is_verified) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, fullName, 'USER', 1]
  );
  return { id: result.insertId, email, fullName };
}

export async function loginUser(email, password) {
  const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return { error: 'User not found' };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return { error: 'Invalid password' };

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    phone: user.phone,
    province: user.province
  };
}

export async function getUserById(userId) {
  return queryOne(
    'SELECT id, email, full_name, phone, province, role, is_verified, created_at FROM users WHERE id = ?',
    [userId]
  );
}

export async function updateUserProfile(userId, updates) {
  const fields = [];
  const values = [];

  if (updates.fullName !== undefined) { fields.push('full_name = ?'); values.push(updates.fullName); }
  if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
  if (updates.province !== undefined) { fields.push('province = ?'); values.push(updates.province); }
  if (updates.ward !== undefined) { fields.push('ward = ?'); values.push(updates.ward); }
  if (updates.addressDetail !== undefined) { fields.push('address_detail = ?'); values.push(updates.addressDetail); }

  if (fields.length === 0) return null;

  values.push(userId);
  return execute(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
}

export async function getUserAddresses(userId) {
  return queryAll(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [userId]
  );
}

export async function createAddress(userId, address) {
  const existing = await queryOne(
    'SELECT id FROM addresses WHERE user_id = ? AND is_default = 1',
    [userId]
  );
  const isDefault = existing ? 0 : 1;
  return execute(
    'INSERT INTO addresses (user_id, full_name, phone, province, district, ward, address_detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, address.fullName, address.phone, address.province, address.district, address.ward, address.addressDetail, isDefault]
  );
}

export async function setDefaultAddress(addressId, userId) {
  await execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  return execute('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [addressId, userId]);
}

export async function deleteAddress(addressId, userId) {
  const address = await queryOne(
    'SELECT is_default FROM addresses WHERE id = ? AND user_id = ?',
    [addressId, userId]
  );
  await execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);

  if (address?.is_default) {
    const next = await queryOne(
      'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (next) {
      await execute('UPDATE addresses SET is_default = 1 WHERE id = ?', [next.id]);
    }
  }
}
