# Changelog

All notable changes to the AutoTaskAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-06-14

### Initial Setup & Dependency Management
- **Created `CHANGELOG.md`**: Initiated a change log file to track project modifications.
- **Resolved Python Dependency Issues**:
    - Addressed TensorFlow installation problems by creating a virtual environment.
    - Modified `requirements.txt` to specify TensorFlow version 2.13.1 for compatibility.
- **Created `.env` file**: Established a comprehensive `.env` file for environment variables at the project root.

### Docker Configuration & Build Issues
- **Initial `docker-compose up --build` Attempts**:
    - Noted and acknowledged warnings about the obsolete `version` attribute in `docker-compose.yml`.
    - Addressed a "TensorFlow 2.15.0 not found" error in the Docker container by changing `ai/requirements.txt` to use TensorFlow 2.13.1.
- **Platform Mismatch (ARM Macs)**:
    - Initially attempted to add `--platform` flag to `ai/Dockerfile`.
    - Later removed `--platform` from `ai/Dockerfile` and added `platform: linux/arm64` to `docker-compose.yml` for the `ai-service` to ensure ARM compatibility.
    - Corrected a "tensorflow/tensorflow:2.13.1 image not found" error by changing `ai/Dockerfile` to use `tensorflow/tensorflow:2.13.0`.
- **Missing `dotenv` Import in AI Service**:
    - Identified a missing `dotenv` import in `ai/main.py`.
    - Added `python-dotenv` package to `ai/requirements.txt`.
    - Modified `ai/Dockerfile` to copy the `.env` file into the AI service container.
    - Created a new `.env` file directly in the `ai/` directory with `MONGODB_URI` and `MODEL_PATH` to ensure environment variables were accessible to the AI service.
- **Successful Full Rebuild**: Executed `docker-compose down --volumes && docker-compose up --build` to rebuild the entire application from scratch, resulting in all services (MongoDB, backend, frontend, AI service) running.

### Frontend Development & Styling
- **Frontend Directory Listing**: Started frontend work by listing the `frontend` directory.
- **Core Component Creation/Modification**:
    - `App.tsx`: Set up main routing using `react-router-dom` and `AuthProvider`; adjusted responsive padding.
    - `AuthContext.tsx`: Implemented authentication context for login, registration, and logout.
    - `PrivateRoute.tsx`: Created a component to protect authenticated routes.
    - `Navbar.tsx`: Developed a navigation bar with conditional links for authenticated/unauthenticated users; implemented Material-UI styling and addressed TypeScript errors.
    - `Login.tsx` and `Register.tsx`: Styled these authentication pages with Material-UI and a glass morphism design.
    - `Dashboard.tsx`: Attempted to style with Material-UI and glass morphism, but encountered persistent TypeScript errors related to `Grid` and `StyledButton` components.
    - `TaskList.tsx`: Styled with Material-UI and glass morphism, including dynamic chip styling for status and priority.
    - `TaskForm.tsx`: Implemented the task creation/editing form with Material-UI and glass morphism; corrected backend validation error (`in-progress` to `in_progress`). Later, restructured `GlassPaper` component to resolve TypeScript error.
- **Frontend Routing for Task Editing**: Added a new route for editing tasks in `App.tsx` (`/tasks/:id/edit`) and confirmed correct linking from `TaskList.tsx`.
- **Frontend Error Handling**: Addressed a TypeScript error in `src/contexts/AuthContext.tsx` (`ReactNode` requiring type-only import) and an unused `theme` parameter error in `TaskList.tsx`.

### Backend API & AI Model Integration
- **Backend Task API Enhancement (`backend/src/routes/taskRoutes.ts`)**:
    - Added a new `GET /:id` route to fetch a single task by ID for the authenticated user, including error handling for "task not found."
    - Refactored task routes to delegate logic to a new controller.
- **New Backend Task Controller (`backend/src/controllers/taskController.ts`)**:
    - Created `backend/src/controllers/taskController.ts` to centralize task logic.
    - Implemented `getAIPrediction` function to communicate with the AI service.
    - Modified `createTask` and `updateTask` to call the AI service and store predictions (task type, confidence, suggested actions) in the task data before saving.
- **Backend `Task` Model Update (`backend/src/models/Task.ts`)**:
    - Added `ai_task_type`, `ai_confidence`, and `ai_suggested_actions` fields to the `ITask` interface and the Mongoose schema to store AI prediction results.
- **Backend Dependencies (`backend/package.json`)**:
    - Added `axios` as a dependency to enable HTTP requests to the AI service.
    - Updated `axios` to its latest version and removed `@types/axios` (as `axios` provides its own types).
- **AI Service Model Implementation (`ai/main.py`)**:
    - Replaced placeholder functions for `predict_task` and `train_model` with a basic keyword-based task classification system.
    - Defined `TASK_CATEGORIES` with associated actions and keywords.
    - Implemented `preprocess_text` for keyword-based scoring and `get_suggested_actions`.
    - Configured FastAPI `CORSMiddleware` to allow all origins during development.

