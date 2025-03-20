# Messaging Dashboard

## Overview

Messaging Dashboard is a real-time messaging application built using the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time communication.

## Features

- Real-time messaging using WebSockets
- User authentication with JWT
- RESTful API with Express and MongoDB
- Frontend built with Vite, React, and TailwindCSS
- Backend with Express.js and Mongoose
- Environment configuration with `.env` files

## Project Structure

```bash
/messaging-dashboard
├── /backend         # Backend API (Node.js, Express, MongoDB)
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── .env
│   ├── package.json
│
├── /frontend        # Frontend (React, Vite, TailwindCSS)
│   ├── src/
│   ├── index.tsx
│   ├── vite.config.ts
│   ├── package.json
│   ├── .env
│
├── package.json     # Root package.json for managing frontend and backend
├── README.md        # Documentation
├── .env
```

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+ recommended)
- MongoDB (Cloud or Local instance)
- npm or yarn

### Setup

Clone the repository:

```sh
git clone https://github.com/razor-eng/messaging-dashboard.git
cd messaging-dashboard
```

Install dependencies:

```sh
npm run install
```

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://rajat:rajat1995m@cluster0.lji0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

### Root (`.env`)

```env
MONGODB_URI=mongodb+srv://rajat:rajat1995m@cluster0.lji0n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

## Running the Application

### Development Mode

Start the backend and frontend together:

```sh
npm run dev
```

### Production Mode

Build and start the application:

```sh
npm run build
npm start
```

## Scripts

| Script            | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run install` | Installs both frontend and backend dependencies   |
| `npm run dev`     | Runs the backend and frontend in development mode |
| `npm run build`   | Builds both frontend and backend                  |
| `npm start`       | Starts the application in production mode         |

## Technologies Used

### Backend:

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Socket.io for real-time messaging

### Frontend:

- React with Vite
- TailwindCSS
- Radix UI for components
- Axios for API calls
- Socket.io-client for real-time communication

## Contributing

Feel free to fork the repository and submit pull requests.

## License

MIT License
