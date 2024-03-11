const { Client } = require('pg');
const bcrypt = require('bcrypt');
const client = new Client(process.env.DATABASE_URL);

 const createTables = async () => {
    await client.connect();
    await client.query(`
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products
        
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFUALT gen_random_uuid(),
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
        
        CREATE TABLE products (
            id UUID PRIMARY KEY DEFUALT gen_random_uuid(),
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE favorites (
            id UUID PRIMARY KEY DEFUALT gen_random_uuid(),
            product_id UUID REFERENCES products(id),
            user_id UUID REFERENCE users(id),
            UNIQUE (procuct_id, user_id)
        );
    `);
    console.log('Tables Created');
 };

const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password,10);
    const res = await client.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',[username, hashedPassword]);
    return res.rows[0]
};

const createProduct = async (product) => {
    const res = await client.query('INSERT INTO products(product) VALUES ($1) RETURNING *', [product]);
    res.rows[0];
};

const fetchUsers = async() => {
    const res = await client.query('SELECT * FROM users');
    return res.rows;
};

const fetchProducts = async() => {
    const res = await client.query('SELECT * FROM products');
    return res.row;
};

const fetchFavorites = async (userId) => {
    const res = await client.query('SELECT * FROM favorites WHERE user_id = $1', [userID]);
    return res.rows;
};

const createFavorite = async (userId, productId) => {
    const res = await client.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *', [userId, productId]);
    return res.rows[0];
};

const destroyFavorite = async (id) => {
    await client.query('DELETE FROM favorites WHERE id = $1', [id]);
};

module.exports = {
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    createFavorite,
    destroyFavorite,
};