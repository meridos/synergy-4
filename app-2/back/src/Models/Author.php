<?php

namespace App\Models;

use App\Database\Database;

class Author
{
    private $id;
    private $name;
    private $biography;
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

    public function getBiography(): ?string
    {
        return $this->biography;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setBiography(?string $biography): void
    {
        $this->biography = $biography;
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE authors 
                SET name = ?, biography = ? 
                WHERE id = ?
            ");
            return $stmt->execute([$this->name, $this->biography, $this->id]);
        } else {
            $author = $this->database->fetch("SELECT * FROM authors WHERE name = ?", [$this->name]);
          
            if ($author) {
                $this->id = $author['id'];
                $this->name = $author['name'];
                $this->biography = $author['biography'];
                return true;
            }

            $stmt = $this->database->prepare("
                INSERT INTO authors (name, biography) 
                VALUES (?, ?)
                ON CONFLICT (name) DO NOTHING
                RETURNING id, name, biography
            ");
            $result = $stmt->execute([$this->name, $this->biography]);
            $author = $stmt->fetch();

            if ($author) {
                $this->id = $author['id'];
                $this->name = $author['name'];
                $this->biography = $author['biography'];
                return true;
            }
            
            return false;
        }
    }

    public static function findById(Database $database, int $id): ?self
    {
        $data = $database->fetch("SELECT * FROM authors WHERE id = ?", [$id]);
        
        if (!$data) {
            return null;
        }

        $author = new self($database);
        $author->loadFromArray($data);
        return $author;
    }

    public static function findAll(Database $database): array
    {
        $rows = $database->fetchAll("SELECT * FROM authors ORDER BY name ASC");
        $authors = [];

        foreach ($rows as $row) {
            $author = new self($database);
            $author->loadFromArray($row);
            $authors[] = $author;
        }

        return $authors;
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM authors WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'biography' => $this->biography,
            'created_at' => $this->createdAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->biography = $data['biography'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
    }
}
