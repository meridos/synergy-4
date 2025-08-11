<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\User;
use App\Middleware\JWTMiddleware;

class UserController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function getUsers(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен'], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $users = User::findAll($this->database);
        
        $userArray = array_map(function($user) {
            return $user->toArray();
        }, $users);

        echo json_encode(['users' => $userArray], JSON_UNESCAPED_UNICODE);
    }

    public function getUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        $currentUserId = $payload['user_id'];
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($currentUserId !== $id && !$currentUser) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен'], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'user' => $user->toArray(),
        ], JSON_UNESCAPED_UNICODE);
    }

    public function updateUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($user->getId() !== $payload['user_id'] && !$currentUser) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (isset($input['name'])) {
            $user->setName($input['name']);
        }

        if (isset($input['email'])) {
            $existingUser = User::findByEmail($this->database, $input['email']);
            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                http_response_code(409);
                echo json_encode(['error' => 'Этот email уже используется'], JSON_UNESCAPED_UNICODE);
                return;
            }
            $user->setEmail($input['email']);
        }

        if (isset($input['password'])) {
            $user->setPassword($input['password']);
        }

        if ($user->save()) {
            echo json_encode(['user' => $user->toArray()], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось обновить пользователя'], JSON_UNESCAPED_UNICODE);
        }
    }

    public function deleteUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($user->getId() !== $payload['user_id'] && !$currentUser) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($user->delete()) {
            echo json_encode(['message' => 'Пользователь успешно удален'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось удалить пользователя'], JSON_UNESCAPED_UNICODE);
        }
    }

}
