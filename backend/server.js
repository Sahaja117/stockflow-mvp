require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
    res.send("StockFlow Backend is running!");
});

// SIGNUP API
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Please enter all required fields"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must contain at least 8 characters"
            });
        }

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(email);

        if (existingUser) {
            return res.status(409).json({
                error: "Email already registered. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        `).run(name, email, hashedPassword);

        const user = {
            id: result.lastInsertRowid,
            name,
            email
        };

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Signup successful",
            token,
            user
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Signup failed" });
    }
});

// LOGIN API
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Please enter email and password"
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// GET LOGGED-IN USER
app.get("/api/auth/me", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication token required"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = db.prepare(
            "SELECT id, name, email FROM users WHERE id = ?"
        ).get(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });

    } catch (error) {
        res.status(401).json({
            error: "Invalid or expired token"
        });
    }
});

// GET ALL PRODUCTS
app.get("/api/products", (req, res) => {
    try {
        const products = db.prepare(
            "SELECT * FROM products ORDER BY id DESC"
        ).all();

        res.json(products.map(product => ({
            ...product,
            sellingPrice: product.selling_price
        })));

    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ error: "Unable to fetch products" });
    }
});

// ADD PRODUCT
app.post("/api/products", (req, res) => {
    try {
        const {
            name,
            sku,
            description = "",
            quantity = 0,
            costPrice = 0,
            sellingPrice = 0,
            threshold = 5
        } = req.body;

        if (!name || !sku) {
            return res.status(400).json({
                error: "Product name and SKU are required"
            });
        }

        const status = Number(quantity) <= Number(threshold)
            ? "Low Stock"
            : "In Stock";

        const result = db.prepare(`
            INSERT INTO products
            (name, sku, description, quantity, costPrice,
             selling_price, threshold, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name,
            sku,
            description,
            Number(quantity),
            Number(costPrice),
            Number(sellingPrice),
            Number(threshold),
            status
        );

        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            ...product,
            sellingPrice: product.selling_price
        });

    } catch (error) {
        console.error("Add product error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "SKU already exists!"
            });
        }

        res.status(500).json({ error: "Unable to add product" });
    }
});

// UPDATE PRODUCT
app.put("/api/products/:id", (req, res) => {
    try {
        const {
            name,
            sku,
            description = "",
            quantity = 0,
            costPrice = 0,
            sellingPrice = 0,
            threshold = 5
        } = req.body;

        const id = Number(req.params.id);

        const existingProduct = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        if (!existingProduct) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        const status = Number(quantity) <= Number(threshold)
            ? "Low Stock"
            : "In Stock";

        db.prepare(`
            UPDATE products
            SET name = ?,
                sku = ?,
                description = ?,
                quantity = ?,
                costPrice = ?,
                selling_price = ?,
                threshold = ?,
                status = ?
            WHERE id = ?
        `).run(
            name,
            sku,
            description,
            Number(quantity),
            Number(costPrice),
            Number(sellingPrice),
            Number(threshold),
            status,
            id
        );

        const updatedProduct = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        res.json({
            ...updatedProduct,
            sellingPrice: updatedProduct.selling_price
        });

    } catch (error) {
        console.error("Update product error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "SKU already exists!"
            });
        }

        res.status(500).json({ error: "Unable to update product" });
    }
});

// DELETE PRODUCT
app.delete("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = db.prepare(
            "DELETE FROM products WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ error: "Unable to delete product" });
    }
});

// API NOT FOUND
// API NOT FOUND
app.use((req, res) => {
    res.status(404).json({
        error: "API route not found",
        method: req.method,
        path: req.originalUrl
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log("StockFlow Database Connected!");
    console.log(`Server running on port ${PORT}`);
    console.log("Signup API: POST /api/auth/signup");
    console.log("Login API: POST /api/auth/login");
    console.log("Products API: GET /api/products");
});