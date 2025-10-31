# MongoDB Backend Server

A Node.js backend server with MongoDB integration using Express.js and Mongoose.

## Features

- ✅ Express.js server setup
- ✅ MongoDB connection with Mongoose
- ✅ User model with validation and authentication
- ✅ RESTful API endpoints
- ✅ Environment configuration
- ✅ Error handling and logging
- ✅ Security middleware (Helmet, CORS)
- ✅ Input validation
- ✅ Password hashing with bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and other configurations.

## MongoDB Setup

### Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users (with pagination and search)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

### Example API Usage

#### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Get All Users
```bash
curl http://localhost:5000/api/users
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   └── User.js              # User model with Mongoose schema
├── routes/
│   └── userRoutes.js        # User API routes
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/myapp |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |

## Security Features

- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- Input validation with Mongoose
- Error handling middleware

## Development

### Adding New Models
1. Create model file in `models/` directory
2. Define Mongoose schema with validation
3. Export the model

### Adding New Routes
1. Create route file in `routes/` directory
2. Define Express router with endpoints
3. Import and use in `server.js`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity for Atlas

### Port Already in Use
- Change `PORT` in `.env` file
- Kill process using the port: `npx kill-port 5000`

## License

ISC