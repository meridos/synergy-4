<?php

namespace App\Models;

use App\Database\Database;

class PlaceToVisit
{
    private $id;
    private $travelId;
    private $name;
    private $description;
    private $latitude;
    private $longitude;
    private $visited;
    private $createdAt;
    private $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTravelId(): ?int
    {
        return $this->travelId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function getVisited(): ?bool
    {
        return $this->visited;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    // Setters
    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function setTravelId(int $travelId): void
    {
        $this->travelId = $travelId;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function setLatitude(float $latitude): void
    {
        $this->latitude = $latitude;
    }

    public function setLongitude(float $longitude): void
    {
        $this->longitude = $longitude;
    }

    public function setVisited(bool $visited): void
    {
        $this->visited = $visited;
    }

    public function save(): bool
    {
        if ($this->id) {
            return $this->update();
        } else {
            return $this->create();
        }
    }

    private function create(): bool
    {
        $query = "
            INSERT INTO places_to_visit (
                travel_id, name, description, latitude, longitude, 
                visited, created_at
            ) VALUES (
                :travel_id, :name, :description, :latitude, :longitude,
                :visited, datetime('now')
            )
        ";

        $params = [
            ':travel_id' => $this->travelId,
            ':name' => $this->name,
            ':description' => $this->description,
            ':latitude' => $this->latitude,
            ':longitude' => $this->longitude,
            ':visited' => $this->visited ? 1 : 0
        ];

        try {
            $this->database->execute($query, $params);
            $this->id = $this->database->lastInsertId();
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    private function update(): bool
    {
        $query = "
            UPDATE places_to_visit SET 
                name = :name,
                description = :description,
                latitude = :latitude,
                longitude = :longitude,
                visited = :visited
            WHERE id = :id
        ";

        $params = [
            ':id' => $this->id,
            ':name' => $this->name,
            ':description' => $this->description,
            ':latitude' => $this->latitude,
            ':longitude' => $this->longitude,
            ':visited' => $this->visited ? 1 : 0
        ];

        try {
            $this->database->execute($query, $params);
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    public static function findByTravelId(Database $database, int $travelId): array
    {
        $query = "SELECT * FROM places_to_visit WHERE travel_id = :travel_id ORDER BY created_at";
        $results = $database->fetchAll($query, [':travel_id' => $travelId]);
        
        return array_map(function ($row) use ($database) {
            return self::createFromArray($database, $row);
        }, $results);
    }

    public static function findById(Database $database, int $id): ?PlaceToVisit
    {
        $query = "SELECT * FROM places_to_visit WHERE id = :id";
        $result = $database->fetch($query, [':id' => $id]);

        if (!$result) {
            return null;
        }

        return self::createFromArray($database, $result);
    }

    private static function createFromArray(Database $database, array $data): PlaceToVisit
    {
        $place = new self($database);
        $place->id = $data['id'];
        $place->travelId = $data['travel_id'];
        $place->name = $data['name'];
        $place->description = $data['description'];
        $place->latitude = $data['latitude'];
        $place->longitude = $data['longitude'];
        $place->visited = (bool) $data['visited'];
        $place->createdAt = $data['created_at'];

        return $place;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'travel_id' => $this->travelId,
            'name' => $this->name,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'visited' => $this->visited,
            'created_at' => $this->createdAt
        ];
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $query = "DELETE FROM places_to_visit WHERE id = :id";
        
        try {
            $this->database->execute($query, [':id' => $this->id]);
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }
}
