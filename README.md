StockFlow – Inventory Management System

StockFlow is a web-based inventory management application that helps users manage products, monitor stock levels, and track inventory efficiently.

Features

- Dashboard with total products, total quantity, and low-stock count
- Add new products
- View all products
- Edit product details
- Delete products
- Search products
- Filter products by stock status
- Input validation
- Duplicate SKU prevention
- Persistent data storage using SQLite

Technologies Used

Frontend

- React.js
- JavaScript
- HTML
- CSS
- Axios

Backend

- Node.js
- Express.js
- SQLite
- better-sqlite3

Project Structure

stockflow-mvp/
├── backend/
│   ├── server.js
│   ├── database.js
│   └── stockflow.db
├── frontend-react/
│   └── src/
└── README.md

Installation and Setup

1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd stockflow-mvp

2. Start the backend

cd backend
npm install
node server.js

Backend runs on port 5000.

3. Start the frontend

Open another terminal:

cd frontend-react
npm install
npm run dev

Open the local URL displayed in the terminal.

API Endpoints

Method| Endpoint| Purpose
GET| /api/products| Get all products
POST| /api/products| Add a product
PUT| /api/products/:id| Update a product
DELETE| /api/products/:id| Delete a product

Database

StockFlow uses SQLite to store product information, including product name, SKU, description, quantity, cost price, selling price, and stock threshold.

Project Status

Core frontend, backend, database integration, product management, and validation features have been implemented and tested.

Author

Gundla Sahaja

License

This project is created for educational and internship assignment purposes.