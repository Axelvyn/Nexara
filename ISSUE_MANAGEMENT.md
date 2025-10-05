# Issue Management Integration

This document describes the integration between Nexara's issue management backend and frontend.

## Overview

The issue management system allows users to:
- Create, read, update, and delete issues
- Organize issues by boards and columns
- Track issue statistics and analytics
- Assign issues to team members
- Set priorities and types for issues

## Backend API

### Issue Endpoints

- `GET /api/issues/column/:columnId` - Get all issues for a column
- `GET /api/issues/:issueId` - Get a specific issue
- `POST /api/issues` - Create a new issue
- `PUT /api/issues/:issueId` - Update an issue
- `DELETE /api/issues/:issueId` - Delete an issue
- `PATCH /api/issues/:issueId/move` - Move issue to different column
- `GET /api/issues/stats` - Get issue statistics

### Board Endpoints

- `GET /api/boards/project/:projectId` - Get all boards for a project
- `GET /api/boards/:boardId` - Get a specific board with columns
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:boardId` - Update a board
- `DELETE /api/boards/:boardId` - Delete a board

## Frontend Implementation

### API Routes (Next.js)

- `/api/issues` - Issue CRUD operations
- `/api/issues/[issueId]` - Individual issue operations
- `/api/issues/[issueId]/move` - Move issue functionality
- `/api/issues/stats` - Issue statistics
- `/api/boards` - Board CRUD operations
- `/api/boards/[boardId]` - Individual board operations

### Components

#### Core Components

1. **CreateIssueModal** (`/components/create-issue-modal.tsx`)
   - Modal for creating new issues
   - Form validation and submission
   - Issue type and priority selection

2. **IssueCard** (`/components/issue-card.tsx`)
   - Individual issue display component
   - Shows issue details, type, priority, status
   - Edit and delete actions

3. **IssueList** (`/components/issue-list.tsx`)
   - Grid display of issues
   - Search and filtering functionality
   - Pagination support

4. **IssueStatsWidget** (`/components/issue-stats-widget.tsx`)
   - Visual statistics for issues
   - Breakdown by status, type, and priority
   - Charts and metrics

### Pages

1. **Project Detail** (`/app/projects/[id]/page.tsx`)
   - Enhanced with issue statistics
   - Quick access to issue management
   - Issue overview section

2. **Project Issues** (`/app/projects/[id]/issues/page.tsx`)
   - Dedicated issue management page
   - Board and column selection
   - Issue listing and creation

## Data Models

### Issue Type
```typescript
interface Issue {
  id: string
  title: string
  description?: string
  type: 'BUG' | 'FEATURE' | 'TASK' | 'STORY' | 'EPIC'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  columnId: string
  assigneeId?: string
  reporterId: string
  createdAt: string
  updatedAt: string
  assignee?: User
  reporter: User
  column?: Column
}
```

### Board Type
```typescript
interface Board {
  id: string
  name: string
  description?: string
  projectId: string
  columns?: Column[]
  createdAt: string
  updatedAt: string
}
```

### Column Type
```typescript
interface Column {
  id: string
  name: string
  boardId: string
  orderIndex: number
  issues?: Issue[]
  createdAt: string
  updatedAt: string
}
```

## Features

### Issue Management
- ✅ Create issues with title, description, type, and priority
- ✅ View issues in a responsive grid layout
- ✅ Edit and delete issues
- ✅ Move issues between columns
- ✅ Search and filter issues
- ✅ Pagination for large issue lists

### Issue Statistics
- ✅ Total issue count
- ✅ Breakdown by status (Todo, In Progress, In Review, Done)
- ✅ Breakdown by type (Bug, Feature, Task, Story, Epic)
- ✅ Breakdown by priority (Low, Medium, High, Urgent)
- ✅ Visual representation with charts

### Board Management
- ✅ View boards for a project
- ✅ Select boards and columns
- ✅ Board-specific issue filtering
- ✅ Column-based issue organization

## Authentication & Authorization

All API endpoints are protected with JWT authentication. Users can only:
- View issues in projects they own
- Create issues in their own projects
- Edit/delete issues in their own projects
- Move issues within their own projects

## Error Handling

The system includes comprehensive error handling:
- Form validation on the frontend
- API error responses with meaningful messages
- Loading states for better UX
- Toast notifications for user feedback

## Getting Started

1. Start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Or use the development script:
   ```bash
   ./start-dev.sh
   ```

## Future Enhancements

Potential improvements for the issue management system:

1. **Real-time Updates**
   - WebSocket integration for live issue updates
   - Real-time collaboration features

2. **Advanced Filtering**
   - Filter by assignee, date range, labels
   - Saved filter presets

3. **Issue Dependencies**
   - Link related issues
   - Dependency tracking and visualization

4. **Time Tracking**
   - Time estimation and tracking
   - Burndown charts and reports

5. **Comments and Activity**
   - Issue comments and discussions
   - Activity timeline and history

6. **Kanban Board View**
   - Drag-and-drop interface
   - Visual board management

7. **Issue Templates**
   - Predefined issue templates
   - Custom fields and properties

8. **Notifications**
   - Email and in-app notifications
   - Assignee and mention alerts

## Troubleshooting

### Common Issues

1. **"Column ID is required" error**
   - Ensure a board is selected and has columns
   - Check that the project has at least one board

2. **Authentication errors**
   - Verify JWT token is valid
   - Check if user has access to the project

3. **Issues not loading**
   - Check backend server is running
   - Verify API endpoints are accessible
   - Check browser console for errors

4. **Create issue button disabled**
   - Ensure a column is selected
   - Check that user has permission to create issues

## API Reference

See the full API documentation in the backend README.md for detailed request/response schemas and examples.