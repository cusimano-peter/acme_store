const express = require('express');
const app = express();
const { createTables, createUser, createProduct, fetchUsers, fetchProducts, fetchFavorites, createFavorite, destroyFavorite } = require('./db');

app.use(express.json());

app.get('/api/users', async (req, res) => {
    const users = await fetchUsers();
    res.json(users);
});

app.get('/api/products', async (req, res) => {
    const products = await fetchProducts();
    res.json(products);
});

app.get('/api/users/:id/favorites', async (req, res) => {
    const { id } = req.params;
    const favorites = await fetchFavorites(id);
    res.json(favorites);
});

// POST a new user
app.post('/api/users', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await createUser(username, password);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST a new product
app.post('/api/products', async (req, res) => {
    try {
        const { name } = req.body;
        const product = await createProduct(name);
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users/:id/favorites', async (req, res) => {
    const { id } = req.params;
    const { product_id } = req.body;
    const favorite = await createFavorite(id, product_id);
    res.status(201).json(favorite);
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
    const { id } = req.params;
    await destroyFavorite(id);
    res.status(204).send();
});

const port = process.env.PORT || 3000;

const init = async () => {
    await createTables();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
};

init();
