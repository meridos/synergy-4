<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class JWTMiddleware
{
    private static $secretKey;
    private static $algorithm = 'HS256';

    public static function init(): void
    {
        self::$secretKey = $_ENV['JWT_SECRET'] ?? 'default-secret-key';
    }

    public static function generateToken(array $payload): string
    {
        $payload['iat'] = time();
        $payload['exp'] = time() + ($_ENV['JWT_EXPIRE'] ?? 3600);
        
        return JWT::encode($payload, self::$secretKey, self::$algorithm);
    }

    public static function validateToken(string $token): array|false
    {
        try {
            $decoded = JWT::decode($token, new Key(self::$secretKey, self::$algorithm));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function getTokenFromHeader(): string|null
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    public static function requireAuth(): array|null
    {
        $token = self::getTokenFromHeader();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Authorization token required'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $payload = self::validateToken($token);
        
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        return $payload;
    }

    public static function getPayload(): array|null
    {
        $token = self::getTokenFromHeader();
        
        if (!$token) {
            return null;
        }

        return self::validateToken($token);
    }
}
