# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
```bash
# Start all services (MySQL, backend, frontend)
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

### Testing
```bash
# Run all tests (recommended)
./run_tests.sh

# Frontend tests only
docker compose exec frontend npm test
docker compose exec frontend npm run test:ci  # CI mode with coverage

# Backend unit tests
docker compose exec backend python -m pytest test_main.py -v

# Backend API integration tests
docker compose exec backend python simple_test.py

# Single test file
docker compose exec backend python -m pytest test_main.py::TestAuth -v
```

### Linting and Code Quality
```bash
# Frontend linting
docker compose exec frontend npm run lint

# Backend linting (flake8 configuration in .flake8)
docker compose exec backend flake8 .
```

### Database Operations
```bash
# Reset database completely
docker compose down -v
docker compose up -d

# Access MySQL directly
docker compose exec mysql mysql -u todoapp -ptodoapp_password todoapp
```

## Architecture Overview

This is a **three-tier containerized todo application** with clear separation between presentation, business logic, and data layers.

### Backend Architecture (FastAPI)
- **Authentication**: JWT-based with 30-minute expiration, stored in localStorage
- **Database**: SQLAlchemy ORM with three main models: `User` → `Project` → `TodoItem`
- **API Pattern**: RESTful with standardized error responses and proper HTTP status codes
- **Key Files**: 
  - `backend/main.py`: FastAPI app with all route definitions
  - `backend/database.py`: SQLAlchemy models and database configuration
  - `backend/auth.py`: JWT token creation/validation utilities

### Frontend Architecture (React + TypeScript)
- **State Management**: Local React state only (no Redux/Zustand)
- **API Layer**: Centralized Axios client in `services/api.ts` with request/response interceptors
- **Component Structure**: Single-page app with conditional rendering based on auth state
- **Authentication Flow**: JWT stored in localStorage, automatic token attachment via Axios interceptors

### Database Relationships
```
User (1:N Project, 1:N TodoItem)
Project (1:N TodoItem, N:1 User)
TodoItem (N:1 User, N:1 Project)
```

Each user's data is completely isolated. Projects cascade-delete their todos when deleted.

### Key Patterns

**Authentication State Management**: 
- Frontend checks localStorage on mount, validates with `/auth/me`
- Invalid tokens automatically clear auth state and redirect to login
- All API requests include `Authorization: Bearer {token}` header

**Error Handling**:
- Backend returns consistent JSON error responses with descriptive messages
- Frontend shows user-friendly error messages in Japanese
- Database errors are caught and returned as appropriate HTTP status codes

**Type Safety**:
- TypeScript interfaces in `frontend/src/types/` match Pydantic models
- Consistent data shapes between frontend and backend
- API responses are typed for better development experience

## Development Guidelines

### Adding New Features
1. **Backend**: Add Pydantic models for request/response, implement routes in `main.py`, add database model changes to `database.py`
2. **Frontend**: Update TypeScript types, create/modify components, update API service layer
3. **Testing**: Add corresponding tests in both `test_main.py` (backend) and component tests (frontend)

### Database Changes
- Models are defined in `backend/database.py` using SQLAlchemy
- No formal migration system - for development, reset with `docker compose down -v`
- All foreign key relationships use proper constraints and cascade deletes

### Component Communication
- Data flows down via props, events flow up via callbacks
- No global state management - consider adding if complexity grows
- API calls are centralized in `services/api.ts` with proper error handling

### Testing Conventions
- Backend tests use separate SQLite database for isolation
- Frontend tests use React Testing Library patterns
- Integration tests in `simple_test.py` validate end-to-end API functionality
- Run full test suite before commits using `./run_tests.sh`

## Environment Variables
- `REACT_APP_API_URL`: Frontend API endpoint (default: http://localhost:8000)
- Backend uses Docker Compose environment variables for MySQL connection
- No `.env` file - configuration via Docker Compose and build-time variables