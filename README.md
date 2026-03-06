# Dragonmates

Roommate matching app for Drexel University students.

## Setup

See [SETUP.md](SETUP.md) for Doppler config and first-time install.

```bash
npm install
npm run migrate   # create tables (first time only)
npm start         # start server on :3000
```

## Folder Structure

```
dragonmates/
├── index.html                # Landing page
├── auth/
│   ├── login/index.html      # Clerk sign-in
│   └── register/index.html   # Clerk sign-up
├── interests/
│   ├── index.html            # Preferences form (dealbreakers, scores, interests)
│   ├── script.js             # Form logic + save to DB
│   └── styles.css
├── profile/
│   ├── index.html            # View user profile
│   └── script.js
├── browse/
│   ├── index.html            # Browse roommates
│   └── match-score.js        # Match algorithm
├── chat/
│   ├── index.html            # Roommate chat
│   └── script.js
└── utils/
    ├── server.js              # Express API (all endpoints)
    ├── db.js                  # Postgres connection pool
    └── migrate.js             # Schema creation
```

## Database Schema

All tables live in Neon (serverless Postgres). Managed via `utils/migrate.js`.

### `users`
| Column        | Type         | Notes              |
|---------------|--------------|---------------------|
| id            | SERIAL       | Primary key         |
| email         | TEXT         | Unique, not null    |
| clerk_id      | VARCHAR(255) | Unique (Clerk auth) |
| password_hash | TEXT         | Legacy auth only    |
| created_at    | TIMESTAMP    | Default now()       |

### `dealbreakers`
One row per user. Must-match filters for roommate compatibility.

| Column      | Type        | Notes                          |
|-------------|-------------|--------------------------------|
| id          | SERIAL      | Primary key                    |
| userId      | TEXT        | Unique, not null               |
| smoking     | VARCHAR(50) | yes / no / outside             |
| pets        | VARCHAR(50) | have / okay / not-okay         |
| budgetMin   | INTEGER     | Monthly budget floor ($)       |
| budgetMax   | INTEGER     | Monthly budget ceiling ($)     |
| moveInDate  | DATE        |                                |
| coopCycle   | VARCHAR(50) | fall-winter / spring-summer    |
| leaseLength | INTEGER     | Months                         |
| genderPref  | VARCHAR(50) | same / other / (empty)         |
| roomType    | VARCHAR(50) | private / shared               |
| createdAt   | TIMESTAMP   |                                |
| updatedAt   | TIMESTAMP   |                                |

### `scores`
One row per user. Lifestyle ratings from 1-5.

| Column          | Type    | Notes       |
|-----------------|---------|-------------|
| id              | SERIAL  | Primary key |
| userId          | TEXT    | Unique, not null |
| cleanliness     | INTEGER | 1-5         |
| sleepSchedule   | INTEGER | 1-5         |
| noiseTolerance  | INTEGER | 1-5         |
| guestsFrequency | INTEGER | 1-5         |
| cookingHabits   | INTEGER | 1-5         |
| timeAtHome      | INTEGER | 1-5         |
| temperaturePref | INTEGER | 1-5         |
| gymInterest     | INTEGER | 1-5         |
| mediaInterest   | INTEGER | 1-5         |
| createdAt       | TIMESTAMP |           |
| updatedAt       | TIMESTAMP |           |

### `interests`
One row per user. Personal info and hobbies.

| Column      | Type        | Notes                              |
|-------------|-------------|------------------------------------|
| id          | SERIAL      | Primary key                        |
| userId      | TEXT        | Unique, not null                   |
| major       | TEXT        | e.g. "Computer Science"            |
| year        | VARCHAR(20) | freshman / sophomore / junior / senior |
| personality | VARCHAR(20) | introvert / ambivert / extrovert   |
| hobbies     | TEXT[]      | Postgres array of hobby strings    |
| createdAt   | TIMESTAMP   |                                    |
| updatedAt   | TIMESTAMP   |                                    |

## API Endpoints

All preference endpoints use `POST` with JSON body and require a Bearer token (`Authorization: Bearer <token>`).

### Public

| Method | URL              | Description          |
|--------|------------------|----------------------|
| POST   | `/auth/register` | Create account       |
| POST   | `/auth/login`    | Login (legacy)       |

### Authenticated

| Method | URL               | Description                        |
|--------|-------------------|------------------------------------|
| POST   | `/api/clerk-user` | Sync Clerk user to DB (auto on page load) |
| POST   | `/api/dealbreakers` | Upsert dealbreaker preferences   |
| POST   | `/api/scores`     | Upsert lifestyle scores (1-5)     |
| POST   | `/api/interests`  | Upsert personal info + hobbies    |
| GET    | `/api/me`         | Get current user info              |

### Request body examples

**POST /api/dealbreakers**
```json
{
  "smoking": "no",
  "pets": "okay",
  "budgetMin": 600,
  "budgetMax": 1200,
  "moveInDate": "2026-09-01",
  "coopCycle": "fall-winter",
  "leaseLength": 12,
  "genderPref": "same",
  "roomType": "private"
}
```

**POST /api/scores**
```json
{
  "cleanliness": 4,
  "sleepSchedule": 3,
  "noiseTolerance": 2,
  "guestsFrequency": 3,
  "cookingHabits": 5,
  "timeAtHome": 3,
  "temperaturePref": 4,
  "gymInterest": 2,
  "mediaInterest": 4
}
```

**POST /api/interests**
```json
{
  "major": "Computer Science",
  "year": "junior",
  "personality": "ambivert",
  "hobbies": ["gaming", "fitness", "coding"]
}
```

## Auth

- **Primary:** Clerk (session tokens verified server-side)
- **Legacy:** Email/password with JWT (for backwards compat)
- Secrets managed via Doppler (see SETUP.md)
