const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@nexara.com' },
    update: {},
    create: {
      email: 'test@nexara.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: hashedPassword,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexara.com' },
    update: {},
    create: {
      email: 'admin@nexara.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
    },
  });

  const developerUser = await prisma.user.upsert({
    where: { email: 'dev@nexara.com' },
    update: {},
    create: {
      email: 'dev@nexara.com',
      username: 'developer',
      firstName: 'Developer',
      lastName: 'User',
      passwordHash: hashedPassword,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@nexara.com' },
    update: {},
    create: {
      email: 'viewer@nexara.com',
      username: 'viewer',
      firstName: 'Viewer',
      lastName: 'User',
      passwordHash: hashedPassword,
    },
  });

  console.log(
    '✅ Created test users:',
    user.email,
    adminUser.email,
    developerUser.email,
    viewerUser.email
  );

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'Sample Project',
      description: 'A sample project to demonstrate Nexara features',
      ownerId: user.id,
    },
  });

  console.log('✅ Created sample project:', project.name);

  // Create sample boards
  const board1 = await prisma.board.upsert({
    where: { id: 'sample-board-1' },
    update: {},
    create: {
      id: 'sample-board-1',
      name: 'Development Board',
      description: 'Main development board for the project',
      projectId: project.id,
    },
  });

  const board2 = await prisma.board.upsert({
    where: { id: 'sample-board-2' },
    update: {},
    create: {
      id: 'sample-board-2',
      name: 'Bug Tracking',
      description: 'Board for tracking and managing bugs',
      projectId: project.id,
    },
  });

  console.log('✅ Created sample boards');

  // Create sample columns for board 1
  const columns1 = [
    { id: 'col-1', name: 'To Do', orderIndex: 0 },
    { id: 'col-2', name: 'In Progress', orderIndex: 1 },
    { id: 'col-3', name: 'In Review', orderIndex: 2 },
    { id: 'col-4', name: 'Done', orderIndex: 3 },
  ];

  for (const column of columns1) {
    await prisma.column.upsert({
      where: { id: column.id },
      update: {},
      create: {
        id: column.id,
        name: column.name,
        orderIndex: column.orderIndex,
        boardId: board1.id,
      },
    });
  }

  // Create sample columns for board 2
  const columns2 = [
    { id: 'col-5', name: 'Reported', orderIndex: 0 },
    { id: 'col-6', name: 'Investigating', orderIndex: 1 },
    { id: 'col-7', name: 'Fixing', orderIndex: 2 },
    { id: 'col-8', name: 'Fixed', orderIndex: 3 },
  ];

  for (const column of columns2) {
    await prisma.column.upsert({
      where: { id: column.id },
      update: {},
      create: {
        id: column.id,
        name: column.name,
        orderIndex: column.orderIndex,
        boardId: board2.id,
      },
    });
  }

  console.log('✅ Created sample columns');

  // Add project members with different roles
  const projectMembers = [
    {
      projectId: project.id,
      userId: adminUser.id,
      role: 'ADMIN',
    },
    {
      projectId: project.id,
      userId: developerUser.id,
      role: 'DEVELOPER',
    },
    {
      projectId: project.id,
      userId: viewerUser.id,
      role: 'VIEWER',
    },
  ];

  for (const member of projectMembers) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: member.userId,
        },
      },
      update: {},
      create: member,
    });
  }

  console.log('✅ Created project members with different roles');

  // Create sample issues
  const issues = [
    {
      id: 'issue-1',
      title: 'Implement user authentication',
      description:
        'Create login and registration functionality with JWT tokens',
      type: 'FEATURE',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      columnId: 'col-2',
      assigneeId: user.id,
      reporterId: user.id,
    },
    {
      id: 'issue-2',
      title: 'Fix login button styling',
      description: 'The login button is not properly styled on mobile devices',
      type: 'BUG',
      priority: 'MEDIUM',
      status: 'TODO',
      columnId: 'col-1',
      reporterId: user.id,
    },
    {
      id: 'issue-3',
      title: 'Add project dashboard',
      description: 'Create a dashboard to show project overview and statistics',
      type: 'FEATURE',
      priority: 'MEDIUM',
      status: 'TODO',
      columnId: 'col-1',
      reporterId: user.id,
    },
    {
      id: 'issue-4',
      title: 'Database connection timeout',
      description:
        'Users are experiencing timeout errors when connecting to the database',
      type: 'BUG',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      columnId: 'col-6',
      assigneeId: user.id,
      reporterId: user.id,
    },
    {
      id: 'issue-5',
      title: 'Code review completed',
      description: 'Authentication module has been reviewed and approved',
      type: 'TASK',
      priority: 'LOW',
      status: 'DONE',
      columnId: 'col-4',
      assigneeId: user.id,
      reporterId: user.id,
    },
  ];

  for (const issue of issues) {
    await prisma.issue.upsert({
      where: { id: issue.id },
      update: {},
      create: issue,
    });
  }

  console.log('✅ Created sample issues');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Sample Data Created:');
  console.log(`👤 Owner: ${user.email} (password: Password123!)`);
  console.log(`👤 Admin: ${adminUser.email} (password: Password123!)`);
  console.log(`👤 Developer: ${developerUser.email} (password: Password123!)`);
  console.log(`👤 Viewer: ${viewerUser.email} (password: Password123!)`);
  console.log(`📁 Project: ${project.name}`);
  console.log(`📋 Boards: ${board1.name}, ${board2.name}`);
  console.log(`📝 Issues: ${issues.length} sample issues`);
  console.log(`👥 Project Members: Owner, Admin, Developer, Viewer`);
  console.log('\n🚀 You can now start the server and test the API!');
  console.log('\n🔐 Role-based Access Control:');
  console.log('   • OWNER: Full access to everything');
  console.log('   • ADMIN: Can manage project settings, members, boards');
  console.log('   • DEVELOPER: Can create/edit issues, move between columns');
  console.log('   • VIEWER: Read-only access');
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
