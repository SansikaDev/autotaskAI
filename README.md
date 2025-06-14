# AutoTaskAI

An AI-powered task automation tool that helps professionals streamline their workflows through intelligent automation and machine learning.

## 🚀 Features

### Authentication & User Management
- 🔐 Secure authentication system
  - Google OAuth integration
  - JWT-based authentication
  - Automatic user profile creation from Google
  - Email verification status tracking

### Task Management
- 📝 Smart task creation and management
  - AI-powered task categorization
  - Automatic task type suggestions
  - Confidence scoring for AI predictions
  - Suggested actions based on task content
  - Real-time task updates

### AI/ML Capabilities
- 🤖 Intelligent task processing
  - Natural language processing for task analysis
  - Keyword-based task classification
  - Machine learning model for task suggestions
  - Confidence scoring system
  - Customizable AI parameters

### User Interface
- 🎨 Modern, responsive design
  - Material-UI components
  - Glass morphism styling
  - Dark/light theme support
  - Responsive layout
  - Intuitive navigation

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend
        UI[React Frontend]
        Auth[Auth Context]
        Routes[Protected Routes]
    end

    subgraph Backend
        API[Express API]
        AuthMiddleware[Auth Middleware]
        TaskController[Task Controller]
        UserModel[User Model]
    end

    subgraph AI Service
        ML[TensorFlow Model]
        Predictor[Task Predictor]
        Classifier[Task Classifier]
    end

    subgraph Database
        MongoDB[(MongoDB)]
    end

    UI -->|HTTP/HTTPS| API
    Auth -->|JWT| AuthMiddleware
    API -->|Auth| AuthMiddleware
    AuthMiddleware -->|Verify| UserModel
    API -->|CRUD| TaskController
    TaskController -->|Store| MongoDB
    TaskController -->|Predict| AI Service
    ML -->|Train| Classifier
    Classifier -->|Suggest| Predictor
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI
- **State Management**: React Context
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS with Glass Morphism

### Backend
- **Runtime**: Node.js with Express
- **Authentication**: Passport.js, JWT
- **Database**: MongoDB with Mongoose
- **Validation**: Express Validator
- **Logging**: Custom logging middleware

### AI/ML Service
- **Framework**: Python with TensorFlow
- **API**: FastAPI
- **NLP**: Custom keyword-based processing
- **ML Models**: Task classification model
- **Scoring**: Confidence scoring system

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: MongoDB
- **Environment**: Development/Production configs

## 📁 Project Structure

```
autotaskAI/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── backend/
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Helper functions
│   └── tests/             # Backend tests
├── ai/
│   ├── models/            # ML models
│   ├── services/          # AI services
│   └── utils/             # Helper functions
└── docker/                # Docker configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- MongoDB
- Docker and Docker Compose
- Google Cloud Platform account (for OAuth)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/autotaskAI.git
   cd autotaskAI
   ```

2. Create environment files:
   ```bash
   # Backend .env
   cp backend/.env.example backend/.env
   
   # Frontend .env
   cp frontend/.env.example frontend/.env
   
   # AI service .env
   cp ai/.env.example ai/.env
   ```

3. Configure environment variables:
   - Set up Google OAuth credentials
   - Configure MongoDB connection
   - Set JWT secret
   - Configure AI model parameters

### Development

1. Start all services with Docker:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - AI Service: http://localhost:5001

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- CORS protection
- Rate limiting
- Input validation
- Secure session handling
- Environment variable protection

## 📈 Performance Optimization

- Docker container optimization
- MongoDB indexing
- Caching strategies
- Lazy loading
- Code splitting
- Bundle optimization

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow team for the ML framework
- React team for the frontend framework
- MongoDB team for the database solution
- Material-UI team for the component library
- FastAPI team for the Python web framework 