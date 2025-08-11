<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\User;
use App\Middleware\JWTMiddleware;

class AuthController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email и пароль обязательны']);
            return;
        }

        $user = User::findByEmail($this->database, $input['email']);
        
        if (!$user || !$user->verifyPassword($input['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Неверные учетные данные']);
            return;
        }

        $token = JWTMiddleware::generateToken([
            'user_id' => $user->getId(),
            'email' => $user->getEmail()
        ]);

        echo json_encode([
            'token' => $token,
            'user' => $user->toArray()
        ]);
    }

    public function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Имя, email и пароль обязательны']);
            return;
        }

        $existingUser = User::findByEmail($this->database, $input['email']);
        if ($existingUser) {
            http_response_code(409);
            echo json_encode(['error' => 'Пользователь с таким email уже существует']);
            return;
        }

        $role = isset($input['isAdmin']) && $input['isAdmin'] === true ? 'admin' : 'user';

        $user = new User($this->database);
        $user->setName($input['name']);
        $user->setEmail($input['email']);
        $user->setPassword($input['password']);
        $user->setRole($role);

        if ($user->save()) {
            $token = JWTMiddleware::generateToken([
                'user_id' => $user->getId(),
                'email' => $user->getEmail()
            ]);

            http_response_code(201);
            echo json_encode([
                'token' => $token,
                'user' => $user->toArray()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось создать пользователя']);
        }
    }

    public function profile(): void
    {
        $payload = JWTMiddleware::requireAuth();
        
        $user = User::findById($this->database, $payload['user_id']);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        echo json_encode(['user' => $user->toArray()]);
    }

    public function logout(): void
    {
        JWTMiddleware::requireAuth();
        
        echo json_encode(['message' => 'Успешно вышли из системы']);
    }
}
