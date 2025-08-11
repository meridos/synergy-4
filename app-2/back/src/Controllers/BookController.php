<?php

namespace App\Controllers;

use App\Database\DatabaseFactory;
use App\Models\Book;
use App\Models\Category;
use App\Models\Author;
use App\Models\User;
use App\Middleware\JWTMiddleware;

class BookController
{
    private $database;

    public function __construct()
    {
        $this->database = DatabaseFactory::create();
    }

    public function getBooks(): void
    {
        JWTMiddleware::requireAuth();
        
        $filters = [];
        
        if (isset($_GET['category_id'])) {
            $filters['category_id'] = (int) $_GET['category_id'];
        }
        
        if (isset($_GET['category_id'])) {
            $filters['category_id'] = (int) $_GET['category_id'];
        }
        
        if (isset($_GET['author_id'])) {
            $filters['author_id'] = (int) $_GET['author_id'];
        }
        
        if (isset($_GET['sort_by'])) {
            $filters['sort_by'] = $_GET['sort_by'];
        }
        
        $books = Book::findAll($this->database, $filters);
        
        $bookArray = array_map(function($book) {
            return $book->toArray();
        }, $books);

        echo json_encode(['books' => $bookArray]);
    }

    public function getBook(int $id): void
    {
        JWTMiddleware::requireAuth();
        
        $book = Book::findById($this->database, $id);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(['error' => 'Книга не найдена']);
            return;
        }

