<?php

namespace App\Database;

class DatabaseFactory
{
    public static function create(): Database
    {
        $dbType = $_ENV['DB_TYPE'] ?? 'sqlite';
        
        switch (strtolower($dbType)) {
            case 'sqlite':
                return new SQLiteDatabase();
            default:
                throw new \InvalidArgumentException("Unsupported database type: {$dbType}");
        }
    }
}
