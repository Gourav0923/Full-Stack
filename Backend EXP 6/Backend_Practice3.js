const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// In-memory database
let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Phone', price: 599.99, category: 'Electronics' },
  { id: 3, name: 'Desk Chair', price: 199.99, category: 'Furniture' }
];

app.get('/', (req, res) => {
  res.send('Welcome to Backend Practice 3 - Advanced REST API with Middleware!');
});

// GET all products with optional filtering
app.get('/api/products', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  res.json({ count: filtered.length, products: filtered });
});

// GET product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST create new product with validation
app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Missing required fields: name, price, category' });
  }
  
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  product.name = req.body.name || product.name;
  product.price = req.body.price ? parseFloat(req.body.price) : product.price;
  product.category = req.body.category || product.category;
  
  res.json(product);
});

// PATCH partial update
app.patch('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  Object.keys(req.body).forEach(key => {
    if (key in product && key !== 'id') {
      product[key] = req.body[key];
    }
  });
  
  res.json(product);
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  const deleted = products.splice(index, 1);
  res.json({ message: 'Product deleted successfully', product: deleted[0] });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
