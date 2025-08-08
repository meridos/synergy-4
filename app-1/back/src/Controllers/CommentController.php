<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Middleware\JWTMiddleware;

class CommentController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function getPostComments(int $postId): void
    {
        $post = Post::findById($this->database, $postId);
        
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

        $comments = Comment::findByPostId($this->database, $postId);
        
        $commentsArray = array_map(function($comment) {
            $commentData = $comment->toArray();
            
            $user = User::findById($this->database, $comment->getUserId());
            $commentData['user'] = $user ? [
                'id' => $user->getId(),
                'name' => $user->getName()
            ] : null;
            
            return $commentData;
        }, $comments);

        echo json_encode(['comments' => $commentsArray]);
    }

    public function createPostComment(int $postId): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['content']) || empty(trim($input['content']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Содержание комментария обязательно']);
            return;
        }

        $post = Post::findById($this->database, $postId);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Пост не найден']);
            return;
        }

        if ($post->getRestricted()) {
            if ($post->getUserId() !== $payload['user_id']) {
                http_response_code(404);
                echo json_encode(['error' => 'Пост не найден']);
                return;
            }
        }

        $comment = new Comment($this->database);
        $comment->setPostId($postId);
        $comment->setUserId($payload['user_id']);
        $comment->setContent($input['content']);
        $comment->setCreatedAt();

        if ($comment->save()) {
            $commentData = $comment->toArray();
            
            $user = User::findById($this->database, $comment->getUserId());
            $commentData['user'] = $user ? [
                'id' => $user->getId(),
                'name' => $user->getName(),
            ] : null;
            
            http_response_code(201);
            echo json_encode(['comment' => $commentData]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось создать комментарий']);
        }
    }
}
