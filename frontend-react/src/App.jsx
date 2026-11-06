import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    threshold: 5
  });

  // Fetch products from database
  async function fetchProducts() {
    try {
      const response = await axios.get(API);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Unable to connect to backend!');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: '',
      sku: '',
      description: '',
      quantity: '',
      costPrice: '',
      sellingPrice: '',
      threshold: 5
    });
  }

  // Add or update product
  async function addProduct(e) {
    e.preventDefault();

    const duplicate = products.some(
      p => p.sku.trim().toLowerCase() === form.sku.trim().toLowerCase()
        && p.id !== editingId
    );

    if (duplicate) {
      alert('SKU already exists!');
      return;
    }

    const productData = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity: Number(form.quantity),
      threshold: Number(form.threshold),
      costPrice: Number(form.costPrice || 0),
      sellingPrice: Number(form.sellingPrice || 0)
    };

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, productData);
        alert('Product updated successfully!');
      } else {
        await axios.post(API, productData);
        alert('Product added successfully!');
      }

      await fetchProducts();
      resetForm();

    } catch (error) {
      alert(error.response?.data?.error || 'Unable to save product!');
    }
  }

  // Edit product
  function editProduct(product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      quantity: String(product.quantity),
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      threshold: String(product.threshold)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete product
  async function deleteProduct(id) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API}/${id}`);
        await fetchProducts();

        if (editingId === id) {
          resetForm();
        }

        alert('Product deleted successfully!');

      } catch (error) {
        alert('Unable to delete product!');
      }
    }
  }

  const totalQuantity = products.reduce(
    (total, p) => total + p.quantity, 0
  );

  const lowStock = products.filter(
    p => p.quantity <= p.threshold
  );

  // Search and filter
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      (filter === 'In Stock' && product.quantity > product.threshold) ||
      (filter === 'Low Stock' && product.quantity <= product.threshold);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app">

      <aside className="sidebar">
        <h2>StockFlow</h2>
        <p className="active">Dashboard</p>
        <p>Products</p>
        <p>Inventory</p>
        <p>Settings</p>
        <p>Logout</p>
      </aside>

      <main className="main">
        <h1>Dashboard</h1>
        <p>Welcome to your inventory management system.</p>

        <div className="cards">
          <div className="card">
            <h3>Total Products</h3>
            <h2>{products.length}</h2>
          </div>

          <div className="card">
            <h3>Total Quantity</h3>
            <h2>{totalQuantity}</h2>
          </div>

          <div className="card">
            <h3>Low Stock Items</h3>
            <h2>{lowStock.length}</h2>
          </div>
        </div>

        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

        <form className="product-form" onSubmit={addProduct}>
          <input name="name" placeholder="Product Name"
            value={form.name} onChange={handleChange} required />

          <input name="sku" placeholder="SKU"
            value={form.sku} onChange={handleChange} required />

          <input name="description" placeholder="Description"
            value={form.description} onChange={handleChange} />

          <input name="quantity" type="number" min="0"
            placeholder="Quantity" value={form.quantity}
            onChange={handleChange} required />

          <input name="costPrice" type="number" min="0" step="0.01"
            placeholder="Cost Price" value={form.costPrice}
            onChange={handleChange} />

          <input name="sellingPrice" type="number" min="0" step="0.01"
            placeholder="Selling Price" value={form.sellingPrice}
            onChange={handleChange} />

          <input name="threshold" type="number" min="0"
            placeholder="Low Stock Threshold"
            value={form.threshold} onChange={handleChange} />

          <button type="submit">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>

        <h2>Product List</h2>

        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Products</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
        </select>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.quantity}</td>
                <td>₹{product.sellingPrice}</td>
                <td>
                  {product.quantity <= product.threshold
                    ? 'Low Stock'
                    : 'In Stock'}
                </td>
                <td>
                  <button type="button"
                    onClick={() => editProduct(product)}>
                    Edit
                  </button>

                  <button type="button"
                    onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p>No matching products found.</p>
        )}

      </main>
    </div>
  );
}

export default App;