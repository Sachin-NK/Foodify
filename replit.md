# Foodify - Food Delivery Platform

## Overview

Foodify is a modern, responsive web application for a food delivery platform, similar to Uber Eats. It's built as a full-stack application with a React frontend and Express backend, designed to connect customers with restaurants for food ordering and delivery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Context API for cart and authentication
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Validation**: Zod for request/response validation
- **Development**: Hot reloading with Vite integration

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript support
- **Schema**: Located in `shared/schema.ts` for type sharing between frontend and backend
- **Migrations**: Managed through Drizzle Kit
- **Tables**: users, restaurants, menuItems, orders

## Key Components

### Pages
- **Home**: Landing page with hero section and call-to-action
- **Browse**: Restaurant listing with filtering capabilities
- **Restaurant**: Individual restaurant menu page
- **Cart**: Shopping cart management
- **Checkout**: Order placement with customer information
- **Track Order**: Order status tracking
- **Login/Register**: User authentication
- **Admin**: Restaurant and menu management

### Context Providers
- **AuthContext**: User authentication state and methods
- **CartContext**: Shopping cart state with localStorage persistence

### Database Schema
- **Users**: Authentication and profile information
- **Restaurants**: Restaurant details, location, ratings
- **Menu Items**: Food items with pricing and descriptions
- **Orders**: Order history with customer information and status

## Data Flow

1. **User Authentication**: JWT-based authentication with localStorage persistence
2. **Restaurant Browsing**: API calls to fetch restaurant listings with filtering
3. **Menu Display**: Restaurant-specific menu items fetched by restaurant ID
4. **Cart Management**: Local state with Context API, persisted to localStorage
5. **Order Processing**: Form validation → API submission → Order confirmation
6. **Admin Functions**: CRUD operations for restaurants and menu items

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Data Fetching**: TanStack Query for caching and synchronization
- **Form Validation**: React Hook Form with Zod resolvers
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod for schema validation

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Production bundling for backend
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations applied with `npm run db:push`

### Production
- Frontend: Vite build to `dist/public` directory
- Backend: ESBuild bundle to `dist/index.js`
- Static file serving: Express serves built frontend assets
- Database: Neon Database with connection pooling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string for Neon Database
- `NODE_ENV`: Environment mode (development/production)

### Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

The application follows a monorepo structure with shared types and schemas between frontend and backend, ensuring type safety and consistency across the entire stack.