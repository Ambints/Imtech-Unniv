# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (NestJS)
- Install dependencies: `cd backend && npm install`
- Start development server: `cd backend && npm run start:dev`
- Start production server: `cd backend && npm run start:prod`
- Build: `cd backend && npm run build`
- Lint: Use project-defined ESLint rules (if configured) or run `npx eslint src --ext .ts` in backend
- Test: Backend uses Jest; run `cd backend && npm run test` (note: test script currently requires configuration)
- Database migrations:
  - Generate: `npm run migration:generate -- -n "MigrationName"`
  - Run: `npm run migration:run`
  - Revert: `npm run migration:revert`
- Seed data: `npm run seed:run`
- Backup scripts: `npm run backup:daily`, `npm run backup:weekly`, `npm run backup:cleanup`, `npm run backup:check-space`

### Frontend (React/Vite)
- Install dependencies: `cd frontend && npm install`
- Start development server: `cd frontend && npm run dev`
- Build for production: `cd frontend && npm run build`
- Preview production build: `cd frontend && npm run preview`
- Lint: `cd frontend && npm run lint`
- Test: `cd frontend && npm run test` (uses Vitest)

### Database
- Schema files located in root: `tenant-schema.sql`, `Shema.sql`, `test_complet.sql`
- Migration scripts in `backend/src/database/migrations/` (TypeORM) and root SQL files
- Seeds in `backend/src/database/seeds/`

## Code Architecture

### Backend Structure
- **Monorepo** with backend and frontend directories
- **NestJS Framework** with modular architecture
- **Multi-tenancy** implemented via:
  - `TenantMiddleware` (sets schema per request based on subdomain/header)
  - `TenantSchemaInterceptor` (dynamic schema selection for TypeORM)
  - Two database connections: `default` (public schema) and `tenant` (tenant schemas)
- **Module Organization** (each in `backend/src/`):
  - Core: Auth, Users, Tenants
  - Academic: Academic, Scolarite, Pedagogique modules
  - Administrative: Finance, Logistics, Communication, Discipline, Examens, Documents
  - Portals: Etudiant, Parent, Enseignant portals
  - Support: Dashboard, President, RH, Economat, Caissier, Messagerie, Configuration, Cache
- **Entities** defined in each module's `*.entities.ts` files
- **DTOs** in module-specific `dto/` directories
- **Controllers** handle HTTP requests
- **Services** contain business logic
- **Guards** for authentication/authorization (JWT-based)
- **Interceptors** for cross-cutting concerns (tenant schema, caching)
- **Utilities**: Custom cache module (`ImtechCacheModule`), helpers, exceptions

### Frontend Structure
- **Vite + React + TypeScript** stack
- **State Management**: Zustand stores (authStore, and feature-specific stores)
- **API Communication**: Axios with react-query for data fetching
- **Routing**: React Router v6
- **UI Components**: 
  - Custom components in `src/components/`
  - Pages organized by feature in `src/pages/`
  - Layout components in `src/components/layout/`
  - UI primitives in `src/components/ui/`
- **Styling**: 
  - Bootstrap 5.3
  - Custom SCSS in `src/styles/`
  - CSS modules where needed
- **Features**:
  - Authentication flows (login, token storage, role-based redirection)
  - Role-based portals (Etudiant, Parent, Enseignant, Admin, SuperAdmin, President, RH)
  - Data tables, forms, charts (using recharts)
  - File uploads/downloads
  - QR code scanning (html5-qrcode)
  - PDF generation (jspdf, jspdf-autotable)
  - Internationalization preparation (date-fns)
  - Notifications (react-hot-toast)

### Key Patterns
- **Tenant Isolation**: All tenant-specific requests use dynamic schema resolution via interceptor
- **DTO Validation**: Using class-validator and class-transformer
- **Authentication**: JWT tokens passed in Authorization header; guards protect routes
- **File Uploads**: Handled via multer (implicit in NestJS)
- **Real-time Features**: Socket.io gateway for notifications (seen in discipline module)
- **Caching**: Custom ImtechCacheModule using cache-manager with Redis store
- **Error Handling**: Centralized exception filters and interceptors
- **Seeding**: Automated seed scripts for initial data

## Common Development Tasks

### Adding a New Feature
1. Create new module: `nest generate module feature-name`
2. Generate controller/service: `nest generate controller feature-name` and `nest generate service feature-name`
3. Define entities in `feature-name.entity.ts`
4. Create DTOs in `feature-name/dto/`
5. Implement business logic in service
6. Expose endpoints in controller
7. Add module to AppModule imports
8. Create frontend pages/components in `frontend/src/pages/` or `frontend/src/components/`
9. Add API calls using axios or react-query
10. Update routing if needed in App.tsx or route-specific files

### Database Changes
1. Modify entity files in backend module directories
2. Create migration SQL or use TypeORM migrations (`npm run migration:generate`)
3. Update tenant schema if needed (tenant-schema.sql)
4. Run migrations against both public and tenant schemas
5. Update DTOs if API contract changes

### API Development
- Backend endpoints follow REST conventions under `/api/` prefix
- Controllers use standard HTTP decorators (@Get, @Post, etc.)
- DTOs validate incoming data
- Services encapsulate business logic
- Entities define database structure
- Interceptors/guards handle cross-cutting concerns

### Frontend Development
- Pages map to routes in App.tsx or route-specific index files
- Components should be reusable and placed in appropriate component directories
- State management via Zustand stores or react-query
- API services typically abstracted in custom hooks
- Forms use react-hook-form with validation
- Toast notifications via react-hot-toast

### Multi-Tenant Operations
- Create a new tenant via API: `POST /api/v1/tenants` with admin token
- Tenant-specific routes use subdomain (e.g., `tenant1.localhost:4000`) or header `X-Tenant-Slug`
- Schema creation is automatic when a new tenant is created (via tenant-schema.sql template)
- Access tenant-specific data by ensuring requests go through TenantMiddleware

### Environment Setup
1. Copy `.env.example` to `.env` in both backend and frontend
2. Configure backend: database connection, JWT secret, port
3. Configure frontend: VITE_API_URL pointing to backend
4. Install dependencies: `npm install` in both directories
5. Initialize database: run migrations and seeds
6. Start development servers: `npm run start:dev` (backend) and `npm run dev` (frontend)

## Available Scripts (from package.json)

### Backend
- `start`: NestJS server
- `start:dev`: Development mode with watch
- `start:prod`: Production server
- `build`: Compile TypeScript to JavaScript
- `migration:generate`: Generate new migration file
- `migration:run`: Apply pending migrations
- `migration:revert`: Revert last migration
- `seed:run`: Run database seeders
- `backup:daily`: Daily backup script
- `backup:weekly`: Weekly backup script
- `backup:cleanup`: Clean old backups
- `backup:check-space`: Check disk space

### Frontend
- `dev`: Start Vite development server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint
- `test`: Run Vitest tests

## Important Notes
- The backend test script currently requires Jest configuration; tests are not fully set up
- Frontend testing uses Vitest with React Testing Library
- Environment variables are critical for multi-tenancy and database connections
- Always run migrations and seeds when setting up a new database instance
- Tenant schema updates must be applied to tenant-schema.sql for new tenants to receive updated schema