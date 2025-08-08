<?php

namespace App\Database;

use PDO;
use PDOException;

abstract class Database
{
    protected $pdo;
    protected $host;
    protected $dbname;
    protected $username;
    protected $password;
    protected $port;

    public function __construct()
    {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->dbname = $_ENV['DB_NAME'] ?? 'app_database';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
        $this->port = $_ENV['DB_PORT'] ?? '5432';
    }

    abstract protected function getDsn(): string;

    public function connect(): PDO
    {
        if ($this->pdo === null) {
            try {
                $this->pdo = new PDO(
                    $this->getDsn(),
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new PDOException("Connection failed: " . $e->getMessage());
            }
        }

        return $this->pdo;
    }

    public function getConnection(): PDO
    {
        return $this->connect();
    }

    public function disconnect(): void
    {
        $this->pdo = null;
    }

    public function prepare(string $query): \PDOStatement
    {
        return $this->connect()->prepare($query);
    }

    public function execute(string $query, array $params = []): \PDOStatement
    {
        $stmt = $this->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll(string $query, array $params = []): array
    {
        return $this->execute($query, $params)->fetchAll();
    }

    public function fetch(string $query, array $params = []): array|false
    {
        return $this->execute($query, $params)->fetch();
    }

    public function lastInsertId(): string
    {
        return $this->connect()->lastInsertId();
    }

    abstract public function createTables(): void;
}
