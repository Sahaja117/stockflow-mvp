const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// Validate product details
function validateProduct(product) {
    const {
        name,
        sku,
        quantity,
        costPrice,
        sellingPrice,
        threshold
    } = product;

    if (typeof name !== "string" || !name.trim()) {
        return "Product name is required";
    }

    if (typeof sku !== "string" || !sku.trim()) {
        return "SKU is required";
    }

    if (
        quantity === undefined ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        return "Quantity must be a non-negative whole number";
    }

    if (
        costPrice !== undefined &&
        (!Number.isFinite(Number(costPrice)) || Number(costPrice) < 0)
    ) {
        return "Cost price must be a non-negative number";
    }

    if (
        sellingPrice !== undefined &&
        (!Number.isFinite(Number(sellingPrice)) || Number(sellingPrice) < 0)
    ) {
        return "Selling price must be a non-negative number";
    }

    if (
        threshold !== undefined &&
        (!Number.isInteger(Number(threshold)) || Number(threshold) < 0)
    ) {
        return "Threshold must be a non-negative whole number";
    }

    return null;
}

// Get all products
app.get("/api/products", (req, res) => {
    try {
        const products = db.prepare(`
            SELECT id, name, sku, description, quantity,
            costPrice, selling_price AS sellingPrice, threshold
            FROM products
        `).all();

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Unable to fetch products" });
    }
});

// Add product
app.post("/api/products", (req, res) => {
    const {
        name, sku, description, quantity,
        costPrice, sellingPrice, threshold
    } = req.body;

    const validationError = validateProduct(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const result = db.prepare(`
            INSERT INTO products
            (name, sku, description, quantity,
            costPrice, selling_price, threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            sku.trim(),
            description || "",
            Number(quantity),
            Number(costPrice ?? 0),
            Number(sellingPrice ?? 0),
            Number(threshold ?? 5)
        );

        res.status(201).json({
            message: "Product added successfully",
            id: result.lastInsertRowid
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "This SKU already exists"
            });
        }

        res.status(500).json({ error: "Unable to add product" });
    }
});

// Update product
app.put("/api/products/:id", (req, res) => {
    const {
        name, sku, description, quantity,
        costPrice, sellingPrice, threshold
    } = req.body;

    const validationError = validateProduct(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const result = db.prepare(`
            UPDATE products
            SET name = ?, sku = ?, description = ?,
            quantity = ?, costPrice = ?,
            selling_price = ?, threshold = ?
            WHERE id = ?
        `).run(
            name.trim(),
            sku.trim(),
            description || "",
            Number(quantity),
            Number(costPrice ?? 0),
            Number(sellingPrice ?? 0),
            Number(threshold ?? 5),
            req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json({ message: "Product updated successfully" });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "This SKU already exists"
            });
        }

        res.status(500).json({ error: "Unable to update product" });
    }
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
    try {
        const result = db.prepare(
            "DELETE FROM products WHERE id = ?"
        ).run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Unable to delete product" });
    }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});