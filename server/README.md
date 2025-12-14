# Server Setup & Testing Guide

## ✅ Setup Complete!

Your Express server is now configured and ready to connect to WAMP MySQL.

## 📋 Prerequisites

Before testing, make sure:

1. **WAMP is running** (green icon in system tray)
2. **MySQL service is active** in WAMP
3. **Database exists** (see below)

## 🗄️ Create Database

Open phpMyAdmin (http://localhost/phpmyadmin) and run:

```sql
CREATE DATABASE IF NOT EXISTS faculty_evaluation;
USE faculty_evaluation;

-- Test table (optional)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO users (name, email, role) VALUES
('John Doe', 'john@example.com', 'Faculty'),
('Jane Smith', 'jane@example.com', 'Admin');
```

## 🚀 Running the Server

### Start Development Server:
```bash
cd server
npm run dev
```

### Start Production Server:
```bash
cd server
npm start
```

## 🧪 Testing Endpoints

Once the server is running, test these URLs in your browser:

### 1. Server Status
```
http://localhost:5000/
```
Expected: JSON response with server status

### 2. Database Connection Test
```
http://localhost:5000/api/test-db
```
Expected: Success message if MySQL is connected

### 3. List Database Tables
```
http://localhost:5000/api/tables
```
Expected: List of all tables in your database

## 🔧 Configuration

Edit `server/.env` to change settings:

```env
PORT=5000                    # Server port
DB_HOST=localhost            # MySQL host
DB_USER=root                 # MySQL username
DB_PASSWORD=                 # MySQL password (empty for WAMP default)
DB_NAME=faculty_evaluation   # Database name
DB_PORT=3306                 # MySQL port
```

## ❌ Troubleshooting

### "Database connection failed"
- ✅ Check WAMP is running (green icon)
- ✅ Verify MySQL service is started in WAMP
- ✅ Confirm database exists in phpMyAdmin
- ✅ Check credentials in `.env` file

### "Port 5000 already in use"
- Change `PORT` in `.env` file to another port (e.g., 5001)

### "Cannot find module"
- Run `npm install` in the server folder

## 📁 Project Structure

```
server/
├── config/
│   └── db.js              # Database connection
├── .env                   # Environment variables
├── server.js              # Main server file
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔗 Next Steps

1. Create API routes in `server/routes/`
2. Add controllers in `server/controllers/`
3. Create models in `server/models/`
4. Connect React frontend to these endpoints
