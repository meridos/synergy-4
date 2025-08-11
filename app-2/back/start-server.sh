#!/bin/bash

if [ -f "composer.json" ]; then
    echo "Installing PHP dependencies..."
    php composer.phar install
fi

echo "Starting PHP server on http://localhost:8000"
php -S localhost:8000 -t public/
