<?php

namespace App\Models;

use App\Database\Database;

class Comment
{
    private $id;
    private $postId;
    private $userId;
    private $content;
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

    public function getPostId(): ?int
    {
        return $this->postId;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setPostId(int $postId): void
    {
        $this->postId = $postId;
    }

    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function setContent(string $content): void
    {
        $this->content = trim($content);
    }

    public function setCreatedAt(): void
    {
        $this->createdAt = date('Y-m-d H:i:s');
    }

    public function set(string $content): void
    {
        $this->content = trim($content);
    }

    public function save(): bool
    {
        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE comments 
                SET content = ? 
                WHERE id = ?
            ");
            return $stmt->execute([$this->content, $this->id]);
        } else {
            $stmt = $this->database->prepare("
                INSERT INTO comments (post_id, user_id, content) 
                VALUES (?, ?, ?)
            ");
            $result = $stmt->execute([$this->postId, $this->userId, $this->content]);
            
            if ($result) {
                $this->id = (int) $this->database->lastInsertId();
                return true;
            }
            return false;
        }
    }

    public static function findByPostId(Database $database, int $postId): array
    {
        $rows = $database->fetchAll("
            SELECT c.*, u.name as user_name, u.email as user_email 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        ", [$postId]);
        
        $comments = [];
        foreach ($rows as $row) {
            $comment = new self($database);
            $comment->loadFromArray($row);
            $comments[] = $comment;
        }

        return $comments;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->postId,
            'user_id' => $this->userId,
            'content' => $this->content,
            'created_at' => $this->createdAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->postId = $data['post_id'] ?? null;
        $this->userId = $data['user_id'] ?? null;
        $this->content = $data['content'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
    }
}
