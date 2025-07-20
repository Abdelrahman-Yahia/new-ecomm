const pool = require('./db');

async function findUserByUsername(username) {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
}

async function createUser({ username, email, password_hash, role = 'user' }) {
  const res = await pool.query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [username, email, password_hash, role]
  );
  return res.rows[0];
}

module.exports = { findUserByUsername, createUser };