        echo json_encode(['book' => $book->toArray()]);
    }

    public function createBook(): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['publication_year']) || !isset($input['price'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Обязательные поля: title, publication_year, price']);
            return;
        }

        $book = new Book($this->database);
        $book->setTitle($input['title']);
        $book->setDescription($input['description'] ?? null);
        $book->setPublicationYear((int) $input['publication_year']);
        $book->setPrice((float) $input['price']);
        $book->setRentalPrice2weeks((float) ($input['rental_price_2weeks'] ?? 0));
        $book->setRentalPrice1month((float) ($input['rental_price_1month'] ?? 0));
        $book->setRentalPrice3months((float) ($input['rental_price_3months'] ?? 0));
        $book->setStockQuantity((int) ($input['stock_quantity'] ?? 0));
        $book->setAvailableForRent($input['available_for_rent'] ?? true);
        $book->setAvailableForPurchase($input['available_for_purchase'] ?? true);
        $book->setStatus($input['status'] ?? 'active');
        $book->setAuthor($input['author'] ?? null);
        $book->setCategory($input['category'] ?? null);

        if ($book->save()) {
            echo json_encode(['book' => $book->toArray()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось создать книгу']);
        }
    }

    public function updateBook(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $book = Book::findById($this->database, $id);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(['error' => 'Книга не найдена']);
            return;
        }

        if (isset($input['title'])) {
            $book->setTitle($input['title']);
        }
        
        if (isset($input['description'])) {
            $book->setDescription($input['description']);
        }
        
        if (isset($input['publication_year'])) {
            $book->setPublicationYear((int) $input['publication_year']);
        }
        
        if (isset($input['price'])) {
            $book->setPrice((float) $input['price']);
        }
        
        if (isset($input['rental_price_2weeks'])) {
            $book->setRentalPrice2weeks((float) $input['rental_price_2weeks']);
        }
        
        if (isset($input['rental_price_1month'])) {
            $book->setRentalPrice1month((float) $input['rental_price_1month']);
        }
        
        if (isset($input['rental_price_3months'])) {
            $book->setRentalPrice3months((float) $input['rental_price_3months']);
        }
        
        if (isset($input['stock_quantity'])) {
            $book->setStockQuantity((int) $input['stock_quantity']);
        }
        
        if (isset($input['available_for_rent'])) {
            $book->setAvailableForRent((bool) $input['available_for_rent']);
        }
        
        if (isset($input['available_for_purchase'])) {
            $book->setAvailableForPurchase((bool) $input['available_for_purchase']);
        }
        
        if (isset($input['status'])) {
            $book->setStatus($input['status']);
        }
        
        if (isset($input['category'])) {
            $book->setCategory($input['category']);
        }
        
        if (isset($input['author'])) {
            $book->setAuthor($input['author']);
        }

        if ($book->save()) {
            echo json_encode(['book' => $book->toArray()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось обновить книгу']);
        }
    }

    public function deleteBook(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $currentUser = User::findById($this->database, $payload['user_id']);
        
        if (!$currentUser || !$currentUser->isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещен. Требуются права администратора']);
            return;
        }
        
        $book = Book::findById($this->database, $id);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(['error' => 'Книга не найдена']);
            return;
        }

        if ($book->delete()) {
            echo json_encode(['message' => 'Книга успешно удалена']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось удалить книгу']);
        }
    }

    public function purchaseBook(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $book = Book::findById($this->database, $id);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(['error' => 'Книга не найдена']);
            return;
        }

        if (!$book->getAvailableForPurchase()) {
            http_response_code(400);
            echo json_encode(['error' => 'Книга недоступна для покупки']);
            return;
        }

        if ($book->getStockQuantity() <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Книга отсутствует на складе']);
            return;
        }

        $quantity = (int) ($input['quantity'] ?? 1);
        
        if ($quantity > $book->getStockQuantity()) {
            http_response_code(400);
            echo json_encode(['error' => 'Недостаточно книг на складе']);
            return;
        }

        $totalPrice = $book->getPrice() * $quantity;

        $stmt = $this->database->prepare("
            INSERT INTO purchases (user_id, book_id, quantity, price) 
            VALUES (?, ?, ?, ?)
        ");
        $result = $stmt->execute([$payload['user_id'], $id, $quantity, $totalPrice]);

        if ($result) {
            // Update stock quantity
            $book->setStockQuantity($book->getStockQuantity() - $quantity);
            $book->save();

            echo json_encode([
                'message' => 'Книга успешно куплена',
                'purchase_id' => $this->database->lastInsertId(),
                'total_price' => $totalPrice
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось оформить покупку']);
        }
    }

    public function rentBook(int $id): void
    {
        $payload = JWTMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $book = Book::findById($this->database, $id);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(['error' => 'Книга не найдена']);
            return;
        }

        if (!$book->getAvailableForRent()) {
            http_response_code(400);
            echo json_encode(['error' => 'Книга недоступна для аренды']);
            return;
        }

        if ($book->getStockQuantity() <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Книга отсутствует на складе']);
            return;
        }

        $rentalPeriod = $input['rental_period'] ?? '';
        $rentalPrice = 0;
        $endDate = '';

        switch ($rentalPeriod) {
            case '2weeks':
                $rentalPrice = $book->getRentalPrice2weeks();
                $endDate = date('Y-m-d H:i:s', strtotime('+2 weeks'));
                break;
            case '1month':
                $rentalPrice = $book->getRentalPrice1month();
                $endDate = date('Y-m-d H:i:s', strtotime('+1 month'));
                break;
            case '3months':
                $rentalPrice = $book->getRentalPrice3months();
                $endDate = date('Y-m-d H:i:s', strtotime('+3 months'));
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Неверный период аренды. Допустимые значения: 2weeks, 1month, 3months']);
                return;
        }

        $stmt = $this->database->prepare("
            INSERT INTO rentals (user_id, book_id, rental_period, rental_price, end_date) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $result = $stmt->execute([$payload['user_id'], $id, $rentalPeriod, $rentalPrice, $endDate]);

        if ($result) {
            // Update stock quantity
            $book->setStockQuantity($book->getStockQuantity() - 1);
            $book->save();

            echo json_encode([
                'message' => 'Книга успешно арендована',
                'rental_id' => $this->database->lastInsertId(),
                'rental_price' => $rentalPrice,
                'end_date' => $endDate
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось оформить аренду']);
        }
    }

    public function getCategories(): void
    {
        JWTMiddleware::requireAuth();
        
        $categories = Category::findAll($this->database);
        
        $categoryArray = array_map(function($category) {
            return $category->toArray();
        }, $categories);

        echo json_encode(['categories' => $categoryArray]);
    }

    public function getAuthors(): void
    {
        JWTMiddleware::requireAuth();
        
        $authors = Author::findAll($this->database);
        
        $authorArray = array_map(function($author) {
            return $author->toArray();
        }, $authors);

        echo json_encode(['authors' => $authorArray]);
    }

    public function getBooksForPurchase(): void
    {
        JWTMiddleware::requireAuth();
        
        $books = Book::findAvailableForPurchase($this->database);
        
        $bookArray = array_map(function($book) {
            return $book->toArray();
        }, $books);

        echo json_encode(['books' => $bookArray]);
    }

    public function getBooksForRent(): void
    {
        JWTMiddleware::requireAuth();
        
        $books = Book::findAvailableForRent($this->database);
        
        $bookArray = array_map(function($book) {
            return $book->toArray();
        }, $books);

        echo json_encode(['books' => $bookArray]);
    }
}
