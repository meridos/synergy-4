<?php

namespace App\Models;

use App\Database\Database;

class Post
{
    protected $id;
    protected $title;
    protected $content;
    protected $restricted;
    protected $shareToken;
    protected $userId;
    protected $createdAt;
    protected $updatedAt;
    protected $database;
    protected $tags = [];
    protected $user = [];

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getRestricted(): ?bool
    {
        return (bool) $this->restricted;
    }

    public function getShareToken(): ?string
    {
        return $this->shareToken;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    public function getTags(): array
    {
        return $this->tags;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function setContent(string $content): void
    {
        $this->content = $content;
    }

    public function setRestricted(bool $restricted): void
    {
        $this->restricted = $restricted;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function setTags(array $tagNames): void
    {
        $this->tags = [];
        foreach ($tagNames as $tagName) {
            if (!empty(trim($tagName))) {
                $tag = Tag::findOrCreate($this->database, trim($tagName));
                $this->tags[] = $tag;
            }
        }
    }

    public function generateShareToken(): string
    {
        if (!$this->shareToken) {
            $this->shareToken = bin2hex(random_bytes(16));
        }
        return $this->shareToken;
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE posts 
                SET title = ?, content = ?, restricted = ?, share_token = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $result = $stmt->execute([
                $this->title, 
                $this->content, 
                $this->restricted ? 1 : 0,
                $this->shareToken,
                $this->id
            ]);
            
            if ($result) {
                $this->saveTags();
            }
            
            return $result;
        } else {
            if ($this->restricted && !$this->shareToken) {
                $this->generateShareToken();
            }
            
            $stmt = $this->database->prepare("
                INSERT INTO posts (title, content, restricted, share_token, user_id) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $result = $stmt->execute([
                $this->title, 
                $this->content, 
                $this->restricted ? 1 : 0,
                $this->shareToken,
                $this->userId
            ]);
            
            if ($result) {
                $this->id = (int) $this->database->lastInsertId();
                $this->saveTags();
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

        $stmt = $this->database->prepare("DELETE FROM posts WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public static function findById(Database $database, int $id): ?static
    {
        $data = $database->fetch("SELECT * FROM posts WHERE id = ?", [$id]);
        
        if (!$data) {
            return null;
        }

        $post = new static($database);
        $post->loadFromArray($data);
        return $post;
    }

    public static function findAll(Database $database, string $sortBy = 'newest', string $tagFilter = null): array
    {
        $allowedSortColumns = [
            'newest' => ['p.created_at', 'DESC'],
            'oldest' => ['p.created_at', 'ASC'],
            'title' => ['p.title', 'ASC'],
            'titleDesc' => ['p.title', 'DESC'],
        ];
        $sort = $allowedSortColumns[$sortBy] ?? $allowedSortColumns['newest'];
        $tagQuery = '';

        if ($tagFilter) {
            $query = "SELECT p.*
                    FROM posts p 
                    JOIN post_tags t ON t.post_id = p.id
                    WHERE restricted = 0
                    AND t.tag_id = ?
                    ORDER BY {$sort[0]} {$sort[1]}";

            $rows = $database->fetchAll($query, [$tagFilter]);
            return $rows;
        }

        $query = "SELECT p.*
                  FROM posts p 
                  WHERE restricted = 0
                  ORDER BY {$sort[0]} {$sort[1]}";

        $rows = $database->fetchAll($query);

        return $rows;
    }

    public static function findBySubscriptions(Database $database, int $currentUserId = 1, string $sortBy = 'newest', string $tagFilter = null): array
    {
        $allowedSortColumns = [
            'newest' => ['p.created_at', 'DESC'],
            'oldest' => ['p.created_at', 'ASC'],
            'title' => ['p.title', 'ASC'],
            'titleDesc' => ['p.title', 'DESC'],
        ];
        $sort = $allowedSortColumns[$sortBy] ?? $allowedSortColumns['newest'];
        $tagQuery = '';

        if ($tagFilter) {
            $query = "SELECT p.*
                    FROM posts p 
                    JOIN post_tags t ON t.post_id = p.id
                    JOIN subscriptions s ON s.subscribed_to_id = p.user_id
                    WHERE restricted = 0
                    AND t.tag_id = ?
                    AND s.subscriber_id = ?
                    ORDER BY {$sort[0]} {$sort[1]}";

            $rows = $database->fetchAll($query, [$tagFilter, $currentUserId]);
            return $rows;
        }
        
        $query = "SELECT p.*
                  FROM posts p 
                  JOIN subscriptions s ON s.subscribed_to_id = p.user_id
                  WHERE restricted = 0
                  AND s.subscriber_id = ?
                  ORDER BY {$sort[0]} {$sort[1]}";

        $rows = $database->fetchAll($query, [$currentUserId]);

        return $rows;
    }

    public static function findAllForUser(Database $database, int $userId): array
    {
        $rows = $database->fetchAll("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC", [$userId]);
        $posts = [];

        foreach ($rows as $row) {
            $post = new static($database);
            $post->loadFromArray($row);
            $posts[] = $post;
        }

        return $posts;
    }

    public static function findByUserId(Database $database, int $userId): array
    {
        $rows = $database->fetchAll(
            "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
            [$userId]
        );
        $posts = [];

        foreach ($rows as $row) {
            $post = new static($database);
            $post->loadFromArray($row);
            $posts[] = $post;
        }

        return $posts;
    }

    public static function findByShareToken(Database $database, string $token): ?static
    {
        $data = $database->fetch("SELECT * FROM posts WHERE share_token = ?", [$token]);
        
        if (!$data) {
            return null;
        }

        $post = new static($database);
        $post->loadFromArray($data);
        return $post;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'restricted' => (bool) $this->restricted,
            'share_token' => $this->shareToken,
            'user_id' => $this->userId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'tags' => array_map(function($tag) {
                return $tag->toArray();
            }, $this->tags)
        ];
    }

    public function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->title = $data['title'] ?? null;
        $this->content = $data['content'] ?? null;
        $this->restricted = isset($data['restricted']) ? (bool) $data['restricted'] : false;
        $this->shareToken = $data['share_token'] ?? null;
        $this->userId = $data['user_id'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
        $this->updatedAt = $data['updated_at'] ?? null;
        
        if ($this->id) {
            $this->loadTags();
        }
    }

    protected function loadTags(): void
    {
        if ($this->id) {
            $this->tags = Tag::findByPost($this->database, $this->id);
        }
    }

    protected function loadUser(): void
    {
        if ($this->userId) {
            $this->user = User::findById($this->database, $this->userId);
        }
    }

    protected function saveTags(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM post_tags WHERE post_id = ?");
        $stmt->execute([$this->id]);

        if (!empty($this->tags)) {
            $stmt = $this->database->prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)");
            foreach ($this->tags as $tag) {
                $stmt->execute([$this->id, $tag->getId()]);
            }
        }

        return true;
    }
}
