const RESTAURANT_IMAGES = {
  'Spice Garden': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&h=600&q=80',
  'Pizza Palace': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&h=600&q=80',
  'Golden Dragon': 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&h=600&q=80',
};

const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=600&q=80';

export const getRestaurantImage = (restaurantName = '') => {
  if (RESTAURANT_IMAGES[restaurantName]) {
    return RESTAURANT_IMAGES[restaurantName];
  }
  
  const restaurantKey = Object.keys(RESTAURANT_IMAGES).find(
    key => key.toLowerCase() === restaurantName.toLowerCase()
  );
  
  if (restaurantKey) {
    return RESTAURANT_IMAGES[restaurantKey];
  }
  
  return DEFAULT_RESTAURANT_IMAGE;
};