### Troubleshooting & Refinements
- **Frontend AI Service URL Correction**: Corrected the AI service URL in `frontend/src/pages/TaskForm.tsx` from `http://localhost:5001/predict` to `http://localhost:5000/predict` (this was then changed again to `5001`).
- **Backend Linter Errors (`backend/src/controllers/taskController.ts`)**:
    - Addressed "Cannot find module 'axios'" by installing `@types/axios` (and later removing it as it became unnecessary).
    - Addressed "`error` is of type `unknown`" by explicitly typing caught errors and using `axios.isAxiosError` for type narrowing.
- **Port Conflict Resolution**:
    - Identified that `ControlCe` and Postman were using port 5000.
    - Changed the AI service port from 5000 to 5001 in:
        - `ai/main.py`
        - `backend/src/controllers/taskController.ts` (`AI_SERVICE_URL`)
        - `frontend/src/pages/TaskForm.tsx`
        - `docker-compose.yml` (ports mapping for `ai-service` and `AI_SERVICE_URL` for `backend`)
- **AI Service Container `ERR_CONNECTION_RESET` (Exit Code 132)**:
    - Diagnosed as a CPU architecture mismatch when using `tensorflow/tensorflow:2.13.0` on an ARM-based Mac.
    - Modified `ai/Dockerfile` to use a more generic `python:3.9-slim-buster` base image, and explicitly install `build-essential` and TensorFlow within the Dockerfile to ensure ARM compatibility.
- **Frontend Module Not Found Errors (`frontend/src/App.tsx`)**:
    - Experienced persistent "Cannot find module" errors (e.g., for `Register`, `Dashboard`, `TaskList`, `TaskForm`, `Navbar`) despite correct paths. This is suspected to be a TypeScript language server caching issue or corrupted `node_modules`.
    - Recommended manual `rm -rf frontend/node_modules frontend/package-lock.json && npm install --prefix frontend` followed by an editor restart.

## [0.1.0] - 2024-03-19

### Added
- Initial project structure
- Basic documentation
- Development environment setup
- Git configuration
- Docker setup
- MongoDB Atlas integration

### Security
- JWT authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Helmet security headers

### Documentation
- README.md with project overview
- API documentation
- Setup instructions
- Development guidelines
- Docker deployment guide

### Dependencies
- Frontend:
  - React 18
  - TypeScript
  - Material-UI
  - Redux Toolkit
  - Axios
  - React Router
  - Vite

- Backend:
  - Node.js
  - Express
  - TypeScript
  - Mongoose
  - JWT
  - bcrypt
  - Winston

- AI Service:
  - Python 3.8+
  - TensorFlow 2.13.0
  - FastAPI
  - Uvicorn
  - NumPy
  - Pandas
  - scikit-learn

### Infrastructure
- Docker
- Docker Compose
- MongoDB Atlas
- Nginx
- Google Cloud Platform (planned)

## [Planned]

### Frontend
- [ ] User authentication UI
- [ ] Task management interface
- [ ] Dashboard with analytics
- [ ] Task automation workflow builder
- [ ] Real-time notifications
- [ ] Dark mode support
- [ ] Responsive design improvements
- [ ] Unit and integration tests

### Backend
- [ ] Enhanced error handling
- [ ] Request validation
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Logging system
- [ ] Unit and integration tests
- [ ] Performance optimizations
- [ ] Caching implementation

### AI Service
- [ ] Enhanced ML model training
- [ ] Model versioning
- [ ] Automated training pipeline
- [ ] Model performance monitoring
- [ ] A/B testing framework
- [ ] Data preprocessing pipeline
- [ ] Model evaluation metrics
- [ ] Automated retraining

### Infrastructure
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Monitoring and logging
- [ ] Backup system
- [ ] Load balancing
- [ ] Auto-scaling
- [ ] Security hardening
- [ ] Disaster recovery plan

### Added
- Google OAuth authentication integration
  - Added "Login with Google" button to login page
  - Implemented Passport.js Google strategy
  - Added automatic user creation for new Google accounts
  - Added profile picture and name synchronization from Google
  - Added unique username generation for new users
- Enhanced User model with new fields
  - Added `username` field (unique identifier)
  - Added `profilePicture` field for Google profile pictures
  - Added `firstName` and `lastName` fields
  - Added `isEmailVerified` field (auto-verified for Google accounts)
- Improved authentication middleware
  - Added support for both direct ID and nested user ID in JWT tokens
  - Enhanced error handling and logging
  - Added detailed request logging
- Added comprehensive logging throughout the authentication flow
  - Request logging middleware
  - Detailed Passport.js strategy logging
  - JWT verification logging
  - User creation and update logging

### Changed
- Updated JWT token structure to use direct user ID
- Enhanced error handling in authentication routes
- Improved MongoDB connection logging
- Updated Docker configuration for better environment variable handling

### Fixed
- Fixed JWT token verification in auth middleware
- Fixed user creation flow for Google authentication
- Fixed token structure mismatch between routes
- Fixed environment variable loading in Docker containers

### Security
- Added proper CORS configuration for authentication endpoints
- Enhanced JWT token validation
- Added secure session handling
- Implemented proper error messages for authentication failures 