# Real-time Chat Application

A full-stack real-time chat application built with Next.js, NestJS, Socket.IO, and MongoDB.

## Features

- **User Authentication:** Register and login with JWT authentication
- **Real-time Messaging:** Send and receive messages instantly using Socket.IO
- **User Status:** See when users are online/offline in real-time
- **Typing Indicators:** Know when someone is typing a message
- **Read Receipts:** See when your messages have been read
- **Direct Messages:** Chat privately with individual users
- **Group Chats:** Create and participate in group conversations
- **Responsive Design:** Works on desktop and mobile devices

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- Socket.IO client for real-time communication
- Zustand for state management
- Axios for API requests

### Backend
- NestJS framework
- TypeScript
- MongoDB with Mongoose ODM
- Socket.IO for real-time events
- JWT for authentication
- Passport.js for auth strategies
- Class-validator for DTO validation

## Project Structure

```
chat-app/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API setup
│   │   └── store/          # Zustand stores
│   └── ...
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── chat/           # Socket.IO gateway
│   │   ├── groups/         # Groups module
│   │   ├── messages/       # Messages module
│   │   ├── users/          # Users module
│   │   ├── app.module.ts   # Main application module
│   │   └── main.ts         # Application entry point
│   └── ...
└── package.json            # Root package.json with scripts
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chat-app
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Development

1. Start MongoDB (if running locally):

```bash
mongod
```

2. Start the backend server:

```bash
# From the root directory
npm run server:dev
```

3. Start the frontend development server:

```bash
# From the root directory
npm run client:dev
```

4. Access the application:

Frontend: http://localhost:3000
Backend API: http://localhost:3001/api

### Production Build

1. Build the client:

```bash
# From the root directory
npm run client:build
```

2. Build the server:

```bash
# From the root directory
npm run server:build
```

3. Start the production server:

```bash
# From the root directory
npm run start
```

## Testing the Application

1. Open two browser windows/tabs pointing to http://localhost:3000
2. Register two different user accounts (one in each window)
3. Log in with each account
4. Start a conversation from one user to another
5. Test real-time messaging between the users
6. Create a group and add the other user to test group chat functionality
7. Observe online status, typing indicators, and read receipts in action

## Environment Variables

Create `.env` files in both client and server directories:

### Server (.env)
```
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
PORT=3001
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## License

This project is licensed under the MIT License
