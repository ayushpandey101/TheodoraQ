# Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account for OAuth

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (Free tier is fine)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `<dbname>` with your preferred database name (e.g., `theodoraQ`)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/theodoraQ?retryWrites=true&w=majority
```

## Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (when deploying)
7. Add authorized redirect URIs:
   - `http://localhost:5173`
   - Your production domain
8. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create `.env` file in the backend folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (generate a random string)
JWT_SECRET=your_very_secure_random_string_here_minimum_32_characters
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### To Generate JWT Secret:
Run this in Node.js:
```javascript
require('crypto').randomBytes(32).toString('hex')
```

## Step 5: Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 in development mode
📡 Frontend URL: http://localhost:5173
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

## Step 6: Test the Backend

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "accountType": "candidate"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/google` | Google OAuth login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/health` | Health check | No |

### Request/Response Examples

#### Register Request:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "accountType": "candidate"
}
```

#### Register Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673abc123def456",
    "fullName": "John Doe",
    "email": "john@example.com",
    "accountType": "candidate",
    "authProvider": "local"
  }
}
```

#### Login Request:
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### Google Auth Request:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "accountType": "candidate"
}
```

## Troubleshooting

### MongoDB Connection Issues
- Check if your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify the connection string format
- Ensure the database user has proper permissions

### Google OAuth Issues
- Verify Client ID is correct
- Check authorized origins include your frontend URL
- Ensure Google+ API is enabled

### Port Already in Use
If port 5000 is already in use:
```bash
# Change PORT in .env file
PORT=5001
```

### CORS Issues
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check the CORS configuration in `server.js`

## Security Notes

- **Never commit `.env` file to Git**
- Use strong JWT secrets (minimum 32 characters)
- Keep Google OAuth credentials secure
- Use environment variables for all sensitive data
- Enable MongoDB network access only for required IPs

## Next Steps

1. Test all endpoints using Postman or curl
2. Integrate frontend with backend API
3. Test Google OAuth flow
4. Deploy to production (Heroku, Railway, or Vercel)
5. Update environment variables for production

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update Google OAuth authorized origins
- [ ] Whitelist production server IP in MongoDB Atlas
- [ ] Use strong JWT secret
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up logging and monitoring
