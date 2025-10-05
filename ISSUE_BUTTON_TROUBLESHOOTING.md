# Issue Management Setup Guide

## Quick Fix for "Create Issue" Button

If you're unable to click the "Create Issue" button, here are the most common solutions:

### 1. Check Browser Console
Open browser developer tools (F12) and check the console for any errors:
- Look for authentication errors
- Check for network request failures
- Verify API endpoint responses

### 2. Verify Project Has Boards
The "Create Issue" button requires at least one board with columns:

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if project has boards (replace PROJECT_ID and TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/boards?projectId=PROJECT_ID
```

### 3. Create Default Board (If Missing)
If your project was created before the update, you might need to add a default board:

**Option A: Use the Backend API**
```bash
# Create a board
curl -X POST http://localhost:5000/api/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main Board",
    "description": "Default project board",
    "projectId": "YOUR_PROJECT_ID"
  }'

# Create columns for the board
curl -X POST http://localhost:5000/api/columns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "To Do",
    "boardId": "YOUR_BOARD_ID",
    "orderIndex": 0
  }'
```

**Option B: Use Prisma Studio**
```bash
cd backend
npx prisma studio
```
Manually add boards and columns through the GUI.

### 4. Clear Browser Cache
Sometimes cached data can cause issues:
- Clear browser cache and cookies
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Try incognito/private browsing mode

### 5. Check Authentication
Ensure you're properly logged in:
- Check if auth token exists in localStorage
- Verify token hasn't expired
- Try logging out and back in

### 6. Development Server Issues
If running in development:
- Restart both frontend and backend servers
- Check for port conflicts
- Verify environment variables

## Debug Mode

You can enable debug mode by adding this to your browser console:
```javascript
localStorage.setItem('debug', 'true')
```

This will show additional console logs to help identify the issue.

## Common Error Messages

### "Column ID is required"
- Project doesn't have any boards
- Board doesn't have any columns
- API request failed to fetch board data

### "Authorization header is required"
- User not logged in
- Auth token expired or invalid
- CORS issues between frontend and backend

### Button appears disabled (grayed out)
- No default column found
- Hover over button to see tooltip message
- Check browser console for errors

## Testing the Fix

1. Create a new project
2. The project should automatically have a "Main Board" with 3 columns
3. The "Create Issue" button should be enabled
4. Clicking it should open the create issue modal

## Contact Support

If issues persist:
1. Check the GitHub issues page
2. Provide browser console logs
3. Include steps to reproduce the problem
4. Mention your browser and OS version