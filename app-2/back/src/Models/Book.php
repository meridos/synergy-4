<?php

namespace App\Models;

use App\Database\Database;

class Book
{
    private $id;
    private $title;
    private $description;
    private $publicationYear;
    private $price;
    private $rentalPrice2weeks;
    private $rentalPrice1month;
    private $rentalPrice3months;
    private $stockQuantity;
    private $availableForRent;
    private $availableForPurchase;
    private $status;
    private $categoryId;
    private $category;
    private $author;
    private $authorId;
    private $createdAt;
    private $updatedAt;
    private $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getPublicationYear(): ?int
    {
        return $this->publicationYear;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function getRentalPrice2weeks(): ?float
    {
        return $this->rentalPrice2weeks;
    }

    public function getRentalPrice1month(): ?float
    {
        return $this->rentalPrice1month;
    }

    public function getRentalPrice3months(): ?float
    {
        return $this->rentalPrice3months;
    }

    public function getStockQuantity(): ?int
    {
        return $this->stockQuantity;
    }

    public function getAvailableForRent(): ?bool
    {
        return (bool) $this->availableForRent;
    }

    public function getAvailableForPurchase(): ?bool
    {
        return (bool) $this->availableForPurchase;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    public function getAuthorId(): ?int
    {
        return $this->authorId;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
    }

    // Setters
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function setPublicationYear(int $publicationYear): void
    {
        $this->publicationYear = $publicationYear;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function setRentalPrice2weeks(float $price): void
    {
        $this->rentalPrice2weeks = $price;
    }

    public function setRentalPrice1month(float $price): void
    {
        $this->rentalPrice1month = $price;
    }

    public function setRentalPrice3months(float $price): void
    {
        $this->rentalPrice3months = $price;
    }

    public function setStockQuantity(int $quantity): void
    {
        $this->stockQuantity = $quantity;
    }

    public function setAvailableForRent(bool $available): void
    {
        $this->availableForRent = $available;
    }

    public function setAvailableForPurchase(bool $available): void
    {
        $this->availableForPurchase = $available;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function setAuthor(string $author = null): void
    {
        $this->author = $author;
    }
    public function setCategory(string $category = null): void
    {
        $this->category = $category;
    }

    public function save(): bool
    {
        if ($this->author) {
            $author = new Author($this->database);
            $author->setName($this->author);
            $author->save();
            $this->authorId = $author->getId();
        }

        if ($this->category) {
            $category = new Category($this->database);
            $category->setName($this->category);
            $category->save();
            $this->categoryId = $category->getId();
        }

        if ($this->id) {
            $stmt = $this->database->prepare("
                UPDATE books 
                SET title = ?, description = ?, publication_year = ?, price = ?, 
                    rental_price_2weeks = ?, rental_price_1month = ?, rental_price_3months = ?,
                    stock_quantity = ?, available_for_rent = ?, available_for_purchase = ?,
                    status = ?, category_id = ?, author_id = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            return $stmt->execute([
                $this->title, $this->description, $this->publicationYear, $this->price,
                $this->rentalPrice2weeks, $this->rentalPrice1month, $this->rentalPrice3months,
                $this->stockQuantity, $this->availableForRent ? 1 : 0, $this->availableForPurchase ? 1 : 0,
                $this->status, $this->categoryId, $this->authorId, $this->id
            ]);
        } else {
            $stmt = $this->database->prepare("
                INSERT INTO books (title, description, publication_year, price, 
                                 rental_price_2weeks, rental_price_1month, rental_price_3months,
                                 stock_quantity, available_for_rent, available_for_purchase,
                                 status, category_id, author_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $result = $stmt->execute([
                $this->title, $this->description, $this->publicationYear, $this->price,
                $this->rentalPrice2weeks, $this->rentalPrice1month, $this->rentalPrice3months,
                $this->stockQuantity ?? 0, $this->availableForRent ? 1 : 0, $this->availableForPurchase ? 1 : 0,
                $this->status ?? 'active', $this->categoryId, $this->authorId
            ]);
            
            if ($result) {
                $this->id = (int) $this->database->lastInsertId();
                return true;
            }
            return false;
        }
    }

    public static function findById(Database $database, int $id): ?self
    {
        $data = $database->fetch("
            SELECT b.*, c.name as category_name, a.name as author_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN authors a ON b.author_id = a.id 
            WHERE b.id = ?
        ", [$id]);
        
        if (!$data) {
            return null;
        }

        $book = new self($database);
        $book->loadFromArray($data);
        return $book;
    }

    public static function findAll(Database $database, array $filters = []): array
    {
        $where = ["b.status != 'discontinued'"];
        $params = [];
        
        if (!empty($filters['category_id'])) {
            $where[] = "b.category_id = ?";
            $params[] = $filters['category_id'];
        }
        
        if (!empty($filters['author_id'])) {
            $where[] = "b.author_id = ?";
            $params[] = $filters['author_id'];
        }
        
        if (!empty($filters['status'])) {
            $where[] = "b.status = ?";
            $params[] = $filters['status'];
        }
        
        $orderBy = "b.title ASC";
        if (!empty($filters['sort_by'])) {
            switch ($filters['sort_by']) {
                case 'title':
                    $orderBy = "b.title ASC";
                    break;
                case 'title_desc':
                    $orderBy = "b.title DESC";
                    break;
                case 'author':
                    $orderBy = "a.name ASC";
                    break;
                case 'author_desc':
                    $orderBy = "a.name DESC";
                    break;
                case 'year':
                    $orderBy = "b.publication_year ASC";
                    break;
                case 'year_desc':
                    $orderBy = "b.publication_year DESC";
                    break;
                case 'category':
                    $orderBy = "c.name ASC";
                    break;
                case 'category_desc':
                    $orderBy = "c.name DESC";
                    break;
                case 'price':
                    $orderBy = "b.price ASC";
                    break;
                case 'price_desc':
                    $orderBy = "b.price DESC";
                    break;
            }
        }
        
        $whereClause = implode(" AND ", $where);
        
        $rows = $database->fetchAll("
            SELECT b.*, c.name as category_name, a.name as author_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN authors a ON b.author_id = a.id 
            WHERE {$whereClause}
            ORDER BY {$orderBy}
        ", $params);

        $books = [];
        foreach ($rows as $row) {
            $book = new self($database);
            $book->loadFromArray($row);
            $books[] = $book;
        }

        return $books;
    }

    public static function findAvailableForPurchase(Database $database): array
    {
        $rows = $database->fetchAll("
            SELECT b.*, c.name as category_name, a.name as author_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN authors a ON b.author_id = a.id 
            WHERE b.available_for_purchase = 1 AND b.status = 'active' AND b.stock_quantity > 0
            ORDER BY b.title ASC
        ");

        $books = [];
        foreach ($rows as $row) {
            $book = new self($database);
            $book->loadFromArray($row);
            $books[] = $book;
        }

        return $books;
    }

    public static function findAvailableForRent(Database $database): array
    {
        $rows = $database->fetchAll("
            SELECT b.*, c.name as category_name, a.name as author_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id 
            LEFT JOIN authors a ON b.author_id = a.id 
            WHERE b.available_for_rent = 1 AND b.status = 'active' AND b.stock_quantity > 0
            ORDER BY b.title ASC
        ");

        $books = [];
        foreach ($rows as $row) {
            $book = new self($database);
            $book->loadFromArray($row);
            $books[] = $book;
        }

        return $books;
    }

    public function delete(): bool
    {
        if (!$this->id) {
            return false;
        }

        $stmt = $this->database->prepare("DELETE FROM books WHERE id = ?");
        return $stmt->execute([$this->id]);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'publication_year' => $this->publicationYear,
            'price' => $this->price,
            'rental_price_2weeks' => $this->rentalPrice2weeks,
            'rental_price_1month' => $this->rentalPrice1month,
            'rental_price_3months' => $this->rentalPrice3months,
            'stock_quantity' => $this->stockQuantity,
            'available_for_rent' => (bool) $this->availableForRent,
            'available_for_purchase' => (bool) $this->availableForPurchase,
            'status' => $this->status,
            'category_id' => $this->categoryId,
            'author_id' => $this->authorId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'category' => $this->category ?? null,
            'author' => $this->author ?? null
        ];
    }

    private function loadFromArray(array $data): void
    {
        $this->id = $data['id'] ?? null;
        $this->title = $data['title'] ?? null;
        $this->description = $data['description'] ?? null;
        $this->publicationYear = $data['publication_year'] ?? null;
        $this->price = $data['price'] ?? null;
        $this->rentalPrice2weeks = $data['rental_price_2weeks'] ?? null;
        $this->rentalPrice1month = $data['rental_price_1month'] ?? null;
        $this->rentalPrice3months = $data['rental_price_3months'] ?? null;
        $this->stockQuantity = $data['stock_quantity'] ?? null;
        $this->availableForRent = $data['available_for_rent'] ?? false;
        $this->availableForPurchase = $data['available_for_purchase'] ?? false;
        $this->status = $data['status'] ?? 'active';
        $this->categoryId = $data['category_id'] ?? null;
        $this->authorId = $data['author_id'] ?? null;
        $this->createdAt = $data['created_at'] ?? null;
        $this->updatedAt = $data['updated_at'] ?? null;
        $this->author = $data['author_name'] ?? null;
        $this->category = $data['category_name'] ?? null;
    }
}
