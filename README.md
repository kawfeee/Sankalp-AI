# Sankalp AI - MERN Stack Project

A full-stack MERN (MongoDB, Express, React, Node.js) application.

## Project Structure

```
sankalp-AI/
├── frontend/          # React frontend (Vite)
└── backend/           # Node.js + Express backend
```

## Frontend (React + Vite)

### Setup
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Backend (Node.js + Express)

### Setup
```bash
cd backend
npm install
```

### Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## MongoDB Atlas Setup (Coming Soon)

MongoDB Atlas integration will be added later. You'll need to:
1. Create a MongoDB Atlas account
2. Set up a cluster
3. Get your connection string
4. Add it to the backend `.env` file

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (to be integrated)
- **Others**: CORS, dotenv
