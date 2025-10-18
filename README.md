# UrbanEase

A full-stack platform for managing urban service bookings with a React frontend and an Express/MongoDB backend.

## Prerequisites

- Node.js 18 or newer (includes npm)
- MongoDB 6.x running locally or a connection string to a managed instance
- Git (for cloning the repository)

## Repository Structure

```
UrbanEase/
├─ backend/   # Express + MongoDB API (originally under server/)
├─ frontend/  # React application (originally under client/)
├─ db-backup/ # MongoDB dumps or seed data
├─ README.md
└─ .gitignore
```

## Installation

### Backend (backend/)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Frontend (frontend/)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Configuration

Both applications rely on environment variables. Use the provided examples as a starting point.

### Backend `.env`

1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Edit the new `.env` file and set values for:
   - `MONGODB_URI` – connection string for MongoDB
   - `JWT_SECRET` – secret used for JWT signing
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` – Razorpay credentials (if payment processing is enabled)
   - Any other keys you add as the project evolves

> Update `.env.example` whenever you add new environment variables so teammates know what to supply.

### Frontend `.env`

1. Create `frontend/.env` (if one does not already exist).
2. Add variables such as:
   ```ini
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```
3. Mirror the keys inside `frontend/.env.example` so collaborators stay aligned.

## Database Setup

The backend includes helper scripts under `backend/scripts/`.

- To seed sample data:
  ```bash
   cd backend
  npm run seed-db
  ```
- To reset (drop + seed) the database:
  ```bash
   cd backend
  npm run reset-db
  ```
- To drop the database entirely:
  ```bash
   cd backend
  npm run drop-db
  ```

To create a MongoDB dump for distribution, run:

```bash
mongodump --db urbanease --out ./db-backup
```

Alternatively, if you have a MongoDB dump you can restore it with:
```bash
mongorestore --uri "<your-mongodb-uri>" <path-to-dump>
```

## Running the Project

From the repository root you can use the folder names shown above:

```bash
# Backend API
cd backend
npm run dev

# Frontend React app
cd frontend
npm run dev
```

You can also run them inline from the repository root:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Additional Scripts

- Lint frontend:
  ```bash
   cd frontend
  npm run lint
  ```
- Format frontend source:
  ```bash
   cd frontend
  npm run format
  ```
- Start backend in production mode:
  ```bash
   cd backend
  npm start
  ```

## Troubleshooting

- Ensure MongoDB is running and accessible via the URI configured in `backend/.env`.
- Frontend API requests rely on the proxy defined in `frontend/package.json`. Adjust `REACT_APP_API_URL` if the backend runs on a different host or port.
- When adding new environment variables, update both `.env` and `.env.example` so collaborators stay in sync.
