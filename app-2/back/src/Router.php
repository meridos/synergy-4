<?php

namespace App;

class Router
{
    private $routes = [];

    public function addRoute(string $method, string $pattern, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'handler' => $handler
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = str_replace('/', '\/', $route['pattern']);
            $pattern = preg_replace('/\{id\}/', '(\d+)', $pattern); 
            $pattern = preg_replace('/\{token\}/', '([a-f0-9]+)', $pattern); 
            $pattern = preg_replace('/\{(\w+)\}/', '([^\/]+)', $pattern); 
            $pattern = '/^' . $pattern . '$/';

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); 
                call_user_func_array($route['handler'], $matches);
                return;
            }
        }

        // No route found
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}
