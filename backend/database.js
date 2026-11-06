const Database = require("better-sqlite3");

const db = new Database("stockflow.db");

// Products table
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        quantity INTEGER DEFAULT 0,
        costPrice REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        threshold INTEGER DEFAULT 5,
        status TEXT DEFAULT 'In Stock'
    )
`);

// Add missing product columns if needed
const columns = db.prepare("PRAGMA table_info(products)").all();
const columnNames = columns.map(column => column.name);

if (!columnNames.includes("description")) {
    db.exec("ALTER TABLE products ADD COLUMN description TEXT DEFAULT ''");
}
if (!columnNames.includes("costPrice")) {
    db.exec("ALTER TABLE products ADD COLUMN costPrice REAL DEFAULT 0");
}
if (!columnNames.includes("threshold")) {
    db.exec("ALTER TABLE products ADD COLUMN threshold INTEGER DEFAULT 5");
}

// Users table for signup and login
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("StockFlow Database Connected!");

module.exports = db;