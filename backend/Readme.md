```
backend/
│
├── main.py → Application entry point (creates FastAPI app)
├── start.py → Startup logic or CLI runner
├── requirements.txt → Project dependencies
├── .env → Environment variables and secrets
│
├── middleware/ → Custom authentication & request middleware
│ └── auth.py
│
├── models/ → Database ORM models (SQLAlchemy)
│ ├── emotion.py
│ ├── episode.py
│ ├── episode_type.py
│ ├── journal.py
│ ├── journal_entry.py
│ ├── user.py
│ └── **init**.py
│
├── routers/ → API route definitions
│ ├── auth.py
│ ├── emotions.py
│ ├── journals.py
│ ├── journal_entries.py
│ ├── plans.py
│ ├── users.py
│ └── **init**.py
│
├── schemas/ → Pydantic schemas for validation & serialization
│ ├── auth_schemas.py
│ ├── db.py
│ ├── emotion_schemas.py
│ ├── journal_schemas.py
│ ├── user_schemas.py
│ └── **init**.py
│
├── services/ → Business logic and core functionality
├── tasks/ → Background jobs or scheduled tasks
└── utils/ → Helper utilities and shared tools
```
