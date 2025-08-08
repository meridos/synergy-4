<?php

namespace App\Models;

use App\Database\Database;

class Tag
{
    private $id;
    private $name;
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

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setName(string $name): void
    {
        $this->name = trim($name);
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE tags 
                SET name = ? 
                WHERE id = ?
            ");
            return $stmt->execute([$this->name, $this->id]);
        } else {
            $stmt = $this->database->prepare("
                INSERT INTO tags (name) 
                VALUES (?)
            ");
            $result = $stmt->execute([$this->name]);
            
            if ($result) {
                $this->id = (int) $this->database->lastInsertId();
                return true;
            }
            return false;
        }
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM tags WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public static function findById(Database $database, int $id): ?static
    {
        $data = $database->fetch("SELECT * FROM tags WHERE id = ?", [$id]);
        
        if (!$data) {
            return null;
        }

        $tag = new static($database);
        $tag->loadFromArray($data);
        return $tag;
    }

    public static function findByName(Database $database, string $name): ?static
    {
        $data = $database->fetch("SELECT * FROM tags WHERE name = ?", [trim($name)]);
        
        if (!$data) {
            return null;
        }

        $tag = new static($database);
        $tag->loadFromArray($data);
        return $tag;
    }

    public static function findOrCreate(Database $database, string $name): static
    {
        $tag = self::findByName($database, $name);
        
        if (!$tag) {
            $tag = new static($database);
            $tag->setName($name);
            $tag->save();
        }
        
        return $tag;
    }

    public static function findAll(Database $database): array
    {
        $results = $database->fetchAll("SELECT * FROM tags ORDER BY name");
        
        return array_map(function($data) use ($database) {
            $tag = new static($database);
            $tag->loadFromArray($data);
            return $tag;
        }, $results);
    }

    public static function findByPost(Database $database, int $postId): array
    {
        $results = $database->fetchAll("
            SELECT t.* FROM tags t
            INNER JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ?
            ORDER BY t.name
        ", [$postId]);
        
        return array_map(function($data) use ($database) {
            $tag = new static($database);
            $tag->loadFromArray($data);
            return $tag;
        }, $results);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->createdAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
    }
}
