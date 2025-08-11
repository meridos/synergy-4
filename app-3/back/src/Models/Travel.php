<?php

namespace App\Models;

use App\Database\Database;

class Travel
{
    private $id;
    private $userId;
    private $title;
    private $description;
    private $location;
    private $latitude;
    private $longitude;
    private $cost;
    private $startDate;
    private $endDate;
    private $transportationRating;
    private $safetyRating;
    private $populationRating;
    private $natureRating;
    private $createdAt;
    private $updatedAt;
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

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function getCost(): ?float
    {
        return $this->cost;
    }

    public function getStartDate(): ?string
    {
        return $this->startDate;
    }

    public function getEndDate(): ?string
    {
        return $this->endDate;
    }

    public function getTransportationRating(): ?int
    {
        return $this->transportationRating;
    }

    public function getSafetyRating(): ?int
    {
        return $this->safetyRating;
    }

    public function getPopulationRating(): ?int
    {
        return $this->populationRating;
    }

    public function getNatureRating(): ?int
    {
        return $this->natureRating;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    // Setters
    public function setUserId(int $userId): void
    {
        $this->userId = $userId;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function setLocation(string $location): void
    {
        $this->location = $location;
    }

    public function setLatitude(float $latitude): void
    {
        $this->latitude = $latitude;
    }

    public function setLongitude(float $longitude): void
    {
        $this->longitude = $longitude;
    }

    public function setCost(float $cost): void
    {
        $this->cost = $cost;
    }

    public function setStartDate(string $startDate): void
    {
        $this->startDate = $startDate;
    }

    public function setEndDate(string $endDate): void
    {
        $this->endDate = $endDate;
    }

    public function setTransportationRating(int $rating): void
    {
        $this->transportationRating = $rating;
    }

    public function setSafetyRating(int $rating): void
    {
        $this->safetyRating = $rating;
    }

    public function setPopulationRating(int $rating): void
    {
        $this->populationRating = $rating;
    }

    public function setNatureRating(int $rating): void
    {
        $this->natureRating = $rating;
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
            INSERT INTO travels (
                user_id, title, description, location, latitude, longitude, 
                cost, start_date, end_date, transportation_rating, 
                safety_rating, population_rating, nature_rating, created_at, updated_at
            ) VALUES (
                :user_id, :title, :description, :location, :latitude, :longitude,
                :cost, :start_date, :end_date, :transportation_rating,
                :safety_rating, :population_rating, :nature_rating, 
                datetime('now'), datetime('now')
            )
        ";

        $params = [
            ':user_id' => $this->userId,
            ':title' => $this->title,
            ':description' => $this->description,
            ':location' => $this->location,
            ':latitude' => $this->latitude,
            ':longitude' => $this->longitude,
            ':cost' => $this->cost,
            ':start_date' => $this->startDate,
            ':end_date' => $this->endDate,
            ':transportation_rating' => $this->transportationRating,
            ':safety_rating' => $this->safetyRating,
            ':population_rating' => $this->populationRating,
            ':nature_rating' => $this->natureRating
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
            UPDATE travels SET 
                title = :title,
                description = :description,
                location = :location,
                latitude = :latitude,
                longitude = :longitude,
                cost = :cost,
                start_date = :start_date,
                end_date = :end_date,
                transportation_rating = :transportation_rating,
                safety_rating = :safety_rating,
                population_rating = :population_rating,
                nature_rating = :nature_rating,
                updated_at = datetime('now')
            WHERE id = :id
        ";

        $params = [
            ':id' => $this->id,
            ':title' => $this->title,
            ':description' => $this->description,
            ':location' => $this->location,
            ':latitude' => $this->latitude,
            ':longitude' => $this->longitude,
            ':cost' => $this->cost,
            ':start_date' => $this->startDate,
            ':end_date' => $this->endDate,
            ':transportation_rating' => $this->transportationRating,
            ':safety_rating' => $this->safetyRating,
            ':population_rating' => $this->populationRating,
            ':nature_rating' => $this->natureRating
        ];

        try {
            $this->database->execute($query, $params);
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    public static function findById(Database $database, int $id): ?Travel
    {
        $query = "SELECT * FROM travels WHERE id = :id";
        $result = $database->fetch($query, [':id' => $id]);

        if (!$result) {
            return null;
        }

        return self::createFromArray($database, $result);
    }

    public static function findAll(Database $database, array $filters = []): array
    {
        $query = "SELECT * FROM travels";
        $params = [];
        $conditions = [];
        $locationFilter = null;

        if (!empty($filters['user_id'])) {
            $conditions[] = "user_id = :user_id";
            $params[':user_id'] = $filters['user_id'];
        }

        if (!empty($filters['location'])) {
            $locationFilter = mb_strtolower($filters['location'], 'UTF-8');
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        if (!empty($filters['sort_by'])) {
            $allowedSorts = ['title', 'location', 'cost', 'start_date', 'created_at'];
            if (in_array($filters['sort_by'], $allowedSorts)) {
                $sortDirection = 'ASC';
                if (!empty($filters['sort_direction'])) {
                    $allowedDirections = ['asc', 'desc'];
                    if (in_array(strtolower($filters['sort_direction']), $allowedDirections)) {
                        $sortDirection = strtoupper($filters['sort_direction']);
                    }
                }
                $query .= " ORDER BY " . $filters['sort_by'] . " " . $sortDirection;
            }
        } else {
            $query .= " ORDER BY created_at DESC";
        }

        $results = $database->fetchAll($query, $params);
        
        $travels = array_map(function ($row) use ($database) {
            return self::createFromArray($database, $row);
        }, $results);

        if ($locationFilter !== null) {
            $travels = array_filter($travels, function($travel) use ($locationFilter) {
                $travelLocation = mb_strtolower($travel->getLocation() ?: '', 'UTF-8');
                return mb_strpos($travelLocation, $locationFilter, 0, 'UTF-8') !== false;
            });
            $travels = array_values($travels);
        }

        return $travels;
    }

    private static function createFromArray(Database $database, array $data): Travel
    {
        $travel = new self($database);
        $travel->id = $data['id'];
        $travel->userId = $data['user_id'];
        $travel->title = $data['title'];
        $travel->description = $data['description'];
        $travel->location = $data['location'];
        $travel->latitude = $data['latitude'];
        $travel->longitude = $data['longitude'];
        $travel->cost = $data['cost'];
        $travel->startDate = $data['start_date'];
        $travel->endDate = $data['end_date'];
        $travel->transportationRating = $data['transportation_rating'];
        $travel->safetyRating = $data['safety_rating'];
        $travel->populationRating = $data['population_rating'];
        $travel->natureRating = $data['nature_rating'];
        $travel->createdAt = $data['created_at'];
        $travel->updatedAt = $data['updated_at'];

        return $travel;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'cost' => $this->cost,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'transportation_rating' => $this->transportationRating,
            'safety_rating' => $this->safetyRating,
            'population_rating' => $this->populationRating,
            'nature_rating' => $this->natureRating,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $query = "DELETE FROM travels WHERE id = :id";
        
        try {
            $this->database->execute($query, [':id' => $this->id]);
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }
}
