<?php

namespace App\Models;

use App\Database\Database;

class Subscription
{
    private $id;
    private $subscriberId;
    private $subscribedToId;
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

    public function getSubscriberId(): ?int
    {
        return $this->subscriberId;
    }

    public function getSubscribedToId(): ?int
    {
        return $this->subscribedToId;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setSubscriberId(int $subscriberId): void
    {
        $this->subscriberId = $subscriberId;
    }

    public function setSubscribedToId(int $subscribedToId): void
    {
        $this->subscribedToId = $subscribedToId;
    }

    public function save(): bool
    {
        $stmt = $this->database->prepare("
            INSERT INTO subscriptions (subscriber_id, subscribed_to_id) 
            VALUES (?, ?)
        ");
        $result = $stmt->execute([$this->subscriberId, $this->subscribedToId]);
        
        if ($result) {
            $this->id = (int) $this->database->lastInsertId();
            return true;
        }
        return false;
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM subscriptions WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public static function findBySubscriberAndSubscribedTo(Database $database, int $subscriberId, int $subscribedToId): ?self
    {
        $data = $database->fetch(
            "SELECT * FROM subscriptions WHERE subscriber_id = ? AND subscribed_to_id = ?", 
            [$subscriberId, $subscribedToId]
        );
        
        if (!$data) {
            return null;
        }

        $subscription = new self($database);
        $subscription->loadFromArray($data);
        return $subscription;
    }

    public static function deleteBySubscriberAndSubscribedTo(Database $database, int $subscriberId, int $subscribedToId): bool
    {
        $stmt = $database->prepare("DELETE FROM subscriptions WHERE subscriber_id = ? AND subscribed_to_id = ?");
        return $stmt->execute([$subscriberId, $subscribedToId]);
    }

    public static function getSubscriptionsForUser(Database $database, int $userId): array
    {
        $rows = $database->fetchAll(
            "SELECT subscribed_to_id FROM subscriptions WHERE subscriber_id = ?", 
            [$userId]
        );
        
        return array_column($rows, 'subscribed_to_id');
    }

    public static function getSubscribersForUser(Database $database, int $userId): array
    {
        $rows = $database->fetchAll(
            "SELECT subscriber_id FROM subscriptions WHERE subscribed_to_id = ?", 
            [$userId]
        );
        
        return array_column($rows, 'subscriber_id');
    }

    public static function isSubscribed(Database $database, int $subscriberId, int $subscribedToId): bool
    {
        $data = $database->fetch(
            "SELECT id FROM subscriptions WHERE subscriber_id = ? AND subscribed_to_id = ?", 
            [$subscriberId, $subscribedToId]
        );
        
        return $data !== false;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'subscriber_id' => $this->subscriberId,
            'subscribed_to_id' => $this->subscribedToId,
            'created_at' => $this->createdAt
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = (int) $data['id'];
        $this->subscriberId = (int) $data['subscriber_id'];
        $this->subscribedToId = (int) $data['subscribed_to_id'];
        $this->createdAt = $data['created_at'];
    }
}
