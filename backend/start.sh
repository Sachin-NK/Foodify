#!/bin/bash

# Railway startup script for Laravel
echo "Starting Foodify Laravel application..."

# Set proper permissions
chmod -R 755 storage bootstrap/cache

# Clear and cache configuration
php artisan config:clear
php artisan config:cache
php artisan route:cache

# Run migrations
php artisan migrate --force

# Start the server
echo "Starting server on port $PORT"
php artisan serve --host=0.0.0.0 --port=$PORT
