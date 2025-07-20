const pool = require('./db');

async function getAllShirts() {
  const res = await pool.query('SELECT * FROM shirts ORDER BY id');
  return res.rows;
}

async function getShirtById(id) {
  const res = await pool.query('SELECT * FROM shirts WHERE id = $1', [id]);
  return res.rows[0];
}

async function createShirt({ name, description, price, stock }) {
  const res = await pool.query(
    `INSERT INTO shirts (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, description, price, stock]
  );
  return res.rows[0];
}

async function updateShirt(id, { name, description, price, stock }) {
  const res = await pool.query(
    `UPDATE shirts SET name = $1, description = $2, price = $3, stock = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
    [name, description, price, stock, id]
  );
  return res.rows[0];
}

async function deleteShirt(id) {
  await pool.query('DELETE FROM shirts WHERE id = $1', [id]);
}

module.exports = { getAllShirts, getShirtById, createShirt, updateShirt, deleteShirt };
