# Nexara Backend Setup Guide

## 🚀 Quick Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings:
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Random secret key for JWT tokens
# - PORT: Server port (default: 5000)
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

## 📋 What's Included

### ✅ Complete Backend API

- **Authentication System**: JWT-based auth with registration, login, refresh tokens
- **User Management**: Profile management, password changes, account deactivation
- **Project Management**: Full CRUD operations for projects
- **Board Management**: Kanban boards with customizable columns
- **Issue Tracking**: Comprehensive issue management with types, priorities, status
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging

### 🗄️ Database Schema

- **Users**: Authentication and profile data
- **Projects**: Project containers owned by users
- **Boards**: Kanban boards within projects
- **Columns**: Board columns (To Do, In Progress, etc.)
- **Issues**: Tasks with types (BUG, FEATURE, TASK, STORY, EPIC), priorities, and status

### 🔧 API Endpoints

- **Authentication**: `/api/auth/*` - Register, login, refresh, logout
- **Users**: `/api/users/*` - Profile management, statistics
- **Projects**: `/api/projects/*` - Project CRUD operations
- **Boards**: `/api/boards/*` - Board management
- **Issues**: `/api/issues/*` - Issue tracking and management
- **System**: `/health` - Health checks

### 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Input validation with express-validator
- CORS configuration
- Security headers with Helmet

### 📊 Sample Data

The seed script creates:

- Test user: `test@nexara.com` (password: `password123`)
- Sample project with boards and columns
- Various issues for testing

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Development Commands

```bash
npm run dev          # Start development server
npm start           # Start production server
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run db:studio   # Open Prisma Studio
```

## 🔗 API Documentation

### Authentication Flow

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use token: `Authorization: Bearer <token>`
4. Refresh: `POST /api/auth/refresh`

### Example API Calls

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get projects (with token)
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <your-token>"
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Port Already in Use**: Change PORT in .env file
3. **JWT Secret**: Make sure JWT_SECRET is set in .env
4. **Prisma Client**: Run `npm run db:generate` if you get Prisma client errors

### Database Issues

```bash
# Reset database
npm run db:push --force-reset

# Regenerate Prisma client
npm run db:generate
```

## 🎯 Next Steps

1. **Frontend Integration**: Connect your Next.js frontend to these APIs
2. **AI Features**: Add OpenAI integration for AI-powered features
3. **Automation**: Integrate n8n for workflow automation
4. **Real-time**: Add WebSocket support for real-time updates
5. **File Uploads**: Add file attachment support for issues
6. **Notifications**: Add email/Slack notification system

## 📞 Support

- Check the main README.md for detailed documentation
- Review the API endpoints in the controllers
- Use Prisma Studio to explore the database: `npm run db:studio`
