<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\Travel;
use App\Models\PlaceToVisit;
use App\Models\User;
use App\Middleware\JWTMiddleware;

class TravelController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function getTravels(): void
    {
        JWTMiddleware::requireAuth();
        
        $filters = [];
        
        if (isset($_GET['location'])) {
            $filters['location'] = urldecode($_GET['location']);
        }
        
        if (isset($_GET['sort_by'])) {
            $filters['sort_by'] = $_GET['sort_by'];
        }

        if (isset($_GET['sort_direction'])) {
            $filters['sort_direction'] = $_GET['sort_direction'];
        }

        $travels = Travel::findAll($this->database, $filters);
        
        $travelsArray = array_map(function($travel) {
            $travelData = $travel->toArray();
            $travelData['places'] = array_map(function($place) {
                return $place->toArray();
            }, PlaceToVisit::findByTravelId($this->database, $travel->getId()));
            
            return $travelData;
        }, $travels);

        echo json_encode(['travels' => $travelsArray], JSON_UNESCAPED_UNICODE);
    }

    public function getMyTravels(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $userId = $payload['user_id'];
        
        $filters = ['user_id' => $userId];
        
        if (isset($_GET['location'])) {
            $filters['location'] = urldecode($_GET['location']);
        }
        
        if (isset($_GET['sort_by'])) {
            $filters['sort_by'] = $_GET['sort_by'];
        }

        if (isset($_GET['sort_direction'])) {
            $filters['sort_direction'] = $_GET['sort_direction'];
        }

        $travels = Travel::findAll($this->database, $filters);
        
        $travelsArray = array_map(function($travel) {
            $travelData = $travel->toArray();
            $travelData['places'] = array_map(function($place) {
                return $place->toArray();
            }, PlaceToVisit::findByTravelId($this->database, $travel->getId()));
            
            return $travelData;
        }, $travels);

        echo json_encode(['travels' => $travelsArray], JSON_UNESCAPED_UNICODE);
    }

    public function getTravel($id = null): void
    {
        JWTMiddleware::requireAuth();
        
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Travel ID is required'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $travel = Travel::findById($this->database, (int) $id);
        
        if (!$travel) {
            http_response_code(404);
            echo json_encode(['error' => 'Travel not found'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $travelData = $travel->toArray();
        $travelData['places'] = array_map(function($place) {
            return $place->toArray();
        }, PlaceToVisit::findByTravelId($this->database, $travel->getId()));

        echo json_encode(['travel' => $travelData], JSON_UNESCAPED_UNICODE);
    }

    public function createTravel(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $userId = $payload['user_id'];
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $requiredFields = ['title', 'location'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"], JSON_UNESCAPED_UNICODE);
                return;
            }
        }

        $travel = new Travel($this->database);
        $travel->setUserId($userId);
        $travel->setTitle($input['title']);
        $travel->setDescription($input['description'] ?? '');
        $travel->setLocation($input['location']);
        
        if (isset($input['latitude'])) {
            $travel->setLatitude((float) $input['latitude']);
        }
        
        if (isset($input['longitude'])) {
            $travel->setLongitude((float) $input['longitude']);
        }
        
        if (isset($input['cost'])) {
            $travel->setCost((float) $input['cost']);
        }
        
        if (isset($input['start_date'])) {
            $travel->setStartDate($input['start_date']);
        }
        
        if (isset($input['end_date'])) {
            $travel->setEndDate($input['end_date']);
        }
        
        if (isset($input['transportation_rating'])) {
            $travel->setTransportationRating((int) $input['transportation_rating']);
        }
        
        if (isset($input['safety_rating'])) {
            $travel->setSafetyRating((int) $input['safety_rating']);
        }
        
        if (isset($input['population_rating'])) {
            $travel->setPopulationRating((int) $input['population_rating']);
        }
        
        if (isset($input['nature_rating'])) {
            $travel->setNatureRating((int) $input['nature_rating']);
        }

        if ($travel->save()) {
            if (isset($input['places']) && is_array($input['places'])) {
                foreach ($input['places'] as $placeData) {
                    if (!empty($placeData['name'])) {
                        $place = new PlaceToVisit($this->database);
                        $place->setTravelId($travel->getId());
                        $place->setName($placeData['name']);
                        $place->setDescription($placeData['description'] ?? '');
                        
                        if (isset($placeData['latitude'])) {
                            $place->setLatitude((float) $placeData['latitude']);
                        }
                        
                        if (isset($placeData['longitude'])) {
                            $place->setLongitude((float) $placeData['longitude']);
                        }
                        
                        $place->setVisited($placeData['visited'] ?? false);
                        $place->save();
                    }
                }
            }

            $travelData = $travel->toArray();
            $travelData['places'] = array_map(function($place) {
                return $place->toArray();
            }, PlaceToVisit::findByTravelId($this->database, $travel->getId()));

            echo json_encode(['travel' => $travelData], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create travel'], JSON_UNESCAPED_UNICODE);
        }
    }

    public function updateTravel($id = null): void
    {
        $payload = JWTMiddleware::requireAuth();
        $userId = $payload['user_id'];
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Travel ID is required'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $travel = Travel::findById($this->database, (int) $id);
        
        if (!$travel) {
            http_response_code(404);
            echo json_encode(['error' => 'Travel not found'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($travel->getUserId() !== $userId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (isset($input['title'])) {
            $travel->setTitle($input['title']);
        }
        
        if (isset($input['description'])) {
            $travel->setDescription($input['description']);
        }
        
        if (isset($input['location'])) {
            $travel->setLocation($input['location']);
        }
        
        if (isset($input['latitude'])) {
            $travel->setLatitude((float) $input['latitude']);
        }
        
        if (isset($input['longitude'])) {
            $travel->setLongitude((float) $input['longitude']);
        }
        
        if (isset($input['cost'])) {
            $travel->setCost((float) $input['cost']);
        }
        
        if (isset($input['start_date'])) {
            $travel->setStartDate($input['start_date']);
        }
        
        if (isset($input['end_date'])) {
            $travel->setEndDate($input['end_date']);
        }
        
        if (isset($input['transportation_rating'])) {
            $travel->setTransportationRating((int) $input['transportation_rating']);
        }
        
        if (isset($input['safety_rating'])) {
            $travel->setSafetyRating((int) $input['safety_rating']);
        }
        
        if (isset($input['population_rating'])) {
            $travel->setPopulationRating((int) $input['population_rating']);
        }
        
        if (isset($input['nature_rating'])) {
            $travel->setNatureRating((int) $input['nature_rating']);
        }

        if ($travel->save()) {
            $travelData = $travel->toArray();

            if (isset($input['places']) && is_array($input['places'])) {
                foreach ($input['places'] as $placeData) {
                    if (!empty($placeData['isRemoved']) && $placeData['isRemoved'] === true) {
                        $place = new PlaceToVisit($this->database);
                        $place->setTravelId($travel->getId());
                        $place->setId($placeData['id']);
                        $place->delete();

                        continue;
                    }

                    if (!empty($placeData['name'])) {
                        $place = new PlaceToVisit($this->database);
                        if (!empty($placeData['id'])) {
                            $place->setId($placeData['id']);
                        }
                        $place->setTravelId($travel->getId());
                        $place->setName($placeData['name']);
                        $place->setDescription($placeData['description'] ?? '');
                        
                        if (isset($placeData['latitude'])) {
                            $place->setLatitude((float) $placeData['latitude']);
                        }
                        
                        if (isset($placeData['longitude'])) {
                            $place->setLongitude((float) $placeData['longitude']);
                        }
                        
                        $place->setVisited($placeData['visited'] ?? false);
                        $place->save();
                    }
                }
            }

            $travelData['places'] = array_map(function($place) {
                return $place->toArray();
            }, PlaceToVisit::findByTravelId($this->database, $travel->getId()));

            echo json_encode(['travel' => $travelData], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update travel'], JSON_UNESCAPED_UNICODE);
        }
    }

    public function deleteTravel($id = null): void
    {
        $payload = JWTMiddleware::requireAuth();
        $userId = $payload['user_id'];
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Travel ID is required'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $travel = Travel::findById($this->database, (int) $id);
        
        if (!$travel) {
            http_response_code(404);
            echo json_encode(['error' => 'Travel not found'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($travel->getUserId() !== $userId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($travel->delete()) {
            echo json_encode(['message' => 'Travel deleted successfully'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete travel'], JSON_UNESCAPED_UNICODE);
        }
    }

    public function addPlace($travelId = null): void
    {
        $payload = JWTMiddleware::requireAuth();
        $userId = $payload['user_id'];
        
        if (!$travelId) {
            http_response_code(400);
            echo json_encode(['error' => 'Travel ID is required'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $travel = Travel::findById($this->database, (int) $travelId);
        
        if (!$travel) {
            http_response_code(404);
            echo json_encode(['error' => 'Travel not found'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($travel->getUserId() !== $userId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Place name is required'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $place = new PlaceToVisit($this->database);
        $place->setTravelId((int) $travelId);
        $place->setName($input['name']);
        $place->setDescription($input['description'] ?? '');
        
        if (isset($input['latitude'])) {
            $place->setLatitude((float) $input['latitude']);
        }
        
        if (isset($input['longitude'])) {
            $place->setLongitude((float) $input['longitude']);
        }
        
        $place->setVisited($input['visited'] ?? false);

        if ($place->save()) {
            echo json_encode(['place' => $place->toArray()], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add place'], JSON_UNESCAPED_UNICODE);
        }
    }
}
