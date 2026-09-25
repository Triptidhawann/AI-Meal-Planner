# AI Meal Planner

AI Meal Planner is a production-oriented meal planning application that turns a user's ingredients, dietary needs, available time, budget, and equipment into practical recipe recommendations.

## Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Authentication:** Firebase Authentication with email/password
- **Backend:** Node.js, Express
- **Persistence:** SQLite through `better-sqlite3`
- **AI:** Microsoft Foundry Agent through the Azure AI Projects SDK

## Features

- Firebase signup, login, logout, password reset, and session persistence
- Protected meal-planning, results, recipe, saved-meal, and profile routes
- AI-generated meal recommendations
- Stable recipe IDs and dynamic recipe details at `/recipe/:recipeId`
- User profiles and editable display names
- Meal preferences and food restrictions
- Recent meal searches
- Recently viewed recipes with duplicate prevention
- Saved meals scoped to the authenticated user
- SQLite persistence with foreign keys and indexes

## Architecture

```mermaid
flowchart TD
    React[React + Vite]
    Firebase[Firebase Authentication]
    Token[Firebase ID token]
    Express[Express API]
    Admin[Firebase Admin token verification]
    SQLite[(SQLite)]
    Foundry[Microsoft Foundry Agent]

    React --> Firebase
    React -->|Bearer token| Express
    Express --> Admin
    Admin -->|verified uid| SQLite
    Express --> Foundry
    Foundry -->|normalized recommendations| Express
    Express --> React
```

Firebase owns identity and authentication. SQLite stores application data only. Passwords, Firebase access tokens, refresh tokens, and service-account credentials are never stored in SQLite.

## Workflows

### Authenticated application request

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Firebase
    participant API
    participant Admin as Firebase Admin
    participant DB as SQLite

    User->>React: Sign in
    React->>Firebase: Email/password authentication
    Firebase-->>React: Authenticated session
    React->>Firebase: getIdToken()
    Firebase-->>React: ID token
    React->>API: Authorization: Bearer token
    API->>Admin: verifyIdToken(token)
    Admin-->>API: Verified uid and claims
    API->>DB: Resolve or create local user
    API-->>React: Protected data
```

### Meal planning

```mermaid
sequenceDiagram
    participant React
    participant API as Express
    participant Admin as Firebase Admin
    participant DB as SQLite
    participant Agent as Foundry Agent

    React->>API: POST /api/meal-planner/plan
    API->>Admin: Verify ID token
    API->>DB: Record validated search
    API->>Agent: Generate recommendations
    Agent-->>API: Recipe recommendations
    API-->>React: Results
```

### Recipe activity

```mermaid
flowchart LR
    Results[Results] --> Card[MealCard]
    Card -->|View recipe| Viewed[POST /api/profile/viewed]
    Viewed --> Details[/recipe/:recipeId]
    Details --> Saved[POST /api/profile/saved]
    Saved --> Profile[Profile and Saved Meals]
```

## Project Structure

```text
.
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── MealActivityContext.jsx
│   │   └── MealContext.jsx
│   ├── pages/
│   └── services/
├── backend/
│   ├── data/                         # generated SQLite database
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── services/
├── .env.example
└── backend/.env.example
```

## Requirements

- Node.js 20 or newer recommended
- npm
- Firebase project with Email/Password enabled
- Microsoft Foundry project and Agent
- Firebase Admin credentials for the backend

`better-sqlite3` is a native Node module and may require a supported platform build toolchain.

## Installation

```powershell
npm install
Push-Location backend
npm install
Pop-Location
```

## Environment Configuration

### Frontend `.env`

Copy `.env.example` to `.env` and configure the Firebase Web SDK values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:5000
```

These are browser Firebase configuration values, not Admin credentials.

### Backend `backend/.env`

Copy `backend/.env.example` to `backend/.env`:

