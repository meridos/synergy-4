<?php

namespace App\Models;

use App\Database\Database;

class User
{
    private $id;
    private $name;
    private $email;
    private $password;
    private $createdAt;
    private $updatedAt;
    private $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function setPassword(string $password): void
    {
        $this->password = password_hash($password, PASSWORD_DEFAULT);
    }

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->password);
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE users 
                SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            return $stmt->execute([$this->name, $this->email, $this->id]);
        } else {
            $stmt = $this->database->prepare("
                INSERT INTO users (name, email, password) 
                VALUES (?, ?, ?)
            ");
            $result = $stmt->execute([$this->name, $this->email, $this->password]);
            
            if ($result) {
                $this->id = (int) $this->database->lastInsertId();
                return true;
            }
            return false;
        }
    }

    public static function findById(Database $database, int $id): ?self
    {
        $data = $database->fetch("SELECT * FROM users WHERE id = ?", [$id]);
        
        if (!$data) {
            return null;
        }

        $user = new self($database);
        $user->loadFromArray($data);
        return $user;
    }

    public static function findByEmail(Database $database, string $email): ?self
    {
        $data = $database->fetch("SELECT * FROM users WHERE email = ?", [$email]);
        
        if (!$data) {
            return null;
        }

        $user = new self($database);
        $user->loadFromArray($data);
        return $user;
    }

    public static function findAll(Database $database): array
    {
        $rows = $database->fetchAll("SELECT * FROM users ORDER BY created_at DESC");
        $users = [];

        foreach ($rows as $row) {
            $user = new self($database);
            $user->loadFromArray($row);
            $users[] = $user;
        }

        return $users;
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->email = $data['email'] ?? null;
        $this->password = $data['password'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
        $this->updatedAt = $data['updated_at'] ?? null;
    }
}
