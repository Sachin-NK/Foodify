# Simple startup script for Railway Laravel deployment
echo "Starting Foodify Laravel Application..."

# Install dependencies
composer install --no-dev --optimize-autoloader

# Clear and optimize Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generate application key if not set
php artisan key:generate --force

# Run migrations
php artisan migrate --force

# Start server
echo "Starting server on port $PORT"
exec php artisan serve --host=0.0.0.0 --port=$PORT
