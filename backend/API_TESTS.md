# Nexara Backend API - cURL Test Commands

This file contains all the cURL commands to test the Nexara backend API, including authentication, project management, and role-based access control.

## 🚀 Quick Setup

1. Start the backend server:

   ```bash
   npm run dev
   ```

2. Set up the database:

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

3. The API will be available at `http://localhost:5000`

## 🔐 Authentication Endpoints

### Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "username": "newuser"
  }'
```

### Login user

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexara.com",
    "password": "password123"
  }'
```

### Refresh token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

### Get current user info

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👤 User Management Endpoints

### Get user profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update user profile

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updatedusername",
    "email": "updated@example.com"
  }'
```

### Change password

```bash
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

### Get user statistics

```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Deactivate account

```bash
curl -X DELETE http://localhost:5000/api/users/deactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 Project Management Endpoints

### Get all projects (owned + member)

```bash
curl -X GET "http://localhost:5000/api/projects?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get projects with search

```bash
curl -X GET "http://localhost:5000/api/projects?search=sample&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create new project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project",
    "description": "A sample project for testing"
  }'
```

### Get single project

```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update project (Admin/Owner only)

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated project description"
  }'
```

### Delete project (Owner only)

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get project statistics

```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👥 Project Member Management Endpoints

### Get project members

```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add member to project (Admin/Owner only)

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "role": "DEVELOPER"
  }'
```

### Update member role (Admin/Owner only)

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID/members/MEMBER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

### Remove member from project (Admin/Owner only)

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID/members/MEMBER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Leave project

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID/members/leave \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Transfer project ownership (Owner only)

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID/transfer-ownership \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newOwnerEmail": "newowner@example.com"
  }'
```

## 📋 Board Management Endpoints

### Get boards by project

```bash
curl -X GET "http://localhost:5000/api/boards/project/PROJECT_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get boards with search

```bash
curl -X GET "http://localhost:5000/api/boards/project/PROJECT_ID?search=development&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create new board

```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Board",
    "description": "A new board for testing",
    "projectId": "PROJECT_ID"
  }'
```

### Get single board

```bash
curl -X GET http://localhost:5000/api/boards/BOARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update board (Admin/Owner only)

```bash
curl -X PUT http://localhost:5000/api/boards/BOARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Board Name",
    "description": "Updated board description"
  }'
```

### Delete board (Admin/Owner only)

```bash
curl -X DELETE http://localhost:5000/api/boards/BOARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get board statistics

```bash
curl -X GET http://localhost:5000/api/boards/BOARD_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Issue Management Endpoints

### Get issues by column

```bash
curl -X GET "http://localhost:5000/api/issues/column/COLUMN_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get issues with search

```bash
curl -X GET "http://localhost:5000/api/issues/column/COLUMN_ID?search=bug&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create new issue (Developer+)

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Issue",
    "description": "This is a new issue for testing",
    "type": "BUG",
    "priority": "HIGH",
    "columnId": "COLUMN_ID",
    "assigneeId": "USER_ID"
  }'
```

### Get single issue

```bash
curl -X GET http://localhost:5000/api/issues/ISSUE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update issue (Developer+)

```bash
curl -X PUT http://localhost:5000/api/issues/ISSUE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Issue Title",
    "description": "Updated issue description",
    "priority": "MEDIUM",
    "status": "IN_PROGRESS"
  }'
```

### Delete issue (Admin/Owner only)

```bash
curl -X DELETE http://localhost:5000/api/issues/ISSUE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Move issue to different column (Developer+)

```bash
curl -X PATCH http://localhost:5000/api/issues/ISSUE_ID/move \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "columnId": "NEW_COLUMN_ID"
  }'
```

### Get issue statistics

```bash
curl -X GET http://localhost:5000/api/issues/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 System Endpoints

### Health check

```bash
curl -X GET http://localhost:5000/health
```

## 🧪 RBAC Testing Scenarios

### Test 1: Login as different users and test access levels

#### Login as Owner

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexara.com",
    "password": "password123"
  }'
```

#### Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexara.com",
    "password": "password123"
  }'
```

#### Login as Developer

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@nexara.com",
    "password": "password123"
  }'
```

#### Login as Viewer

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@nexara.com",
    "password": "password123"
  }'
```

### Test 2: Test permission restrictions

#### Try to create issue as Viewer (should fail)

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "columnId": "COLUMN_ID"
  }'
```

#### Try to delete project as Developer (should fail)

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer DEVELOPER_TOKEN"
```

#### Try to add member as Developer (should fail)

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "VIEWER"
  }'
```

### Test 3: Test successful operations

#### Create issue as Developer (should succeed)

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Developer Issue",
    "columnId": "COLUMN_ID"
  }'
```

#### Add member as Admin (should succeed)

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "VIEWER"
  }'
```

#### Update project as Owner (should succeed)

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated by Owner"
  }'
```

## 📋 Sample Data IDs

After running the seed script, you can use these sample IDs for testing:

- **Project ID**: `sample-project-1`
- **Board IDs**: `sample-board-1`, `sample-board-2`
- **Column IDs**: `col-1`, `col-2`, `col-3`, `col-4`, `col-5`, `col-6`, `col-7`, `col-8`
- **Issue IDs**: `issue-1`, `issue-2`, `issue-3`, `issue-4`, `issue-5`

## 🔑 Sample Test Flow

1. **Login as Owner**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@nexara.com", "password": "password123"}'
   ```

2. **Get projects**:

   ```bash
   curl -X GET http://localhost:5000/api/projects \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Get project members**:

   ```bash
   curl -X GET http://localhost:5000/api/projects/sample-project-1/members \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Create a new issue**:
   ```bash
   curl -X POST http://localhost:5000/api/issues \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Issue from cURL",
       "description": "Created via cURL command",
       "type": "TASK",
       "priority": "MEDIUM",
       "columnId": "col-1"
     }'
   ```

## 📝 Notes

- Replace `YOUR_JWT_TOKEN` with the actual JWT token received from login
- Replace `PROJECT_ID`, `BOARD_ID`, `COLUMN_ID`, `ISSUE_ID`, `MEMBER_ID`, `USER_ID` with actual IDs
- All timestamps in responses are in ISO 8601 format
- Error responses include detailed error messages and field validation errors
- The API returns consistent JSON responses with `success`, `message`, and `data` fields

## 🚨 Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalidValue"
    }
  ]
}
```
