# Role-Based Access Control (RBAC) System

## 🔐 Overview

The Nexara backend implements a comprehensive Role-Based Access Control (RBAC) system that allows fine-grained permissions for different user roles within projects. This ensures that users only have access to the features and data they need based on their role.

## 👥 User Roles

### 1. **OWNER** (Highest Privilege)

- **Description**: Project creator with full administrative access
- **Permissions**: All permissions for the project
- **Can Do**:
  - Manage project settings
  - Add/remove project members
  - Change member roles
  - Transfer project ownership
  - Create/edit/delete boards
  - Create/edit/delete issues
  - Access all project data

### 2. **ADMIN** (High Privilege)

- **Description**: Project administrator with management capabilities
- **Permissions**: Most project management permissions
- **Can Do**:
  - Manage project settings
  - Add/remove project members
  - Change member roles (except owner)
  - Create/edit/delete boards
  - Create/edit/delete issues
  - Access all project data
- **Cannot Do**:
  - Transfer project ownership
  - Remove project owner

### 3. **DEVELOPER** (Medium Privilege)

- **Description**: Active contributor who can work on issues
- **Permissions**: Issue management and basic project access
- **Can Do**:
  - View project and board data
  - Create/edit issues
  - Move issues between columns
  - Assign issues to themselves or others
  - View project members
- **Cannot Do**:
  - Manage project settings
  - Add/remove members
  - Create/edit/delete boards
  - Delete issues

### 4. **VIEWER** (Lowest Privilege)

- **Description**: Read-only access for stakeholders
- **Permissions**: View-only access to project data
- **Can Do**:
  - View project information
  - View boards and issues
  - View project members
- **Cannot Do**:
  - Create/edit/delete anything
  - Move issues
  - Assign issues
  - Manage project settings

## 🛡️ Permission System

### Permission Categories

#### Project Permissions

- `PROJECT_READ`: View project information
- `PROJECT_UPDATE`: Modify project settings
- `PROJECT_DELETE`: Delete the project
- `PROJECT_MANAGE_MEMBERS`: Add/remove project members

#### Board Permissions

- `BOARD_READ`: View board information
- `BOARD_CREATE`: Create new boards
- `BOARD_UPDATE`: Modify board settings
- `BOARD_DELETE`: Delete boards

#### Issue Permissions

- `ISSUE_READ`: View issue information
- `ISSUE_CREATE`: Create new issues
- `ISSUE_UPDATE`: Modify issue details
- `ISSUE_DELETE`: Delete issues
- `ISSUE_ASSIGN`: Assign issues to users
- `ISSUE_MOVE`: Move issues between columns

### Role-Permission Matrix

| Permission             | VIEWER | DEVELOPER | ADMIN | OWNER |
| ---------------------- | ------ | --------- | ----- | ----- |
| PROJECT_READ           | ✅     | ✅        | ✅    | ✅    |
| PROJECT_UPDATE         | ❌     | ❌        | ✅    | ✅    |
| PROJECT_DELETE         | ❌     | ❌        | ❌    | ✅    |
| PROJECT_MANAGE_MEMBERS | ❌     | ❌        | ✅    | ✅    |
| BOARD_READ             | ✅     | ✅        | ✅    | ✅    |
| BOARD_CREATE           | ❌     | ❌        | ✅    | ✅    |
| BOARD_UPDATE           | ❌     | ❌        | ✅    | ✅    |
| BOARD_DELETE           | ❌     | ❌        | ✅    | ✅    |
| ISSUE_READ             | ✅     | ✅        | ✅    | ✅    |
| ISSUE_CREATE           | ❌     | ✅        | ✅    | ✅    |
| ISSUE_UPDATE           | ❌     | ✅        | ✅    | ✅    |
| ISSUE_DELETE           | ❌     | ❌        | ✅    | ✅    |
| ISSUE_ASSIGN           | ❌     | ✅        | ✅    | ✅    |
| ISSUE_MOVE             | ❌     | ✅        | ✅    | ✅    |

## 🔧 Implementation Details

### Database Schema

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      ProjectRole @default(VIEWER)
  joinedAt  DateTime @default(now())
  updatedAt DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}

