<?php

namespace App\Models;

use App\Database\Database;

class Category
{
    private $id;
    private $name;
    private $description;
    private $createdAt;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE categories 
                SET name = ?, description = ? 
                WHERE id = ?
            ");
            return $stmt->execute([$this->name, $this->description, $this->id]);
        } else {
            $category = $this->database->fetch("SELECT * FROM categories WHERE name = ?", [$this->name]);
        
            if ($category) {
                $this->id = $category['id'];
                $this->name = $category['name'];
                $this->description = $category['description'];
                return true;
            }

            $stmt = $this->database->prepare("
                INSERT INTO categories (name, description) 
                VALUES (?, ?)
                ON CONFLICT(name) DO NOTHING
                RETURNING id, name, description
            ");
            $result = $stmt->execute([$this->name, $this->description]);
            $category = $stmt->fetch();

            if ($category) {
                $this->id = $category['id'];
                $this->name = $category['name'];
                $this->description = $category['description'];
                return true;
            }
            
            return false;
        }
    }

    public static function findById(Database $database, int $id): ?self
    {
        $data = $database->fetch("SELECT * FROM categories WHERE id = ?", [$id]);
        
        if (!$data) {
            return null;
        }

        $category = new self($database);
        $category->loadFromArray($data);
        return $category;
    }

    public static function findAll(Database $database): array
    {
        $rows = $database->fetchAll("SELECT * FROM categories ORDER BY name ASC");
        $categories = [];

        foreach ($rows as $row) {
            $category = new self($database);
            $category->loadFromArray($row);
            $categories[] = $category;
        }

        return $categories;
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM categories WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => $this->createdAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->description = $data['description'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
    }
}
