# AI Shorts Generator – Backend 

This is the backend service for **AI Shorts Generator** – a platform where users can upload product and model images, generate AI-powered merged visuals, and turn them into image or short videos.

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma + PostgreSQL
- Google OAuth + GitHub OAuth
- JWT Authentication
- Gemini API (Image Gen)
- Veo 3.1 (Video Gen)
- Cloudinary (Media Storage)
- Docker + Docker Compose
- Winston (Logging)
- Zod (Validation)


## Project Structure

Backend/
├── src/
│   ├── config/          
│   ├── controllers/     
│   ├── middleware/      
│   ├── routes/          
│   ├── services/        
│   ├── utils/           
│   ├── types/           
│   ├── lib/          
│   ├── app.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json


## Run Locally (Without Docker)


# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# Fill in your keys (Google, GitHub, Gemini, Cloudinary)

# 3. Start PostgreSQL (local or Docker)
docker run --name ai-short-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=yourpass -e POSTGRES_DB=ai_short -p 5432:5432 -d postgres:16-alpine

# 4. Run migrations
npx prisma migrate dev
npx prisma generate

# 5. Start dev server
npm run dev


## Run with Docker Compose (Recommended)

# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down

## Environment Variables

Create a `.env` file with these keys:

.env file : 
# App
PORT=8000
NODE_ENV=development
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=postgresql://postgres:yourpass@localhost:5432/ai_short

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8000/api/v1/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URL=http://localhost:8000/api/v1/auth/github/callback

# AI & Storage
GOOGLE_GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


## API Endpoints

| Method |             Endpoint              |     Description                 |
|--------|-----------------------------------|---------------------------------|
| GET    | `/api/v1/auth/google/login`       | Google OAuth login              |
| GET    | `/api/v1/auth/github/login`       | GitHub OAuth login              |
| GET    | `/api/v1/auth/me`                 | Get current user                |
| POST   | `/api/v1/auth/refresh`            | Refresh access token            |
| POST   | `/api/v1/auth/logout`             | Logout user                     |
| POST   | `/api/v1/projects`                | Create project (generate image) |
| POST   | `/api/v1/projects/generate-video` | Generate video from project     |
| GET    | `/health`                         | Health check                    |


## Credit System

- New users get **30 free credits**
- Image generation costs **5 credits**
- Video generation costs **10 credits**
- If any step fails, credits are **automatically refunded**

## Scripts

npm run dev          # Start dev server
npm run build        # Build TypeScript
npm start            # Run built app
npx prisma studio    # Open Prisma UI
docker-compose up -d # Start with Docker

