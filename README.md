# AI-Powered Project Management Platform

</div>

<p align="center">## 🚀 Project Overview

Nexara is a modern, AI-powered project management platform designed for development teams. Currently featuring:

### 🎯 **Current Features (Production Ready)**
- **User Authentication** with JWT tokens and refresh token support
- **Email Verification** with beautiful OTP emails and real-time validation
- **User Registration** with comprehensive form validation and availability checking
- **Secure Login/Logout** supporting both email and username authentication
- **User Dashboard** with project management interface
- **Real-time Validation** for usernames, emails, and password strength
- **Professional Email Templates** for verification and welcome messages

### 🔮 **Planned Features**
- **Project Management** with Kanban boards and sprint planning
- **AI Integration** with GPT-4 for intelligent task management
- **Team Collaboration** with real-time updates and notifications
- **Advanced Analytics** with performance insights and reportinge>
    <source media="(prefers-color-scheme: dark)" srcset="public/assets/logos/logo-icon-for-dark-bg.svg" />
    <source media="(prefers-color-scheme: light)" srcset="public/assets/logos/logo-icon-for-light-bg.svg" />
    <img
      alt="Nexara Logo"
      src="public/assets/logos/logo-icon-for-light-bg.svg"
      style="width: 200px; height: auto;" />
  </picture>
