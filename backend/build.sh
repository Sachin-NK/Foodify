#!/usr/bin/env bash

echo "Starting build process..."

echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Running database migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

echo "Build process completed successfully!"