enum ProjectRole {
  OWNER       // Full access to everything
  ADMIN       // Can manage project settings, members, boards
  DEVELOPER   // Can create/edit issues, move between columns
  VIEWER      // Read-only access
}
```

### Middleware Usage

The RBAC system is implemented through middleware that checks permissions before allowing access to protected routes:

```javascript
// Example: Only admins and owners can update projects
router.put(
  '/:projectId',
  validateProjectId,
  checkProjectAccess('PROJECT_UPDATE'),
  validateProject,
  updateProject
);
```

### Role Hierarchy

Roles are organized in a hierarchy where higher roles inherit permissions from lower roles:

```javascript
const ROLE_HIERARCHY = {
  VIEWER: 1,
  DEVELOPER: 2,
  ADMIN: 3,
  OWNER: 4,
};
```

## 📋 API Endpoints for Role Management

### Project Member Management

| Method | Endpoint                                      | Description           | Required Role |
| ------ | --------------------------------------------- | --------------------- | ------------- |
| GET    | `/api/projects/:projectId/members`            | Get project members   | Any member    |
| POST   | `/api/projects/:projectId/members`            | Add member to project | ADMIN+        |
| PUT    | `/api/projects/:projectId/members/:memberId`  | Update member role    | ADMIN+        |
| DELETE | `/api/projects/:projectId/members/:memberId`  | Remove member         | ADMIN+        |
| DELETE | `/api/projects/:projectId/members/leave`      | Leave project         | Any member    |
| PUT    | `/api/projects/:projectId/transfer-ownership` | Transfer ownership    | OWNER only    |

### Example API Calls

#### Add a member to project

```bash
curl -X POST http://localhost:5000/api/projects/{projectId}/members \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "DEVELOPER"
  }'
```

#### Update member role

```bash
curl -X PUT http://localhost:5000/api/projects/{projectId}/members/{memberId} \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

#### Transfer project ownership

```bash
curl -X PUT http://localhost:5000/api/projects/{projectId}/transfer-ownership \
  -H "Authorization: Bearer <owner-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "newOwnerEmail": "newowner@example.com"
  }'
```

## 🧪 Testing the RBAC System

### Sample Users Created by Seed Script

The seed script creates users with different roles for testing:

- **Owner**: `test@nexara.com` (password: `password123`)
- **Admin**: `admin@nexara.com` (password: `password123`)
- **Developer**: `dev@nexara.com` (password: `password123`)
- **Viewer**: `viewer@nexara.com` (password: `password123`)

### Testing Scenarios

1. **Login as different users** and test their access levels
2. **Try to access restricted endpoints** with lower-privilege users
3. **Test member management** with admin/owner accounts
4. **Verify role inheritance** (admins can do everything developers can do)

### Example Test Flow

```bash
# 1. Login as viewer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "viewer@nexara.com", "password": "password123"}'

# 2. Try to create an issue (should fail)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer <viewer-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Issue", "columnId": "col-1"}'

# 3. Login as developer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@nexara.com", "password": "password123"}'

# 4. Create an issue (should succeed)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer <developer-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Issue", "columnId": "col-1"}'
```

## 🔒 Security Considerations

1. **Role Validation**: All role checks are performed server-side
2. **Permission Inheritance**: Higher roles automatically have lower role permissions
3. **Owner Protection**: Project owners cannot be removed or have their role changed
4. **Ownership Transfer**: Only current owners can transfer ownership
5. **Cascade Deletion**: When projects are deleted, all member relationships are cleaned up
6. **Unique Constraints**: Users can only have one role per project

## 🚀 Future Enhancements

1. **Custom Roles**: Allow project owners to create custom roles with specific permissions
2. **Temporary Access**: Add time-limited access for contractors or consultants
3. **Audit Logging**: Track all role changes and permission usage
4. **Bulk Operations**: Add endpoints for bulk member management
5. **Role Templates**: Predefined role templates for common use cases
6. **External Integration**: Role-based access for external API integrations

## 📚 Related Documentation

- [API Documentation](./README.md)
- [Database Schema](./prisma/schema.prisma)
- [Setup Guide](./SETUP.md)
- [Authentication Guide](./middleware/auth.js)
