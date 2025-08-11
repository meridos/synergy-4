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
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $users = User::findAll($this->database);
        
        $userArray = array_map(function($user) {
            return $user->toArray();
        }, $users);

        echo json_encode(['users' => $userArray]);
    }

    public function getAdmins(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $admins = User::findAdmins($this->database);
        
        $adminArray = array_map(function($admin) {
            return $admin->toArray();
        }, $admins);

        echo json_encode(['admins' => $adminArray]);
    }

    public function getRegularUsers(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $users = User::findUsers($this->database);
        
        $userArray = array_map(function($user) {
            return $user->toArray();
        }, $users);

        echo json_encode(['users' => $userArray]);
    }

    public function getUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        $currentUserId = $payload['user_id'];
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($currentUserId !== $id && (!$currentUser || !$currentUser->isAdmin())) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен']);
            return;
        }

        $purchases = $this->getUserPurchases($id);
        $rentals = $this->getUserRentals($id);

        echo json_encode([
            'user' => $user->toArray(),
            'purchases' => $purchases,
            'rentals' => $rentals
        ]);
    }

    public function updateUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($user->getId() !== $payload['user_id'] && (!$currentUser || !$currentUser->isAdmin())) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен']);
            return;
        }

        if (isset($input['name'])) {
            $user->setName($input['name']);
        }

        if (isset($input['email'])) {
            $existingUser = User::findByEmail($this->database, $input['email']);
            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                http_response_code(409);
                echo json_encode(['error' => 'Этот email уже используется']);
                return;
            }
            $user->setEmail($input['email']);
        }

        if (isset($input['password'])) {
            $user->setPassword($input['password']);
        }

        if (isset($input['role']) && $currentUser && $currentUser->isAdmin()) {
            if (in_array($input['role'], ['user', 'admin'])) {
                $user->setRole($input['role']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Неверная роль. Допустимые значения: user, admin']);
                return;
            }
        }

        if ($user->save()) {
            echo json_encode(['user' => $user->toArray()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось обновить пользователя']);
        }
    }

    public function deleteUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($user->getId() !== $payload['user_id'] && (!$currentUser || !$currentUser->isAdmin())) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен']);
            return;
        }

        if ($user->delete()) {
            echo json_encode(['message' => 'Пользователь успешно удален']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось удалить пользователя']);
        }
    }

    public function getUserPurchases(int $userId): array
    {
        $stmt = $this->database->prepare("
            SELECT p.*, b.title as book_title, b.price as book_price 
            FROM purchases p 
            JOIN books b ON p.book_id = b.id 
            WHERE p.user_id = ? 
            ORDER BY p.purchase_date DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getUserRentals(int $userId): array
    {
        $stmt = $this->database->prepare("
            SELECT r.*, b.title as book_title 
            FROM rentals r 
            JOIN books b ON r.book_id = b.id 
            WHERE r.user_id = ? 
            ORDER BY r.start_date DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getUserPurchaseHistory(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if ($id !== $payload['user_id'] && (!$currentUser || !$currentUser->isAdmin())) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен']);
            return;
        }

        $user = User::findById($this->database, $id);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        $purchases = $this->getUserPurchases($id);

        echo json_encode([
            'user' => $user->toArray(),
            'purchases' => $purchases
        ]);
    }

    public function getUserRentalHistory(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if ($id !== $payload['user_id'] && (!$currentUser || !$currentUser->isAdmin())) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен']);
            return;
        }

        $user = User::findById($this->database, $id);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        $rentals = $this->getUserRentals($id);

        echo json_encode([
            'user' => $user->toArray(),
            'rentals' => $rentals
        ]);
    }

    public function getCurrentUserRentals(): void
    {
        $payload = JWTMiddleware::requireAuth();
        
        $rentals = $this->getUserRentals($payload['user_id']);

        echo json_encode([
            'rentals' => $rentals
        ]);
    }

    public function getCurrentUserPurchases(): void
    {
        $payload = JWTMiddleware::requireAuth();
        
        $purchases = $this->getUserPurchases($payload['user_id']);

        echo json_encode([
            'purchases' => $purchases
        ]);
    }

    public function getOverdueRentals(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }

        $stmt = $this->database->prepare("
            SELECT r.*, u.name as user_name, u.email as user_email, b.title as book_title 
            FROM rentals r 
            JOIN users u ON r.user_id = u.id 
            JOIN books b ON r.book_id = b.id 
            WHERE r.end_date < CURRENT_TIMESTAMP AND r.status = 'active'
            ORDER BY r.end_date ASC
        ");
        $stmt->execute();
        $overdueRentals = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode(['overdue_rentals' => $overdueRentals]);
    }

    public function getExpiringRentals(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }

        $stmt = $this->database->prepare("
            SELECT r.*, u.name as user_name, u.email as user_email, b.title as book_title 
            FROM rentals r 
            JOIN users u ON r.user_id = u.id 
            JOIN books b ON r.book_id = b.id 
            WHERE r.end_date BETWEEN CURRENT_TIMESTAMP AND datetime(CURRENT_TIMESTAMP, '+3 days') 
            AND r.status = 'active'
            ORDER BY r.end_date ASC
        ");
        $stmt->execute();
        $expiringRentals = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode(['expiring_rentals' => $expiringRentals]);
    }

    public function sendRentalReminders(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }

        $stmt = $this->database->prepare("
            SELECT r.*, u.name as user_name, u.email as user_email, b.title as book_title 
            FROM rentals r 
            JOIN users u ON r.user_id = u.id 
            JOIN books b ON r.book_id = b.id 
            WHERE r.end_date BETWEEN CURRENT_TIMESTAMP AND datetime(CURRENT_TIMESTAMP, '+3 days') 
            AND r.status = 'active'
            AND r.id NOT IN (
                SELECT rental_id FROM rental_notifications 
                WHERE notification_type = 'reminder'
            )
            ORDER BY r.end_date ASC
        ");
        $stmt->execute();
        $rentalsToNotify = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $notificationsSent = 0;
        foreach ($rentalsToNotify as $rental) {
            $notificationStmt = $this->database->prepare("
                INSERT INTO rental_notifications (rental_id, notification_type) 
                VALUES (?, 'reminder')
            ");
            if ($notificationStmt->execute([$rental['id']])) {
                $notificationsSent++;
            }
        }

        echo json_encode([
            'message' => "Отправлено {$notificationsSent} напоминаний",
            'notifications_sent' => $notificationsSent,
            'rentals' => $rentalsToNotify
        ]);
    }
}