</p>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Slack](https://img.shields.io/badge/slack-join%20community-blueviolet.svg)](https://join.slack.com/t/promptzy/shared_invite/zt-3acy22kkh-R~nMYTl7op_MF5UaLnwdsA)
[![TypeScript](https://img.shields.io/badge/typescript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-13+-black.svg)](https://nextjs.org/)
[![Automation Status](https://img.shields.io/badge/automation-fully%20active-green.svg)](#-automated-contribution-system)

_Intelligent automation and AI-driven insights for modern development teams_

</div>

---

## 🤖 Automated Contribution System

**Welcome Contributors!** This repository features a comprehensive automation system that makes contributing effortless:

### ✨ **What Happens Automatically:**

- 🏷️ **Smart Labeling** - PRs get labeled by type, area, size, and priority
- 👍 **Auto-Approval** - External PRs are automatically approved to run workflows
- 🎯 **Quality Checks** - Automatic linting, testing, and build verification
- 📊 **Contributor Tracking** - All contributions are tracked and rewarded
- 🔄 **Workflow Execution** - All workflows run for all contributors immediately

### 🎮 **Manual Commands Available:**

- `/check` - Re-run all quality checks and workflows
- `/rerun` - Re-run failed workflows and refresh approvals
- `/label` - Re-trigger smart labeling system
- Plus [15+ other commands](#available-commands) for advanced management

### 📈 **For New Contributors:**

1. **Fork the repository** and create your branch
2. **Make your changes** - the system auto-detects the type and scope
3. **Open a pull request** - automation kicks in immediately:
   - ✅ PR gets automatically approved for workflow execution
   - 🏷️ Smart labels applied (type/feature, area/frontend, size/M, etc.)
   - 🧪 All quality checks run automatically (no waiting!)
   - 📝 You're added to our contributor tracking system
4. **Address any feedback** - use `/check` to re-run tests after fixes
5. **Get merged** - maintainers can use `/merge` for quick integration

### 🛠️ **Zero Configuration Required:**

- **No setup needed** - automation works out of the box
- **All PR types welcome** - features, fixes, docs, tests, refactors
- **External forks supported** - same experience for everyone
- **Graceful error handling** - clear feedback if something goes wrong


## 🚀 Project Overview

Zenjira is like a personal AI assistant for Jira teams. It helps save time and reduce manual work by offering:

- **No-code automation** using n8n (just drag and drop rules!)
- **AI features** like ticket summarization and sprint planning with GPT‑4
- **Live dashboards** and visual tools like Gantt charts
- **Deep integrations** with GitHub/GitLab, Slack, CI/CD tools, and more

It’s built as a full **web application** — not just a browser extension — meaning teams log into Zenjira just like any other SaaS platform to get started.

---

## ✨ Features

### 🔐 **Authentication & Security**

- **🔑 Secure Registration**: Complete user registration with real-time validation
- **📧 Email Verification**: Beautiful HTML emails with 6-digit OTP codes
- **🛡️ JWT Authentication**: Secure token-based auth with refresh token support
- **👤 Flexible Login**: Support for both email and username authentication
- **🔒 Protected Routes**: Secure dashboard and user-specific content
- **🔄 Real-time Validation**: Instant feedback for usernames, emails, and passwords

### 📧 **Email System**

- **🎨 Beautiful Templates**: Professional HTML email designs
- **⏱️ Smart OTP**: 6-digit codes with 10-minute expiration
- **🔄 Resend Feature**: Rate-limited OTP resending with countdown
- **🎯 Development Mode**: Ethereal Email integration for testing
- **📬 Welcome Emails**: Automated welcome messages after verification

### 🎨 **User Experience**

- **⚡ Real-time Feedback**: Instant username/email availability checking
- **🎯 Form Validation**: Comprehensive client and server-side validation
- **🌟 Animated UI**: Smooth transitions and micro-interactions
- **📱 Responsive Design**: Works perfectly on all device sizes
- **🎭 Dark Theme**: Modern dark interface with gradient accents

### 🛠 **Developer Experience**

- **🔧 Type Safety**: Full TypeScript implementation
- **🗄️ Database ORM**: Prisma for type-safe database queries
- **📝 API Documentation**: Well-documented REST endpoints
- **🧪 Error Handling**: Comprehensive error management
- **🔍 Logging**: Detailed logging for debugging and monitoring

---

## 🛠 Technology Stack

<details>
<summary><strong>Frontend Architecture</strong></summary>

| Technology        | Purpose           | Version |
| ----------------- | ----------------- | ------- |
| **Next.js**       | React Framework   | 13+     |
| **TypeScript**    | Type Safety       | 4.9+    |
| **Tailwind CSS**  | Styling System    | 3.x     |
| **shadcn/ui**     | Component Library | Latest  |
| **Redux Toolkit** | State Management  | 1.9+    |

</details>

<details>
<summary><strong>Backend Infrastructure</strong></summary>

| Technology            | Purpose                 | Implementation   |
| --------------------- | ----------------------- | ---------------- |
| **Node.js + Express** | Runtime & API Framework | REST API         |
| **PostgreSQL**        | Primary Database        | 14+ via Prisma  |
| **Prisma ORM**        | Database Management     | Type-safe queries|
| **JWT + Refresh**     | Authentication          | Secure tokens    |
| **Nodemailer**        | Email Service           | SMTP/Gmail       |
| **bcrypt**            | Password Hashing        | Secure encryption|
| **Express Validator** | Input Validation        | Server-side      |

</details>

<details>
<summary><strong>AI & Machine Learning</strong></summary>

| Service          | Purpose                     | Provider     |
| ---------------- | --------------------------- | ------------ |
| **GPT-4**        | Natural Language Processing | OpenAI       |
| **LangChain**    | AI Pipeline Management      | Community    |
| **Hugging Face** | Semantic Search Models      | Transformers |

</details>

<details>
<summary><strong>DevOps & Infrastructure</strong></summary>

| Technology               | Purpose              | Environment |
| ------------------------ | -------------------- | ----------- |
| **PostgreSQL**           | Database             | All         |
| **Kubernetes**           | Orchestration        | Production  |
| **GitHub Actions**       | CI/CD Pipeline       | All         |
| **AWS EKS**              | Managed Kubernetes   | Production  |
| **Prometheus + Grafana** | Monitoring & Metrics | Production  |

</details>

---

## 💬 Community & Support

<div align="center">

### Join Our Developer Community

[![Slack Community](https://img.shields.io/badge/Slack-Join%20Community-4A154B?style=for-the-badge&logo=slack&logoColor=white)](https://join.slack.com/t/promptzy/shared_invite/zt-3acy22kkh-R~nMYTl7op_MF5UaLnwdsA)

Connect with fellow developers, get technical support, and stay updated on the latest features and releases.

</div>

---

## � Development Roadmap

<div align="center">

### 4-Month Sprint to Production

</div>

```mermaid
gantt
    title Nexara Development Timeline
    dateFormat  MM-DD
    section Phase 1
    Jira Clone Foundation    :active, p1, 08-01, 08-31
    section Phase 2
    Automation & AI          :p2, 09-01, 09-30
    section Phase 3
    Advanced Features        :p3, 10-01, 10-31
    section Phase 4
    Testing & Launch         :p4, 11-01, 11-30
```

### 🗓 **Phase 1: Authentication Foundation** _(✅ COMPLETED)_

- [x] **User Authentication System** - JWT tokens with refresh token support
- [x] **Email Verification** - Beautiful OTP emails with 6-digit codes and HTML templates
- [x] **User Registration** - Real-time validation for usernames, emails, and passwords
- [x] **Secure Login/Logout** - Support for both email and username authentication
- [x] **User Dashboard** - Protected routes and user profile management
- [x] **Database Schema** - PostgreSQL with Prisma ORM for type-safe queries
- [x] **API Infrastructure** - Express.js with comprehensive validation and error handling

### 🔧 **Phase 2: Project Management Core** _(🚧 IN PROGRESS)_

- [ ] **Project Creation** - Create and manage multiple projects per user
- [ ] **Issue Management** - Create, edit, assign, and track issues with status workflows
- [ ] **Project Boards** - Kanban boards and basic sprint functionality
- [ ] **Team Management** - Invite users to projects with role-based permissions
- [ ] **Project Settings** - Configure project preferences and visibility

### 🤖 **Phase 3: Advanced Features** _(📋 PLANNED)_

- [ ] **AI Integration** - GPT-4 integration for intelligent summaries and planning assistance
- [ ] **Automation Engine** - Workflow builder for custom automations
- [ ] **External Integrations** - GitHub/GitLab pull request insights and code-to-issue linking
- [ ] **Real-time Collaboration** - WebSocket integration for live updates
- [ ] **Advanced Analytics** - Sprint retrospectives and team performance metrics

### 🚀 **Phase 4: Production Ready** _(📋 PLANNED)_

- [ ] **Quality Assurance** - Comprehensive testing suite (Jest, Cypress)
- [ ] **Performance Optimization** - Load testing and optimization
- [ ] **Monitoring & Observability** - Prometheus, Sentry, logging
- [ ] **Documentation & Launch** - API docs, user guides, beta release

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** (or **yarn**)
- **PostgreSQL** 14+ database server
- **Git** for version control
- **Gmail account** (for email verification) or SMTP server

### 🚀 Complete Setup Guide

#### 1. **Clone and Install**

```bash
# Clone the repository
git clone https://github.com/Axelvyn/Nexara.git
cd Nexara

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. **Database Setup**

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE nexara_db;
\q

# Or use your preferred database management tool
```

#### 3. **Environment Configuration**

```bash
# Copy environment template
cd backend
cp .env.example .env
```

**Edit `.env` file with your configuration:**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/nexara_db?schema=public"

# JWT Configuration (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-min-32-chars"
JWT_REFRESH_EXPIRES_IN="30d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# Email Configuration (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"  # Gmail App Password, not regular password
EMAIL_FROM="Nexara <noreply@nexara.com>"

# Frontend URL
FRONTEURL="http://localhost:3000"
```

#### 4. **Gmail App Password Setup** (for email verification)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Factor Authentication** if not already enabled
3. Go to **Security** → **App passwords**
4. Generate an app password for "Mail"
5. Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

#### 5. **Database Migration**

```bash
# Push database schema
cd backend
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: Seed database with test data
npm run db:seed
```

#### 6. **Start Development Servers**

```bash
# Terminal 1: Start backend (from backend directory)
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2: Start frontend (from frontend directory)
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Development Commands

#### 🎨 **Frontend (Next.js)**

```bash
cd frontend

# Start development server with Turbopack
npm run dev        # Runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

#### ⚙️ **Backend (Express API)**

```bash
cd backend

# Start development server with auto-reload
npm run dev        # Runs on http://localhost:5000

# Start production server
npm start

# Check API health
curl http://localhost:5000/health

# Format backend code
npm run format

# Check code formatting
npm run format:check
```

#### 🔄 **Full Stack Development**

```bash
# Option 1: Run both frontend and backend simultaneously (recommended)
npm run dev        # Runs both servers with auto-reload

# Option 2: Run individually in separate terminals
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

#### 🎨 **Code Formatting (Prettier)**

```bash
# Format backend code
npm run format:backend

# Check backend formatting
npm run format:check:backend

# Or from backend directory
cd backend
npm run format
npm run format:check
```

### 🔌 API Endpoints

#### **Authentication**
| Endpoint                    | Method | Description                              |
| --------------------------- | ------ | ---------------------------------------- |
| `/health`                   | GET    | Server health check                      |
| `/api/auth/register`        | POST   | User registration with email verification|
| `/api/auth/login`           | POST   | User login (email or username)          |
| `/api/auth/verify-email`    | POST   | Verify email with OTP code              |
| `/api/auth/resend-otp`      | POST   | Resend verification code                 |
| `/api/auth/me`              | GET    | Get current user profile (protected)    |
| `/api/auth/logout`          | POST   | User logout (protected)                  |
| `/api/auth/refresh`         | POST   | Refresh JWT token                        |

#### **Validation**
| Endpoint                         | Method | Description                         |
| -------------------------------- | ------ | ----------------------------------- |
| `/api/auth/check-username/:username` | GET    | Check username availability         |
| `/api/auth/check-email/:email`      | GET    | Check email availability            |

#### **Coming Soon**
| Endpoint                    | Method | Description                              |
| --------------------------- | ------ | ---------------------------------------- |
| `/api/projects`             | GET    | List user projects                       |
| `/api/projects`             | POST   | Create new project                       |
| `/api/issues`               | GET    | List project issues                      |
| `/api/boards`               | GET    | List project boards                      |

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 🧪 Testing the Application

#### **1. Test User Registration Flow**

1. Visit http://localhost:3000/signup
2. Fill out the registration form:
   - Real-time username availability checking
   - Real-time email availability checking
   - Password strength validation with visual feedback
3. Submit form → Check your email for verification code
4. Visit verification link or enter OTP code
5. Successful verification → Redirected to dashboard

#### **2. Test Email Verification**

- **Development Mode**: Check console for Ethereal Email preview links
- **Gmail Mode**: Check your Gmail inbox for beautiful verification emails
- **Test OTP**: 6-digit codes expire in 10 minutes
- **Resend Feature**: 60-second cooldown between resends

#### **3. Test Login Flow**

1. Visit http://localhost:3000/login
2. Login with email or username
3. Unverified users → Redirected to email verification
4. Verified users → Redirected to dashboard

### 🔧 Troubleshooting

#### **Common Issues**

**Database Connection Error:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL if needed
sudo service postgresql restart

# Verify database exists
psql -U postgres -l
```

**Email Not Sending:**
```bash
# Check Gmail App Password is correct
# Verify 2FA is enabled on Google Account
# Check .env EMAIL_* variables

# Test email configuration
node -e "console.log(process.env.EMAIL_USER)"
```

**Prisma Client Issues:**
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Reset database if needed
npx prisma db push --force-reset
```

**Frontend Build Errors:**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build
```

#### **Development Tips**

- **View Emails in Development**: Check console for Ethereal Email preview URLs
- **Database GUI**: Use `npx prisma studio` to view/edit database
- **API Testing**: Use Postman or curl to test endpoints
- **Logs**: Check terminal output for detailed error messages

---
## 📜 Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to understand the expected behavior in this community.

## Community Guidelines

📜 Please review our [Community Guidelines](./COMMUNITY_GUIDELINES.md) before contributing.


### 🌟 Our Amazing Contributors

<a href="https://github.com/Promptzy/Zenjira/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Promptzy/Zenjira" alt="Contributors" />
</a>

_Can't see the contributors graph? [View all contributors on GitHub →](https://github.com/Promptzy/Zenjira/graphs/contributors)_

[![Contributors](https://img.shields.io/github/contributors/Promptzy/Zenjira?style=for-the-badge&color=orange)](https://github.com/Promptzy/Zenjira/graphs/contributors)

</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the Nexara Team**

_Transforming development workflows, one sprint at a time._

</div>
