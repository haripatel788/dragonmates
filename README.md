# Dragonmates App Structure

## Folder Structure

dragonmates/  
 ├── index.html # Home page  
 ├── auth/  
 │ ├── login/index.html # Login page  
 │ └── register/index.html # Register page  
 ├── profile/index.html # User profile page (protected)  
 ├── interests/index.html # Interests form (protected)  
 ├── living_style/index.html # Living preferences form (protected)  
 └── utils/  
 ├── server.js # Backend server  
 └── db.js # Database connection

## Pages

| Page         | URL              | Protected? |
| ------------ | ---------------- | ---------- |
| Home         | `/`              | No         |
| Login        | `/auth/login`    | No         |
| Register     | `/auth/register` | No         |
| Profile      | `/profile`       | Yes        |
| Interests    | `/interests`     | Yes        |
| Living Style | `/living_style`  | Yes        |

## What "Protected" Means

- **Protected pages** require you to be logged in
- If you're not logged in, you'll be redirected to the login page
- After login, a token is saved in your browser's localStorage

## How Login Works

1. User enters email and password
2. Server checks credentials
3. If correct, server sends back a **token**
4. Token is saved in browser (localStorage)
5. Token is used to access protected pages

## API Endpoints

| Method | URL              | What it does                      |
| ------ | ---------------- | --------------------------------- |
| POST   | `/auth/register` | Create new account                |
| POST   | `/auth/login`    | Login to account                  |
| GET    | `/api/me`        | Get current user info (protected) |

## Running the App

1. Make sure you have Node.js installed
2. Run `npm install` to install dependencies
3. Create a `.env` file with your database and JWT settings
4. Run `node utils/server.js` to start the server