```env
FOUNDRY_PROJECT_ENDPOINT=https://your-ai-services-account.services.ai.azure.com/api/projects/your-project-name
FOUNDRY_AGENT_NAME=AI-MealPlanner
FOUNDRY_AGENT_VERSION=your_agent_version
FRONTEND_URL=http://localhost:5173
PORT=5000
FOUNDRY_REQUEST_TIMEOUT_MS=60000

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The backend also supports Google Application Default Credentials through `GOOGLE_APPLICATION_CREDENTIALS`. Never place a service-account JSON file in the repository and never use `VITE_FIREBASE_ADMIN_*` variables.

## Firebase Setup

1. Create or select a Firebase project.
2. Add a Web App and copy its configuration to the frontend `.env`.
3. Open **Authentication → Sign-in method** and enable **Email/Password**.
4. Add `localhost` to **Authentication → Settings → Authorized domains**.
5. Open **Project settings → Service accounts**.
6. Generate a private key for local development, or configure Application Default Credentials.
7. Store Admin credentials only in the backend environment.

## Running Locally

Start the backend in one terminal:

```powershell
Push-Location backend
npm run dev
```

Start the frontend in another:

```powershell
npm run dev
```

Default URLs:

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health: http://localhost:5000/api/health

The backend automatically creates `backend/data/mealplanner.db` and its tables at startup.

## API Reference

Profile and meal-planning endpoints require:

```http
Authorization: Bearer <Firebase ID token>
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `POST` | `/api/meal-planner/plan` | Validate preferences, record the search, and call Foundry |
| `GET` | `/api/profile` | User, preferences, stats, searches, viewed, and saved data |
| `PUT` | `/api/profile` | Update display name |
| `GET` | `/api/profile/preferences` | Read preferences |
| `PUT` | `/api/profile/preferences` | Create or update preferences |
| `GET` | `/api/profile/searches` | Latest 20 searches |
| `POST` | `/api/profile/searches` | Record a search |
| `GET` | `/api/profile/viewed` | Latest 10 viewed recipes |
| `POST` | `/api/profile/viewed` | Upsert a recipe view by stable ID |
| `GET` | `/api/profile/saved` | Saved meals |
| `POST` | `/api/profile/saved` | Save a recipe by stable ID |
| `DELETE` | `/api/profile/saved/:recipeId` | Remove one saved recipe |

The backend never accepts `user_id` or `firebase_uid` from the client. Identity is derived from the verified Firebase token.

## Database Model

The database is stored at `backend/data/mealplanner.db` and is created automatically.

```mermaid
erDiagram
    USERS ||--o| USER_PREFERENCES : has
    USERS ||--o{ MEAL_SEARCHES : creates
    USERS ||--o{ RECENTLY_VIEWED : views
    USERS ||--o{ SAVED_MEALS : saves

    USERS {
        integer id PK
        string firebase_uid UK
        string email
        string display_name
        string created_at
        string updated_at
    }
    USER_PREFERENCES {
        integer id PK
        integer user_id FK
        string diet
        string cooking_time
        string budget
        string spice_level
        string restrictions_json
        string equipment_json
    }
    MEAL_SEARCHES {
        integer id PK
        integer user_id FK
        string meal_type
        string time
        string budget
        string diet
        string restrictions_json
        string equipment_json
        string ingredients_json
        string created_at
    }
    RECENTLY_VIEWED {
        integer id PK
        integer user_id FK
        string recipe_id
        string recipe_name
        string recipe_data_json
        string viewed_at
    }
    SAVED_MEALS {
        integer id PK
        integer user_id FK
        string recipe_id
        string recipe_name
        string recipe_data_json
        string saved_at
    }
```

Arrays are stored as JSON text. Foreign keys are enabled. Recently viewed and saved meals use a unique `(user_id, recipe_id)` constraint.

## Security

- Firebase Authentication is the identity provider.
- Firebase Admin verifies ID tokens only on the backend.
- `firebase_uid`, not email, links Firebase users to SQLite users.
- Every application-data query is scoped to the authenticated SQLite `user_id`.
- SQL statements are parameterized.
- Passwords, tokens, and service-account credentials are never stored in SQLite.
- `.env`, `*.db`, `*.db-shm`, and `*.db-wal` files are ignored by Git.
- API errors do not expose SQL errors, Firebase internals, stack traces, or credentials.

## Validation

Frontend build:

```powershell
npm run build
```

Backend syntax checks:

```powershell
Push-Location backend
node --check src/server.js
node --check src/config/database.js
node --check src/middleware/authMiddleware.js
node --check src/controllers/profileController.js
node --check src/services/profileService.js
```

Recommended checks:

- Delete `backend/data/mealplanner.db` and restart the backend.
- Verify all tables and indexes are recreated.
- Verify missing and invalid tokens return `401`.
- Create a Firebase user and open Profile.
- Change preferences and refresh.
- Plan a meal and verify search history.
- View multiple recipes and verify stable IDs and no duplicates.
- Save and remove meals.
- Log in as a second Firebase user and verify data isolation.
- Restart the backend and verify data remains.
- Confirm Foundry recommendations and dynamic recipe routing still work.

## Production Notes

- Use a managed secret store for Firebase Admin and Foundry credentials.
- Do not deploy `.env` files or service-account JSON files in application images.
- Set `FRONTEND_URL` to the exact production origin and restrict CORS.
- Serve frontend and API over HTTPS.
- Use a persistent volume and backups for SQLite if it remains in production.
- For multiple API instances or higher write volume, migrate the isolated profile service to a managed relational database.
- Configure Firebase authorized domains for the production frontend.
- Run dependency and vulnerability scans in CI.
- Use process supervision and health checks for the API.

## Future Database Migration

Database access is isolated in `backend/src/services/profileService.js`, while schema initialization is isolated in `backend/src/config/database.js`. A future migration can replace SQLite without changing the frontend API contract.

The records to migrate are `users`, `user_preferences`, `meal_searches`, `recently_viewed`, and `saved_meals`. The frontend should continue to use the profile API rather than depend on the database implementation.

## License

This is private application software. Add the appropriate license before public distribution.
