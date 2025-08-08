<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\Post;
use App\Models\Tag;
use App\Middleware\JWTMiddleware;

class PostController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function getPosts(): void
    {
        $tagFilter = $_GET['tag'] ?? null;
        $isSubscriptionsFilter = $_GET['isSubscriptions'] ?? null;
        $sortBy = $_GET['sortBy'] ?? 'newest';
        $currentUserId = null;
        
        try {
            $payload = JWTMiddleware::getPayload();
            $currentUserId = $payload['user_id'] ?? null;
        } catch (Exception $e) {
        }

        if ($isSubscriptionsFilter === 'true' && $currentUserId) {
            $posts = Post::findBySubscriptions($this->database, $currentUserId, $sortBy, $tagFilter);
        } else {
            $posts = Post::findAll($this->database, $sortBy, $tagFilter);
        }


        $postsArray = array_map(function($data) {
            $post = new Post($this->database);
            $post->loadFromArray($data);

            $user = \App\Models\User::findById($this->database, $post->getUserId());

            $postArray = $post->toArray();

            $postArray['user'] = $user ? [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail()
            ] : null;
            $postArray['share_token'] = null;

            return $postArray;
        }, $posts);


        echo json_encode($postsArray);
    }

    public function getPost(int $id): void
    {
        $post = Post::findById($this->database, $id);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Пост не найден']);
            return;
        }

        if ($post->getRestricted()) {
            try {
                $payload = JWTMiddleware::requireAuth();
                if ($post->getUserId() !== $payload['user_id']) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Пост не найден']);
                    return;
                }
            } catch (Exception $e) {
                http_response_code(404);
                echo json_encode(['error' => 'Пост не найден']);
                return;
            }
        }

        $postArray = $post->toArray();
        
        $user = \App\Models\User::findById($this->database, $post->getUserId());
        $postArray['user'] = $user ? [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail()
        ] : null;

        echo json_encode($postArray);
    }

    public function getPostByShareToken(string $token): void
    {
        try {
            $post = Post::findByShareToken($this->database, $token);
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(['error' => 'Пост не найден или токен недействителен']);
                return;
            }
            
            $postArray = $post->toArray();
            
            $user = \App\Models\User::findById($this->database, $post->getUserId());
            $postArray['user'] = $user ? [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail()
            ] : null;

            echo json_encode($postArray);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось получить пост: ' . $e->getMessage()]);
        }
    }

    public function createPost(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Заголовок и содержание обязательны']);
            return;
        }

        $post = new Post($this->database);

        $post->setTitle($input['title']);
        $post->setContent($input['content']);
        $post->setRestricted($input['restricted'] ?? false);
        $post->setUserId($payload['user_id']);
        
        if (isset($input['tags']) && is_array($input['tags'])) {
            $post->setTags($input['tags']);
        }

        if ($post->save()) {
            http_response_code(201);
            echo json_encode(['post' => $post->toArray()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось создать пост']);
        }
    }

    public function updatePost(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $post = Post::findById($this->database, $id);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Пост не найден']);
            return;
        }

        if ($post->getUserId() !== $payload['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Вы можете редактировать только свои посты']);
            return;
        }

        if (isset($input['title'])) {
            $post->setTitle($input['title']);
        }
        
        if (isset($input['content'])) {
            $post->setContent($input['content']);
        }

        if (isset($input['restricted'])) {
            $post->setRestricted($input['restricted']);
            if ($input['restricted'] && !$post->getShareToken()) {
                $post->generateShareToken();
            }
        } else {
            $post->setShareToken(null);
        }

        if (isset($input['tags']) && is_array($input['tags'])) {
            $post->setTags($input['tags']);
        }

        if ($post->save()) {
            echo json_encode(['post' => $post->toArray()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось обновить пост']);
        }
    }

    public function deletePost(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        
        $post = Post::findById($this->database, $id);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Пост не найден']);
            return;
        }

        if ($post->getUserId() !== $payload['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Вы можете удалять только свои посты']);
            return;
        }

        if ($post->delete()) {
            echo json_encode(['message' => 'Пост успешно удален']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось удалить пост']);
        }
    }

    public function getTags(): void
    {
        $tagsWithCounts = $this->database->fetchAll("
            SELECT t.*, COUNT(pt.post_id) as post_count
            FROM tags t
            LEFT JOIN post_tags pt ON t.id = pt.tag_id
            LEFT JOIN posts p ON pt.post_id = p.id
            GROUP BY t.id, t.name, t.created_at
            ORDER BY t.name
        ");
        
        $tags = array_map(function($data) {
            return [
                'id' => (int)$data['id'],
                'name' => $data['name'],
                'created_at' => $data['created_at'],
                'post_count' => (int)$data['post_count']
            ];
        }, $tagsWithCounts);

        echo json_encode(['tags' => $tags]);
    }
}
