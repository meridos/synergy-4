<?php

namespace App\Database;

class SQLiteDatabase extends Database
{
    protected function getDsn(): string
    {
        $dbPath = __DIR__ . '/../../db/' . $this->dbname . '.sqlite';
        return "sqlite:" . $dbPath;
    }

    public function createTables(): void
    {
        // Create users table
        $this->execute("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Create categories table
        $this->execute("
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Create authors table
        $this->execute("
            CREATE TABLE IF NOT EXISTS authors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                biography TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Create books table
        $this->execute("
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                publication_year INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                rental_price_2weeks DECIMAL(10,2) NOT NULL,
                rental_price_1month DECIMAL(10,2) NOT NULL,
                rental_price_3months DECIMAL(10,2) NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                available_for_rent INTEGER DEFAULT 1, -- boolean: 1 = available, 0 = not available
                available_for_purchase INTEGER DEFAULT 1, -- boolean: 1 = available, 0 = not available
                status TEXT DEFAULT 'active', -- 'active', 'inactive', 'discontinued'
                category_id INTEGER,
                author_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
            )
        ");

        // Create purchases table
        $this->execute("
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        ");

        // Create rentals table
        $this->execute("
            CREATE TABLE IF NOT EXISTS rentals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                rental_period TEXT NOT NULL,
                rental_price DECIMAL(10,2) NOT NULL,
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME NOT NULL,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        ");

        // Create rental_notifications table for tracking reminders
        $this->execute("
            CREATE TABLE IF NOT EXISTS rental_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rental_id INTEGER NOT NULL,
                notification_type TEXT NOT NULL,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
            )
        ");
    }
}
