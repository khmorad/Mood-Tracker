# Mood Tracker

<img src="https://raw.githubusercontent.com/khmorad/csvStore/refs/heads/main/f09c8fa2-674d-41d8-a8ca-e7c39f0ccf7e.webp" alt="Mood Stabilizer" width="400" />

Mood Stabilizer is a journaling app designed to help users track and manage their emotional well-being. By leveraging advanced APIs and scalable cloud technologies, the app provides personalized and accessible journaling features to promote mental health.

## Features

- **Dynamic Journaling**: Integrated with the **Gemini API** to provide personalized journaling prompts and responses.
- **Text-to-Speech Functionality**: Utilizes the **OpenAI API** to enhance accessibility by converting journal entries to speech.
- **Secure User Authentication**: Employs **JSON Web Tokens (JWT)** to ensure secure user login and data privacy.
- **Reliable Data Management**: Backend powered by a **MySQL database**, deployed on **AWS**, ensuring 99.9% uptime and scalability.
- **Optimized Performance**: Backend performance optimized with efficient query handling, reducing API response times by 25%.

## Project Structure

This project is now structured with separate frontend and backend:

```
Mood-Tracker/
├── backend/           # FastAPI backend
│   ├── main.py       # FastAPI application
│   ├── routers/      # API route handlers
│   ├── requirements.txt
│   └── start.py      # Startup script
├── frontend/         # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Backend (FastAPI)

The backend is built with FastAPI and handles all database interactions.

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

4. Create a `.env` file based on `env_example.txt`:

   ```bash
   cp env_example.txt .env
   ```

   Then edit `.env` with your database credentials.

5. Start the backend server:
   ```bash
   python start.py
   ```

The API will be available at `http://localhost:8000`

### API Endpoints

- `GET /` - Health check
- `GET /health` - Database health check
- `GET /users` - Get all users
- `POST /users` - Create a new user
- `POST /users/login` - User login
- `GET /users/{user_id}` - Get specific user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user
- `GET /journal-entries` - Get all journal entries
- `POST /journal-entries` - Create journal entry
- `GET /journal-entries/{entry_id}` - Get specific entry
- `PUT /journal-entries/{entry_id}` - Update entry
- `DELETE /journal-entries/{entry_id}` - Delete entry

## Frontend (Next.js)

The frontend is built with Next.js and communicates with the FastAPI backend.

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

## Features

- **User Authentication**: Sign up and login functionality
- **Mood Tracking**: Track daily moods with AI analysis
- **Journal Entries**: AI-powered journaling with mood analysis
- **Dashboard**: Visual mood tracking and insights
- **Responsive Design**: Works on desktop and mobile

## Database

The application uses MySQL for data storage. Make sure your database is running and the tables are created:

- `User` table for user accounts
- `journal_entry` table for mood tracking entries

## Development

### Running Both Services

1. Start the backend:

   ```bash
   python -m backend.start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend | npm run dev
   ```

### API Documentation

Once the backend is running, you can view the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Technologies Used

### Backend

- FastAPI
- SQLAlchemy
- PyMySQL
- Python-dotenv

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Chart.js

## Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
