import { users, restaurants, menuItems, orders, type User, type InsertUser, type Restaurant, type InsertRestaurant, type MenuItem, type InsertMenuItem, type Order, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurant operations
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: number): Promise<boolean>;
  
  // Menu item operations
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private currentUserId: number;
  private currentRestaurantId: number;
  private currentMenuItemId: number;
  private currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentRestaurantId = 1;
    this.currentMenuItemId = 1;
    this.currentOrderId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed restaurants
    const restaurantData = [
      { name: "Spice Kingdom", logo: "/images/spice-kingdom-logo.png", location: "Colombo 03", tags: ["Indian", "Spicy", "Curry"], rating: 45, deliveryTime: "25-35 min", coverImage: "/images/spice-kingdom-cover.jpg" },
      { name: "Burger Hub", logo: "/images/burger-hub-logo.png", location: "Kandy City", tags: ["Fast Food", "Burgers", "Snacks"], rating: 42, deliveryTime: "15-20 min", coverImage: "/images/burger-hub-cover.jpg" },
      { name: "Green Leaf Cafe", logo: "/images/green-leaf-logo.png", location: "Galle Fort", tags: ["Vegan", "Healthy", "Salads"], rating: 48, deliveryTime: "30-40 min", coverImage: "/images/green-leaf-cover.jpg" },
      { name: "Pizza Empire", logo: "/images/pizza-empire-logo.png", location: "Negombo", tags: ["Pizza", "Italian", "Cheese"], rating: 46, deliveryTime: "20-30 min", coverImage: "/images/pizza-empire-cover.jpg" },
      { name: "Noodle House", logo: "/images/noodle-house-logo.png", location: "Matara", tags: ["Asian", "Noodles", "Wok"], rating: 43, deliveryTime: "25-35 min", coverImage: "/images/noodle-house-cover.jpg" },
      { name: "Dessert Bliss", logo: "/images/dessert-bliss-logo.png", location: "Kurunegala", tags: ["Desserts", "Ice Cream", "Cakes"], rating: 49, deliveryTime: "20-25 min", coverImage: "/images/dessert-bliss-cover.jpg" },
      { name: "Taco Town", logo: "/images/taco-town-logo.png", location: "Nugegoda", tags: ["Mexican", "Tacos", "Spicy"], rating: 44, deliveryTime: "20-30 min", coverImage: "/images/taco-town-cover.jpg" },
      { name: "Kottu Kulture", logo: "/images/kottu-kulture-logo.png", location: "Jaffna", tags: ["Sri Lankan", "Kottu", "Street Food"], rating: 47, deliveryTime: "15-25 min", coverImage: "/images/kottu-kulture-cover.jpg" },
      { name: "Sushi Sensation", logo: "/images/sushi-sensation-logo.png", location: "Dehiwala", tags: ["Japanese", "Sushi", "Seafood"], rating: 49, deliveryTime: "30-40 min", coverImage: "/images/sushi-sensation-cover.jpg" },
      { name: "Toast & Brew", logo: "/images/toast-brew-logo.png", location: "Battaramulla", tags: ["Cafe", "Brunch", "Coffee"], rating: 43, deliveryTime: "20-30 min", coverImage: "/images/toast-brew-cover.jpg" },
      { name: "Wrap Republic", logo: "/images/wrap-republic-logo.png", location: "Nawala", tags: ["Healthy", "Wraps", "Fusion"], rating: 46, deliveryTime: "25-35 min", coverImage: "/images/wrap-republic-cover.jpg" }
    ];

    restaurantData.forEach(restaurant => {
      const id = this.currentRestaurantId++;
      this.restaurants.set(id, { ...restaurant, id, isActive: true, createdAt: new Date() });
    });

    // Seed menu items
    const menuItemsData = [
      // Burger Hub
      { restaurantId: 2, name: "Classic Beef Burger", image: "/images/classic-beef-burger.jpg", description: "Juicy grilled beef patty, cheddar, lettuce, tomato, and special sauce.", price: 850 },
      { restaurantId: 2, name: "Chicken Zinger", image: "/images/chicken-zinger.jpg", description: "Crispy chicken fillet with spicy mayo, lettuce, and cheese.", price: 790 },
      { restaurantId: 2, name: "Double Trouble Combo", image: "/images/double-trouble.jpg", description: "Two burgers, fries, and a drink. Perfect for sharing!", price: 1600 },
      // Pizza Empire
      { restaurantId: 4, name: "Cheese Burst Pizza", image: "/images/cheese-burst.jpg", description: "Extra cheesy goodness with mozzarella and cheddar mix.", price: 1250 },
      { restaurantId: 4, name: "BBQ Chicken Pizza", image: "/images/bbq-chicken-pizza.jpg", description: "Grilled chicken, BBQ sauce, onions, and peppers.", price: 1450 },
      { restaurantId: 4, name: "Veggie Delight Pizza", image: "/images/veggie-delight.jpg", description: "Tomato, olives, capsicum, onions and sweet corn.", price: 1100 },
      // Noodle House
      { restaurantId: 5, name: "Beef Ramen", image: "/images/beef-ramen.jpg", description: "Slow-cooked beef, egg, scallions and rich soy broth.", price: 980 },
      { restaurantId: 5, name: "Veg Chow Mein", image: "/images/veg-chowmein.jpg", description: "Stir-fried noodles with mixed vegetables and soy sauce.", price: 750 },
      { restaurantId: 5, name: "Chicken Pad Thai", image: "/images/pad-thai.jpg", description: "Thai-style noodles with chicken, peanuts and lime.", price: 890 },
      // Dessert Bliss
      { restaurantId: 6, name: "Chocolate Lava Cake", image: "/images/lava-cake.jpg", description: "Warm chocolate cake with a gooey center.", price: 550 },
      { restaurantId: 6, name: "Strawberry Cheesecake", image: "/images/strawberry-cheesecake.jpg", description: "Creamy cheesecake with a strawberry glaze.", price: 620 },
      { restaurantId: 6, name: "Vanilla Ice Cream Sundae", image: "/images/vanilla-sundae.jpg", description: "Classic sundae with vanilla, sprinkles and cherry.", price: 450 },
      // Green Leaf Cafe
      { restaurantId: 3, name: "Quinoa Power Bowl", image: "/images/quinoa-bowl.jpg", description: "Quinoa, kale, avocado, chickpeas and tahini dressing.", price: 950 },
      { restaurantId: 3, name: "Vegan Buddha Bowl", image: "/images/buddha-bowl.jpg", description: "Grains, greens, tofu, and vibrant veggies.", price: 990 },
      // Taco Town
      { restaurantId: 7, name: "Beef Tacos", image: "/images/beef-tacos.jpg", description: "Three crispy tacos with spicy minced beef and salsa.", price: 950 },
      { restaurantId: 7, name: "Chicken Quesadilla", image: "/images/quesadilla.jpg", description: "Grilled tortilla with melted cheese and seasoned chicken.", price: 890 },
      { restaurantId: 7, name: "Loaded Nachos", image: "/images/nachos.jpg", description: "Topped with cheese, beans, salsa, sour cream and jalapenos.", price: 800 },
      // Kottu Kulture
      { restaurantId: 8, name: "Cheese Chicken Kottu", image: "/images/cheese-kottu.jpg", description: "Soft kottu with spicy chicken and gooey cheese.", price: 800 },
      { restaurantId: 8, name: "Seafood Kottu", image: "/images/seafood-kottu.jpg", description: "Shrimp, cuttlefish, and crab meat with kottu.", price: 950 },
      { restaurantId: 8, name: "Mutton Kottu", image: "/images/mutton-kottu.jpg", description: "Soft roti mixed with tender mutton curry chunks.", price: 1100 },
      // Sushi Sensation
      { restaurantId: 9, name: "California Roll", image: "/images/california-roll.jpg", description: "Crab, avocado, and cucumber rolled in seaweed and rice.", price: 1150 },
      { restaurantId: 9, name: "Salmon Nigiri", image: "/images/salmon-nigiri.jpg", description: "Fresh sliced salmon on seasoned rice.", price: 1050 },
      { restaurantId: 9, name: "Tempura Prawns", image: "/images/tempura.jpg", description: "Crispy fried prawns served with soy sauce.", price: 990 },
      // Toast & Brew
      { restaurantId: 10, name: "Avocado Toast", image: "/images/avocado-toast.jpg", description: "Sourdough topped with smashed avocado and poached egg.", price: 850 },
      { restaurantId: 10, name: "Breakfast Platter", image: "/images/breakfast-platter.jpg", description: "Eggs, bacon, toast, hash browns and sausage.", price: 1150 },
      { restaurantId: 10, name: "Iced Caramel Latte", image: "/images/caramel-latte.jpg", description: "Cold brew with caramel syrup and fresh milk.", price: 600 },
      // Wrap Republic
      { restaurantId: 11, name: "Grilled Chicken Wrap", image: "/images/chicken-wrap.jpg", description: "Grilled chicken, lettuce, tomato, and garlic sauce.", price: 790 },
      { restaurantId: 11, name: "Falafel Wrap", image: "/images/falafel-wrap.jpg", description: "Vegan-friendly falafel with hummus and fresh veggies.", price: 740 },
      { restaurantId: 11, name: "BBQ Paneer Wrap", image: "/images/paneer-wrap.jpg", description: "Spicy paneer, BBQ sauce, onions and peppers.", price: 800 },
    ];

    menuItemsData.forEach(menuItem => {
      const id = this.currentMenuItemId++;
      this.menuItems.set(id, { ...menuItem, id, isAvailable: true, createdAt: new Date() });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false, 
      createdAt: new Date(),
      address: insertUser.address || null,
      phone: insertUser.phone || null
    };
    this.users.set(id, user);
    return user;
  }

  // Restaurant operations
  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(r => r.isActive);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.currentRestaurantId++;
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id, 
      isActive: true, 
      createdAt: new Date(),
      logo: insertRestaurant.logo || null,
      tags: insertRestaurant.tags || null,
      rating: insertRestaurant.rating || null,
      deliveryTime: insertRestaurant.deliveryTime || null,
      coverImage: insertRestaurant.coverImage || null
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: number, updateData: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;
    
    const updated = { ...restaurant, ...updateData };
    this.restaurants.set(id, updated);
    return updated;
  }

  async deleteRestaurant(id: number): Promise<boolean> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return false;
    
    this.restaurants.set(id, { ...restaurant, isActive: false });
    return true;
  }

  // Menu item operations
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.restaurantId === restaurantId && item.isAvailable);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const menuItem: MenuItem = { 
      ...insertMenuItem, 
      id, 
      isAvailable: true, 
      createdAt: new Date(),
      image: insertMenuItem.image || null,
      description: insertMenuItem.description || null
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  async updateMenuItem(id: number, updateData: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const menuItem = this.menuItems.get(id);
    if (!menuItem) return undefined;
    
    const updated = { ...menuItem, ...updateData };
    this.menuItems.set(id, updated);
    return updated;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const menuItem = this.menuItems.get(id);
    if (!menuItem) return false;
    
    this.menuItems.set(id, { ...menuItem, isAvailable: false });
    return true;
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { ...insertOrder, id, status: "pending", createdAt: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
