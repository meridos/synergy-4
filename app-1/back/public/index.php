<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Router;
use App\Controllers\AuthController;
use App\Controllers\PostController;
use App\Controllers\UserController;
use App\Controllers\CommentController;
use App\Database\DatabaseFactory;
use App\Middleware\JWTMiddleware;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Initialize JWT middleware
JWTMiddleware::init();

// Set content type to JSON
header('Content-Type: application/json; charset=utf-8');

// Enable CORS - Allow all origins in development environment
$isDev = ($_ENV['APP_ENV'] ?? 'development') === 'development';
if ($isDev) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
} else {
    // Production CORS - restrict to specific origins
    header('Access-Control-Allow-Origin: https://s-blog.bobrovartem.ru');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Initialize database and create tables
try {
    $db = DatabaseFactory::create();
    $db->createTables();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Create router
$router = new Router();

// Health check
$router->addRoute('GET', '/api/health', function() {
    $health = [
        'status' => 'ok',
        'timestamp' => date('c'),
        'version' => '1.0.0',
        'database' => 'connected'
    ];
    
    try {
        DatabaseFactory::create()->getConnection();
    } catch (Exception $e) {
        $health['status'] = 'error';
        $health['database'] = 'disconnected';
        $health['error'] = $e->getMessage();
        http_response_code(503);
    }
    
    echo json_encode($health);
});

// Auth routes
$router->addRoute('POST', '/api/auth/login', function() {
    $controller = new AuthController();
    $controller->login();
});

$router->addRoute('POST', '/api/auth/register', function() {
    $controller = new AuthController();
    $controller->register();
});

$router->addRoute('GET', '/api/auth/profile', function() {
    $controller = new AuthController();
    $controller->profile();
});

$router->addRoute('POST', '/api/auth/logout', function() {
    $controller = new AuthController();
    $controller->logout();
});

// User routes
$router->addRoute('GET', '/api/users', function() {
    $controller = new UserController();
    $controller->getUsers();
});

$router->addRoute('GET', '/api/users/{id}', function($id) {
    $controller = new UserController();
    $controller->getUser((int)$id);
});

$router->addRoute('PUT', '/api/users/{id}', function($id) {
    $controller = new UserController();
    $controller->updateUser((int)$id);
});

$router->addRoute('DELETE', '/api/users/{id}', function($id) {
    $controller = new UserController();
    $controller->deleteUser((int)$id);
});

// Subscription routes
$router->addRoute('POST', '/api/users/{id}/subscribe', function($id) {
    $controller = new UserController();
    $controller->subscribe((int)$id);
});

$router->addRoute('DELETE', '/api/users/{id}/subscribe', function($id) {
    $controller = new UserController();
    $controller->unsubscribe((int)$id);
});

// Post routes
$router->addRoute('GET', '/api/posts', function() {
    $controller = new PostController();
    $controller->getPosts();
});

$router->addRoute('GET', '/api/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->getPost((int)$id);
});

$router->addRoute('POST', '/api/posts', function() {
    $controller = new PostController();
    $controller->createPost();
});

$router->addRoute('PUT', '/api/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->updatePost((int)$id);
});

$router->addRoute('DELETE', '/api/posts/{id}', function($id) {
    $controller = new PostController();
    $controller->deletePost((int)$id);
});

// Share token route (must be before general tag routes)
$router->addRoute('GET', '/api/share/{token}', function($token) {
    $controller = new PostController();
    $controller->getPostByShareToken($token);
});

// Tag routes
$router->addRoute('GET', '/api/tags', function() {
    $controller = new PostController();
    $controller->getTags();
});

// User posts route
$router->addRoute('GET', '/api/users/{id}/posts', function($id) {
    $controller = new UserController();
    $controller->getUserPosts((int)$id);
});

// Comment routes
$router->addRoute('GET', '/api/posts/{id}/comments', function($id) {
    $controller = new CommentController();
    $controller->getPostComments((int)$id);
});

$router->addRoute('POST', '/api/posts/{id}/comments', function($id) {
    $controller = new CommentController();
    $controller->createPostComment((int)$id);
});

// Get request URI and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Dispatch the request
try {
    $router->dispatch($requestMethod, $requestUri);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
