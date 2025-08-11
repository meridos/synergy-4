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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Create travel entries table
        $this->execute("
            CREATE TABLE IF NOT EXISTS travels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                location TEXT NOT NULL,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                cost DECIMAL(10,2),
                start_date DATE,
                end_date DATE,
                transportation_rating INTEGER CHECK(transportation_rating >= 1 AND transportation_rating <= 5),
                safety_rating INTEGER CHECK(safety_rating >= 1 AND safety_rating <= 5),
                population_rating INTEGER CHECK(population_rating >= 1 AND population_rating <= 5),
                nature_rating INTEGER CHECK(nature_rating >= 1 AND nature_rating <= 5),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Create places to visit table
        $this->execute("
            CREATE TABLE IF NOT EXISTS places_to_visit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                travel_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                visited INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (travel_id) REFERENCES travels(id) ON DELETE CASCADE
            )
        ");
    }
}
