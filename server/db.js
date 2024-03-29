const { Client } = require("pg");
const bcrypt = require("bcrypt");
const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost/the_acme_store",
});

const createTables = async () => {
  await client.connect();
  await client.query(`
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL
    );

    CREATE TABLE favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        user_id UUID REFERENCES users(id),
        UNIQUE (product_id, user_id)
    );
`);
  console.log("Tables Created");
};

const createUser = async (username, password) => {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }
  const hashedPassword = await bcrypt.hash(password, 10); //saltrounds

  const res = await client.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
    [username, hashedPassword]
  );
  const user = res.rows[0];
  delete user.password; // Optionally omit the password from the returned object
  return user;
};

const createProduct = async (name) => {
  const res = await client.query(
    "INSERT INTO products(name) VALUES ($1) RETURNING *",
    [name]
  );
  return res.rows[0];
};

const fetchUsers = async () => {
  const res = await client.query("SELECT * FROM users");
  return res.rows;
};

const fetchProducts = async () => {
  const res = await client.query("SELECT * FROM products");
  return res.rows;
};

const fetchFavorites = async (userId) => {
  const res = await client.query("SELECT * FROM favorites WHERE user_id = $1", [
    userId,
  ]);
  return res.rows;
};

const createFavorite = async (userId, productId) => {
  const res = await client.query(
    "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *",
    [userId, productId]
  );
  return res.rows[0];
};

const destroyFavorite = async (id) => {
  await client.query("DELETE FROM favorites WHERE id = $1", [id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
};
