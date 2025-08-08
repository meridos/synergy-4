<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\User;
use App\Models\Subscription;
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
        JWTMiddleware::requireAuth();
        
        $users = User::findAll($this->database);
        
        $userArray = array_map(function($user) {
            return $user->toArray();
        }, $users);

        echo json_encode(['users' => $userArray]);
    }

    public function getUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        
        $user = User::findById($this->database, $id);
        $currentUserId = $payload['user_id'];
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        $userPosts = \App\Models\Post::findByUserId($this->database, $id);
        
        if ($currentUserId !== $id) {
            $userPosts = array_filter($userPosts, function($post) {
                return !$post->getRestricted();
            });
        }
        
        $userPostsArray = array_map(function($post) {
            return $post->toArray();
        }, $userPosts);
        
        usort($userPostsArray, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        $isSubscribed = Subscription::isSubscribed($this->database, $currentUserId, $id);
        
        error_log("getUser - Current User ID: $currentUserId, Target User ID: $id, Is Subscribed: " . ($isSubscribed ? 'true' : 'false'));
        
        $subscriberCount = count(Subscription::getSubscribersForUser($this->database, $id));
        $subscriptionCount = count(Subscription::getSubscriptionsForUser($this->database, $id));
        
        error_log("Subscriber count: $subscriberCount, Subscription count: $subscriptionCount");

        echo json_encode([
            'posts' => $userPostsArray,
            'user' => $user->toArray(),
            'is_subscribed' => $isSubscribed,
            'subscriber_count' => $subscriberCount,
            'subscription_count' => $subscriptionCount
        ]);
    }

    public function updateUser(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($user->getId() !== $payload['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Вы можете редактировать только свой профиль']);
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
        
        $user = User::findById($this->database, $id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($user->getId() !== $payload['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Вы можете удалить только свой аккаунт']);
            return;
        }

        if ($user->delete()) {
            echo json_encode(['message' => 'Пользователь успешно удален']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось удалить пользователя']);
        }
    }

    public function getUserPosts(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUserId = $payload['user_id'];
        
        $user = User::findById($this->database, $id);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        $userPosts = \App\Models\Post::findByUserId($this->database, $id);
        
        if ($currentUserId !== $id) {
            $userPosts = array_filter($userPosts, function($post) {
                return !$post->getRestricted();
            });
        }
        
        $userPostsArray = array_map(function($post) {
            return $post->toArray();
        }, $userPosts);
        
        usort($userPostsArray, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        echo json_encode([
            'posts' => $userPostsArray,
            'user' => $user->toArray()
        ]);
    }

    public function subscribe(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUserId = $payload['user_id'];
        
        error_log("Subscribe attempt - Current User ID: $currentUserId, Target User ID: $id");
        
        $userToSubscribeTo = User::findById($this->database, $id);
        if (!$userToSubscribeTo) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        if ($currentUserId === $id) {
            http_response_code(400);
            echo json_encode(['error' => 'Нельзя подписаться на самого себя']);
            return;
        }

        $alreadySubscribed = Subscription::isSubscribed($this->database, $currentUserId, $id);
        error_log("Already subscribed check: " . ($alreadySubscribed ? 'true' : 'false'));
        
        if ($alreadySubscribed) {
            http_response_code(409);
            echo json_encode(['error' => 'Вы уже подписаны на этого пользователя']);
            return;
        }

        $subscription = new Subscription($this->database);
        $subscription->setSubscriberId($currentUserId);
        $subscription->setSubscribedToId($id);

        $saveResult = $subscription->save();
        error_log("Subscription save result: " . ($saveResult ? 'success' : 'failed'));

        if ($saveResult) {
            echo json_encode(['message' => 'Успешно подписались']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось подписаться']);
        }
    }

    public function unsubscribe(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUserId = $payload['user_id'];
        
        error_log("Unsubscribe attempt - Current User ID: $currentUserId, Target User ID: $id");
        
        $userToUnsubscribeFrom = User::findById($this->database, $id);
        if (!$userToUnsubscribeFrom) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
            return;
        }

        $isSubscribed = Subscription::isSubscribed($this->database, $currentUserId, $id);
        error_log("Is subscribed check: " . ($isSubscribed ? 'true' : 'false'));
        
        if (!$isSubscribed) {
            http_response_code(400);
            echo json_encode(['error' => 'Вы не подписаны на этого пользователя']);
            return;
        }

        $deleteResult = Subscription::deleteBySubscriberAndSubscribedTo($this->database, $currentUserId, $id);
        error_log("Delete subscription result: " . ($deleteResult ? 'success' : 'failed'));
        
        if ($deleteResult) {
            echo json_encode(['message' => 'Успешно отписались']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось отписаться']);
        }
    }
}
