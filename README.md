<p align="center">
  <img src="https://raw.githubusercontent.com/khmorad/csvStore/refs/heads/main/f09c8fa2-674d-41d8-a8ca-e7c39f0ccf7e.webp" alt="Mood Stabilizer" width="400" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20With-TypeScript-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Gemini_API-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Text--to--Speech-OpenAI_API-lightgrey?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Authentication-JWT-yellowgreen?style=for-the-badge" />
</p>

Mood Stabilizer is a journaling app designed to help users track and manage their emotional well-being.  
By leveraging advanced APIs and modern cloud technologies, the app provides **personalized** and **accessible** journaling features to promote mental health.

It supports dynamic journaling with AI-powered prompts, text-to-speech playback, automated emotion analysis, and secure user authentication,  
all backed by a robust **Supabase PostgreSQL** database for **real-time data** and **scalability**.

## Features

- **Dynamic Journaling** – Integrated with the **Gemini API** to provide personalized journaling prompts and responses.
- **Automated Emotion Analysis** – AI-powered emotion tracking that runs daily at 11:30 PM to analyze journal conversations.
- **Real-time Dashboard** – Comprehensive mood tracking with visual insights, trends, and progress metrics.
- **Text-to-Speech Functionality** – Utilizes the **OpenAI API** to convert journal entries to speech.
- **Secure User Authentication** – Employs **JWT** for secure login and data privacy.
- **Cloud-Native Database** – **Supabase PostgreSQL** backend ensuring real-time sync and 99.9% uptime.
- **Background Processing** – Automated emotion analysis scheduler with catch-up functionality.
- **RESTful API** – Clean separation between frontend and backend with comprehensive API documentation.

## Project Structure

This project is structured with separate frontend and backend services:

```
Mood-Tracker/
├── backend/                     # FastAPI backend
│   ├── main.py                  # FastAPI application with lifespan events
│   ├── routers/                 # API route handlers
│   │   ├── users.py             # User management endpoints
│   │   ├── journal_entries.py   # Journal entry endpoints
│   │   ├── auth.py              # Authentication endpoints
│   │   └── emotions.py          # Emotion analysis endpoints
│   ├── services/                # Business logic services
│   │   ├── supabase_service.py  # Supabase database service
│   │   └── emotion_analyzer.py  # AI emotion analysis service
│   ├── tasks/                   # Background tasks
│   │   └── emotion_scheduler.py # Automated emotion analysis
│   ├── utils/                   # Utility modules
│   │   └── supabase_client.py   # Supabase client configuration
│   ├── requirements.txt         # Python dependencies
│   └── start.py                 # Startup script
├── frontend/                    # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Backend (FastAPI + Supabase)

The backend is built with FastAPI and uses Supabase as the database service, providing real-time capabilities and managed PostgreSQL.

### Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your credentials:

   ```bash
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key

   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key

   # Legacy Database (if migrating)
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   API_HOST=0.0.0.0
   API_PORT=8000
   ```

5. Start the backend server:
   ```bash
   python start.py
   ```

The API will be available at `http://localhost:8000`

### Database Schema

The application uses the following Supabase PostgreSQL tables:

- **`user`** - User accounts and profiles
- **`journal_entry`** - Daily journal entries with AI responses
- **`emotions`** - AI-analyzed emotion data from journal conversations
- **`episode`** - Mood episodes and patterns
- **`episode_type`** - Episode categorization

### Background Services

- **Emotion Scheduler** - Runs daily at 11:30 PM to analyze emotions from journal conversations
- **Catch-up Analysis** - Automatically fills in missing emotion analysis for past days
- **API Health Monitoring** - Monitors Gemini API connectivity and performance

### API Endpoints

#### Core Endpoints

- `GET /` - Health check
- `GET /health` - Database health check

#### User Management

- `GET /users` - Get all users
- `POST /users` - Create a new user
- `POST /users/login` - User login
- `GET /users/{user_id}` - Get specific user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

#### Journal Entries

- `GET /journal-entries` - Get all journal entries
- `POST /journal-entries` - Create journal entry
- `GET /journal-entries/{entry_id}` - Get specific entry
- `PUT /journal-entries/{entry_id}` - Update entry
- `DELETE /journal-entries/{entry_id}` - Delete entry

#### Emotion Analysis

- `GET /emotions/` - Get emotion analysis results
- `GET /emotions/dashboard/{user_id}` - Get comprehensive dashboard data
- `POST /emotions/analyze` - Manually trigger emotion analysis
- `GET /emotions/summary/{user_id}` - Get emotion summary for date range
- `GET /emotions/health` - Emotion system health check

## Frontend (Next.js)

The frontend is built with Next.js and communicates with the FastAPI backend through RESTful APIs.

### Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Features in Detail

### 🤖 AI-Powered Emotion Analysis

- **Automated Processing**: Daily analysis at 11:30 PM
- **Gemini AI Integration**: Advanced emotion detection from conversations
- **7 Emotion Categories**: Happy, Sad, Anxious, Stressed, Angry, Agitated, Neutral
- **Historical Analysis**: Catch-up processing for missed days

### 📊 Comprehensive Dashboard

- **Mood Improvement Tracking**: Percentage-based progress metrics
- **Emotional Landscape**: Visual breakdown of emotion patterns
- **Journey Visualization**: Calendar view of daily mood scores
- **Progress Metrics**: Streaks, stability, and good days tracking

### 🔄 Real-time Data Management

- **Supabase Integration**: Real-time database synchronization
- **RESTful API**: Clean separation of concerns
- **Error Handling**: Comprehensive logging and error recovery
- **Performance Optimization**: Efficient query handling and caching

## Development

### Running Both Services

1. Start the backend:

   ```bash
   cd backend
   python start.py
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### API Documentation

Once the backend is running, you can view the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Technologies Used

### Backend

- **FastAPI** - Modern, fast web framework for building APIs
- **Supabase** - Open source Firebase alternative with PostgreSQL
- **PostgreSQL** - Advanced open source relational database
- **Google Gemini AI** - Advanced language model for emotion analysis
- **OpenAI API** - Text-to-speech functionality
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Pydantic** - Data validation using Python type annotations
- **Python-dotenv** - Environment variable management

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **Lucide Icons** - Beautiful icon library

## Environment Variables

### Backend (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Legacy Database (if needed)
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment

The FastAPI backend can be deployed to various cloud platforms:

- **Vercel** - Serverless deployment
- **Railway** - Container-based deployment
- **Google Cloud Run** - Scalable containerized deployment
- **AWS ECS** - Enterprise container service

### Database

Supabase provides managed PostgreSQL hosting with:

- **Auto-scaling** - Handles traffic spikes automatically
- **Real-time subscriptions** - Live data updates
- **Built-in authentication** - User management system
- **Edge functions** - Serverless compute at the edge

## Performance Metrics

- **API Response Time**: 25% improvement with optimized queries
- **Database Uptime**: 99.9% with Supabase managed service
- **Real-time Sync**: Sub-second data synchronization
- **Emotion Analysis**: Daily processing of all active users
- **Error Recovery**: Automatic catch-up for missed analyses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
