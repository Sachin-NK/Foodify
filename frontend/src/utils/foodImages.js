/**
 * Food Images Utility
 * Provides high-quality food images for menu items based on categories and names
 */

// Food images organized by category
export const FOOD_IMAGES = {
  // Pizza images
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80', // Margherita Pizza
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=80', // Pepperoni Pizza
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&h=600&q=80', // Veggie Pizza
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&h=600&q=80', // Supreme Pizza
  ],

  // Burger images
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80', // Classic Burger
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&h=600&q=80', // Cheeseburger
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&h=600&q=80', // Gourmet Burger
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&h=600&q=80', // Chicken Burger
  ],

  // Indian food images
  indian: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&h=600&q=80', // Curry
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&h=600&q=80', // Biryani
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&h=600&q=80', // Naan and Curry
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&h=600&q=80', // Tandoori
  ],

  // Asian food images
  asian: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&h=600&q=80', // Ramen
    'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=800&h=600&q=80', // Sushi
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&h=600&q=80', // Fried Rice
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&h=600&q=80', // Pad Thai
  ],

  // Mexican food images
  mexican: [
    'https://images.unsplash.com/photo-1565299585323-38174c4a6471?auto=format&fit=crop&w=800&h=600&q=80', // Tacos
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&h=600&q=80', // Burrito
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&h=600&q=80', // Quesadilla
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&h=600&q=80', // Nachos
  ],

  // Dessert images
  dessert: [
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80', // Cake
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&h=600&q=80', // Ice Cream
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&h=600&q=80', // Donuts
    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=800&h=600&q=80', // Cookies
  ],

  // Ice cream specific images
  icecream: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&h=600&q=80', // Vanilla Ice Cream
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&h=600&q=80', // Chocolate Ice Cream
    'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&h=600&q=80', // Strawberry Ice Cream
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&h=600&q=80', // Ice Cream Sundae
  ],

  // Healthy/Salad images
  healthy: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80', // Salad Bowl
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&h=600&q=80', // Avocado Toast
    'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=800&h=600&q=80', // Smoothie Bowl
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&h=600&q=80', // Fresh Salad
  ],

  // Drinks images
  drinks: [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80', // Coffee
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&h=600&q=80', // Smoothie
    'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=800&h=600&q=80', // Fresh Juice
    'https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=800&h=600&q=80', // Iced Tea
  ],

  // Fast food images
  fastfood: [
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&h=600&q=80', // Fries
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&h=600&q=80', // Fried Chicken
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=80', // Hot Dog
    'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?auto=format&fit=crop&w=800&h=600&q=80', // Fish & Chips
  ],

  // Sri Lankan food images
  srilanka: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&h=600&q=80', // Rice and Curry
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&h=600&q=80', // Kottu
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&h=600&q=80', // String Hoppers
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&h=600&q=80', // Hoppers
  ],

  // Default fallback images
  default: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&h=600&q=80',
  ]
};

// Keywords to category mapping
const FOOD_KEYWORDS = {
  pizza: ['pizza', 'margherita', 'pepperoni', 'supreme', 'hawaiian'],
  burger: ['burger', 'cheeseburger', 'hamburger', 'chicken burger', 'veggie burger'],
  indian: ['curry', 'biryani', 'tandoori', 'naan', 'dal', 'masala', 'tikka', 'samosa'],
  asian: ['ramen', 'sushi', 'pad thai', 'fried rice', 'noodles', 'dumplings', 'tempura'],
  mexican: ['taco', 'burrito', 'quesadilla', 'nachos', 'enchilada', 'fajita'],
  icecream: ['ice cream', 'vanilla', 'chocolate ice cream', 'strawberry ice cream', 'gelato', 'sorbet', 'sundae'],
  dessert: ['cake', 'donut', 'cookie', 'brownie', 'cheesecake', 'pudding', 'pastry'],
  healthy: ['salad', 'bowl', 'avocado', 'smoothie', 'quinoa', 'kale', 'organic'],
  drinks: ['coffee', 'tea', 'juice', 'smoothie', 'latte', 'cappuccino', 'espresso'],
  fastfood: ['fries', 'fried chicken', 'hot dog', 'fish and chips', 'wings'],
  srilanka: ['kottu', 'hoppers', 'string hoppers', 'rice and curry', 'roti', 'pol sambol']
};

/**
 * Get appropriate food image based on item name and category
 * @param {string} itemName - Name of the food item
 * @param {string} category - Category of the food (optional)
 * @param {number} index - Index for consistent image selection (optional)
 * @returns {string} - Image URL
 */
export const getFoodImage = (itemName = '', category = '', index = 0) => {
  const name = itemName.toLowerCase();
  const cat = category.toLowerCase();
  
  // First, try to match by item name keywords
  for (const [categoryKey, keywords] of Object.entries(FOOD_KEYWORDS)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      const images = FOOD_IMAGES[categoryKey];
      return images[index % images.length];
    }
  }
  
  // Then try to match by category
  if (cat && FOOD_IMAGES[cat]) {
    const images = FOOD_IMAGES[cat];
    return images[index % images.length];
  }
  
  // Check for partial category matches
  for (const [categoryKey, images] of Object.entries(FOOD_IMAGES)) {
    if (cat.includes(categoryKey) || categoryKey.includes(cat)) {
      return images[index % images.length];
    }
  }
  
  // Fallback to default images
  const defaultImages = FOOD_IMAGES.default;
  return defaultImages[index % defaultImages.length];
};

/**
 * Get a random food image from a specific category
 * @param {string} category - Food category
 * @returns {string} - Random image URL from the category
 */
export const getRandomFoodImage = (category = 'default') => {
  const cat = category.toLowerCase();
  const images = FOOD_IMAGES[cat] || FOOD_IMAGES.default;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

/**
 * Get all available food categories
 * @returns {Array} - Array of category names
 */
export const getFoodCategories = () => {
  return Object.keys(FOOD_IMAGES).filter(cat => cat !== 'default');
};

/**
 * Generate a consistent hash from string for consistent image selection
 * @param {string} str - String to hash
 * @returns {number} - Hash number
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get consistent food image based on item name (same item always gets same image)
 * @param {string} itemName - Name of the food item
 * @param {string} category - Category of the food (optional)
 * @returns {string} - Consistent image URL
 */
export const getConsistentFoodImage = (itemName = '', category = '') => {
  const hash = hashString(itemName + category);
  return getFoodImage(itemName, category, hash);
};

export default {
  getFoodImage,
  getRandomFoodImage,
  getConsistentFoodImage,
  getFoodCategories,
  FOOD_IMAGES
};