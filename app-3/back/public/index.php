<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Router;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\TravelController;
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
    header('Access-Control-Allow-Origin: https://s-travel.bobrovartem.ru');
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
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
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
    
    echo json_encode($health, JSON_UNESCAPED_UNICODE);
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

// Travel routes
$router->addRoute('GET', '/api/travels', function() {
    $controller = new TravelController();
    $controller->getTravels();
});

$router->addRoute('GET', '/api/travels/my', function() {
    $controller = new TravelController();
    $controller->getMyTravels();
});

$router->addRoute('GET', '/api/travels/{id}', function($id) {
    $controller = new TravelController();
    $controller->getTravel($id);
});

$router->addRoute('POST', '/api/travels', function() {
    $controller = new TravelController();
    $controller->createTravel();
});

$router->addRoute('PUT', '/api/travels/{id}', function($id) {
    $controller = new TravelController();
    $controller->updateTravel($id);
});

$router->addRoute('DELETE', '/api/travels/{id}', function($id) {
    $controller = new TravelController();
    $controller->deleteTravel($id);
});

$router->addRoute('POST', '/api/travels/{travel_id}/places', function($travelId) {
    $controller = new TravelController();
    $controller->addPlace($travelId);
});

// Get request URI and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Dispatch the request
try {
    $router->dispatch($requestMethod, $requestUri);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
