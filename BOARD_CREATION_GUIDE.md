# Board Creation Guide for Nexara

## Overview
Your Nexara application now supports creating boards in multiple ways. This guide explains all the available methods and how to use them.

## 🎯 Available Methods

### 1. **Automatic Default Board Creation**
When you create a new project, a default board is automatically created with standard columns.

**What it creates:**
- Board name: "Main Board"
- Description: "Default board for project tasks"  
- Columns: "To Do", "In Progress", "Done"

**Backend endpoint:** `POST /api/projects/:projectId/setup-default-board`

### 2. **Manual Board Creation (New UI)**
Use the new "Create Board" button in the project detail page.

**Features:**
- Custom board name
- Optional description
- Validates input (name required, 2-50 chars)
- Beautiful modal interface
- Real-time error handling

**How to use:**
1. Go to any project detail page (`/projects/[id]`)
2. Click "Create Board" button in Quick Actions
3. Fill out the form
4. Click "Create Board"

### 3. **Direct API Usage**
For programmatic board creation.

```typescript
import { apiService } from '@/lib/api'

const createBoard = async () => {
  try {
    const response = await apiService.createBoard({
      name: "Sprint Planning Board",
      description: "Board for sprint planning activities",
      projectId: "your-project-id"
    })
    console.log('Board created:', response.data.board)
  } catch (error) {
    console.error('Failed to create board:', error)
  }
}
```

## 🔧 Backend API Endpoints

### Create Custom Board
```
POST /api/boards
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Board Name",
  "description": "Optional description",
  "projectId": "project-uuid"
}
```

### Setup Default Board
```
POST /api/projects/:projectId/setup-default-board
Authorization: Bearer <token>
```

### Get Project Boards
```
GET /api/boards/project/:projectId
Authorization: Bearer <token>
```

## 🎨 Frontend Components

### CreateBoardModal Component
Location: `/components/create-board-modal.tsx`

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Called when modal closes
- `projectId: string` - Target project ID
- `onBoardCreated?: (board) => void` - Success callback

**Features:**
- Form validation
- Loading states
- Error handling
- Responsive design
- Accessibility support

### Integration Example
```tsx
import { CreateBoardModal } from '@/components/create-board-modal'

function ProjectPage() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Create Board
      </Button>
      
      <CreateBoardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        onBoardCreated={(board) => {
          setShowModal(false)
          // Handle success
        }}
      />
    </>
  )
}
```

## 📋 Board Structure

### Board Object
```typescript
interface Board {
  id: string
  name: string
  description?: string
  projectId: string
  createdAt: string
  updatedAt: string
  columns?: Column[]
  _count?: {
    columns: number
  }
}
```

### Column Object
```typescript
interface Column {
  id: string
  name: string
  boardId: string
  orderIndex: number
  createdAt: string
  updatedAt: string
  issues?: Issue[]
  _count?: {
    issues: number
  }
}
```

## 🚀 Next Steps

1. **Create your first custom board:**
   - Navigate to any project
   - Click "Create Board"
   - Enter a meaningful name and description

2. **Add columns to your board:**
   - Currently, custom boards are created without columns
   - You'll need to implement column creation next
   - Default boards automatically get 3 columns

3. **Manage multiple boards:**
   - Each project can have multiple boards
   - Use different boards for different workflows
   - Example: "Development", "Testing", "Release Planning"

## 🔍 Troubleshooting

**Board creation fails:**
- Check authentication token
- Verify project ownership
- Ensure project exists

**No columns after creation:**
- Custom boards don't auto-create columns
- Use default board creation for immediate usability
- Implement column creation for custom boards

**Modal doesn't appear:**
- Check if `CreateBoardModal` is imported
- Verify state management
- Check for JavaScript errors in console

## 💡 Tips

- Use descriptive board names for better organization
- Consider your team's workflow when creating boards
- Default boards are perfect for quick start
- Custom boards give you full control over structure