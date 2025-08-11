<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Router;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\BookController;
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
    header('Access-Control-Allow-Origin: https://s-library.bobrovartem.ru');
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

$router->addRoute('GET', '/api/users/admins', function() {
    $controller = new UserController();
    $controller->getAdmins();
});

$router->addRoute('GET', '/api/users/regular', function() {
    $controller = new UserController();
    $controller->getRegularUsers();
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

// User history routes - current user
$router->addRoute('GET', '/api/users/rentals', function() {
    $controller = new UserController();
    $controller->getCurrentUserRentals();
});

$router->addRoute('GET', '/api/users/purchases', function() {
    $controller = new UserController();
    $controller->getCurrentUserPurchases();
});

// User history routes - by ID (admin access)
$router->addRoute('GET', '/api/users/{id}/purchases', function($id) {
    $controller = new UserController();
    $controller->getUserPurchaseHistory((int)$id);
});

$router->addRoute('GET', '/api/users/{id}/rentals', function($id) {
    $controller = new UserController();
    $controller->getUserRentalHistory((int)$id);
});

// Admin rental management routes
$router->addRoute('GET', '/api/admin/rentals/overdue', function() {
    $controller = new UserController();
    $controller->getOverdueRentals();
});

$router->addRoute('GET', '/api/admin/rentals/expiring', function() {
    $controller = new UserController();
    $controller->getExpiringRentals();
});

$router->addRoute('POST', '/api/admin/rentals/send-reminders', function() {
    $controller = new UserController();
    $controller->sendRentalReminders();
});

// Book routes
$router->addRoute('GET', '/api/books', function() {
    $controller = new BookController();
    $controller->getBooks();
});

$router->addRoute('GET', '/api/books/purchase', function() {
    $controller = new BookController();
    $controller->getBooksForPurchase();
});

$router->addRoute('GET', '/api/books/rent', function() {
    $controller = new BookController();
    $controller->getBooksForRent();
});

$router->addRoute('GET', '/api/books/{id}', function($id) {
    $controller = new BookController();
    $controller->getBook((int)$id);
});

$router->addRoute('POST', '/api/books', function() {
    $controller = new BookController();
    $controller->createBook();
});

$router->addRoute('PUT', '/api/books/{id}', function($id) {
    $controller = new BookController();
    $controller->updateBook((int)$id);
});

$router->addRoute('DELETE', '/api/books/{id}', function($id) {
    $controller = new BookController();
    $controller->deleteBook((int)$id);
});

$router->addRoute('POST', '/api/books/{id}/purchase', function($id) {
    $controller = new BookController();
    $controller->purchaseBook((int)$id);
});

$router->addRoute('POST', '/api/books/{id}/rent', function($id) {
    $controller = new BookController();
    $controller->rentBook((int)$id);
});

// Category routes
$router->addRoute('GET', '/api/categories', function() {
    $controller = new BookController();
    $controller->getCategories();
});

// Author routes
$router->addRoute('GET', '/api/authors', function() {
    $controller = new BookController();
    $controller->getAuthors();
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
