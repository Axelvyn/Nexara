# Nexara Backend API

A robust Node.js/Express backend API for the Nexara project management platform, built with Prisma ORM and PostgreSQL.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Role-Based Access Control**: Comprehensive RBAC system with 4 user roles (Owner, Admin, Developer, Viewer)
- **Project Management**: Create, read, update, and delete projects with member management
- **Board Management**: Kanban-style boards with customizable columns
- **Issue Tracking**: Comprehensive issue management with types, priorities, and status tracking
- **Member Management**: Add/remove project members, change roles, transfer ownership
- **Security**: Helmet, CORS, rate limiting, input validation, and permission-based access
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Error Handling**: Comprehensive error handling and logging

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: express-validator
- **Logging**: Morgan
- **Development**: Nodemon

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your configuration
# At minimum, set:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (random secret key)
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start with auto-reload
npm run dev

# Or start production server
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Users

- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/change-password` - Change password (protected)
- `GET /api/users/stats` - Get user statistics (protected)
- `DELETE /api/users/deactivate` - Deactivate account (protected)

### Projects

- `GET /api/projects` - Get all user projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/:id` - Get single project (protected)
- `PUT /api/projects/:id` - Update project (Admin/Owner only)
- `DELETE /api/projects/:id` - Delete project (Owner only)
- `GET /api/projects/:id/stats` - Get project statistics (protected)

### Project Members

- `GET /api/projects/:id/members` - Get project members (protected)
- `POST /api/projects/:id/members` - Add member to project (Admin/Owner only)
- `PUT /api/projects/:id/members/:memberId` - Update member role (Admin/Owner only)
- `DELETE /api/projects/:id/members/:memberId` - Remove member (Admin/Owner only)
- `DELETE /api/projects/:id/members/leave` - Leave project (protected)
- `PUT /api/projects/:id/transfer-ownership` - Transfer ownership (Owner only)

### Boards

- `GET /api/boards/project/:projectId` - Get boards by project (protected)
- `POST /api/boards` - Create new board (protected)
- `GET /api/boards/:id` - Get single board (protected)
- `PUT /api/boards/:id` - Update board (Admin/Owner only)
- `DELETE /api/boards/:id` - Delete board (Admin/Owner only)
- `GET /api/boards/:id/stats` - Get board statistics (protected)

### Issues

- `GET /api/issues/column/:columnId` - Get issues by column (protected)
- `POST /api/issues` - Create new issue (Developer+)
- `GET /api/issues/:id` - Get single issue (protected)
- `PUT /api/issues/:id` - Update issue (Developer+)
- `DELETE /api/issues/:id` - Delete issue (Admin/Owner only)
- `PATCH /api/issues/:id/move` - Move issue to different column (Developer+)
- `GET /api/issues/stats` - Get issue statistics (protected)

### System

- `GET /health` - Health check

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start with auto-reload
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with sample data
npm run db:studio   # Open Prisma Studio

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors
npm run format      # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## 🗄️ Database Schema

The database includes the following main entities:

- **Users**: User accounts with authentication
- **Projects**: Project containers owned by users
- **ProjectMembers**: Role-based membership relationships
- **Boards**: Kanban boards within projects
- **Columns**: Columns within boards (To Do, In Progress, etc.)
- **Issues**: Tasks/issues with types, priorities, and status

## 🔐 Role-Based Access Control

The system implements a comprehensive RBAC system with 4 user roles:

- **OWNER**: Full access to everything (project creator)
- **ADMIN**: Can manage project settings, members, and boards
- **DEVELOPER**: Can create/edit issues and move them between columns
- **VIEWER**: Read-only access to project data

See [RBAC.md](./RBAC.md) for detailed documentation on the permission system.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Sample Data

The seed script creates:

- **Owner**: `test@nexara.com` (password: `password123`)
- **Admin**: `admin@nexara.com` (password: `password123`)
- **Developer**: `dev@nexara.com` (password: `password123`)
- **Viewer**: `viewer@nexara.com` (password: `password123`)
- Sample project with boards and issues
- Project members with different roles for testing RBAC
- Various issue types and priorities for testing

## 🚨 Error Handling

The API includes comprehensive error handling:

- Validation errors with detailed field information
- Authentication and authorization errors
- Database constraint errors
- Custom error messages for different scenarios

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Comprehensive input validation
- **Password Hashing**: bcrypt for secure password storage
- **JWT**: Secure token-based authentication

## 📊 Monitoring

- Health check endpoint for monitoring
- Request logging with Morgan
- Error logging and tracking
- Database query logging in development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
