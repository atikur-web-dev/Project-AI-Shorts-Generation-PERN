# AI Shorts Generator — Backend API

## Overview

AI Shorts Generator is a production-ready RESTful backend that enables users to generate AI-powered product images and marketing videos using Google Gemini AI and Veo AI.

The backend provides secure authentication, AI image generation, AI video generation, subscription management, payment processing, media storage, and administrative analytics through a scalable service-oriented architecture.
---
## Features

### Authentication & Authorization
- Google OAuth 2.0 Authentication
- GitHub OAuth 2.0 Authentication
- JWT Access & Refresh Token Authentication
- Secure HTTP-Only Cookie-based Session Management
- Redis-based Session Revocation

### AI Content Generation
- AI Product & Model Image Composition (Google Gemini)
- AI Marketing Video Generation (Veo AI)
- Custom Prompt-based Image Generation
- Multiple Aspect Ratio Support (e.g. 9:16)

### Subscription & Payment
- Credit-based AI Generation System
- Automatic Credit Refund on Failed AI Processing
- SSLCommerz Payment Gateway Integration
- Secure Payment Webhook Validation

### Media Management
- Cloudinary CDN Integration
- Optimized Image & Video Storage
- Secure Media Delivery

### Admin Dashboard
- User Management
- Order Management
- Dashboard Analytics
- Revenue Reports
- CSV/PDF Report Export

### Security & Infrastructure
- Prisma ORM + PostgreSQL
- Redis Caching & Rate Limiting
- Helmet & CORS Protection
- Zod Request Validation
- Winston Logging
- Docker & Docker Compose Support

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript

### Database & ORM
- PostgreSQL
- Prisma ORM

### AI Services
- Google Gemini AI
- Veo AI

### Storage
- Cloudinary

### Authentication
- JWT
- Google OAuth 2.0
- GitHub OAuth 2.0
- HTTP-Only Cookies

### Caching
- Redis

### Payment Gateway
- SSLCommerz

### Security
- Helmet
- CORS
- Zod Validation
- Express Rate Limit

### DevOps & Tools
- Docker
- Docker Compose
- Winston Logger

## Project Structure

```text
Backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed
├── src/
│   ├── config/                # App & environment configuration
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Authentication & security
│   ├── lib/                   # External service clients
│   ├── utils/                 # Helper functions
│   ├── types/                 # TypeScript types
│   ├── app.ts                 # Express app
│   └── server.ts              # Application entry point
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Quick Start

### Prerequisites

Before running the project, make sure the following tools are installed:

- Node.js v20+
- PostgreSQL
- Redis
- Docker & Docker Compose 

---

## Option 1: Run with Docker (Recommended)

1. Navigate to the backend directory:

```bash
cd Backend
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Install project dependencies:

```bash
npm install
```

4. Build and start all services:

```bash
npm run docker:up
```

> This starts the Node.js application, PostgreSQL database, and Redis cache inside Docker containers.

5. View container logs (optional):

```bash
npm run docker:logs
```

6. Stop all running containers:

```bash
npm run docker:down
```

---

## Option 2: Run Locally

1. Navigate to the backend directory:

```bash
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Apply database migrations and generate the Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the database (optional):

```bash
npm run seed
```

6. Start the development server:

```bash
npm run dev
```

The backend API will be available at:

```text
http://localhost:8000
```

The interactive Swagger documentation will be available at:

```text
http://localhost:8000/api-docs
```

## Environment Variables

Create a `.env` file inside the `Backend` directory by copying the example file:

```bash
cd Backend

cp .env.example .env
```

Update the required environment variables before running the application.

The project requires configuration for:

- PostgreSQL Database
- Redis
- JWT Secret
- Google OAuth
- GitHub OAuth
- Google Gemini AI
- Cloudinary
- SSLCommerz Payment Gateway

See `.env.example` for the complete list of required variables.


---

## API Documentation

**Base URL**

```text
http://localhost:8000/api/v1
```

The API is organized into the following modules:

- Authentication
- AI Projects
- Orders & Payments
- Admin

### Authentication

| Method  |       Endpoint         | Authentication |       Description        |
|---------|------------------------|----------------|--------------------------|
| GET     | `/auth/google/login`   |      NO        | Redirect to Google OAuth |
| GET     | `/auth/google/callback`|      NO        | Google OAuth callback    |
| GET     | `/auth/github/login`   |      NO        | Redirect to GitHub OAuth |
| GET     | `/auth/github/callback`|      NO        | GitHub OAuth callback    |
| POST    | `/auth/refresh`        |    COOKIES     | Refresh access token     |
| POST    | `/auth/logout`         |      JWT       | Logout current session   |
| GET     | `/auth/me`             |      JWT       | Get current user         |

### AI Projects

| Method  |          Endpoint          | Authentication |           Description              |
|---------|----------------------------|----------------|------------------------------------|
| POST    | `/projects`                |      JWT       | Create AI image generation project |
| POST    | `/projects/generate-video` |      JWT       | Generate AI marketing video        |

### Payments

| Method  |       Endpoint     | Authentication |        Description           |
|---------|--------------------|----------------|------------------------------|
| POST    | `/orders`          |       JWT      | Create order                 |
| GET     | `/ssl/:orderId`    |       NO       | Redirect to SSLCommerz       |
| POST    | `/payment/success` |       NO       | Payment success callback     |
| POST    | `/payment/fail`    |       NO       | Payment failed callback      |
| POST    | `/payment/cancel`  |       NO       | Payment cancelled callback   |
| POST    | `/payment/ipn`     |       NO       | Instant Payment Notification |

### Admin

| Method  |            Endpoint            | Authentication |    Description         |
|---------|--------------------------------|----------------|------------------------|
| GET     | `/admin/stats`                 |      Admin     | Dashboard statistics   |
| GET     | `/admin/users`                 |      Admin     | List users             |
| PATCH   | `/admin/users/:userId/role`    |      Admin     | Update user role       |
| DELETE  | `/admin/users/:userId`         |      Admin     | Delete user            |
| GET     | `/admin/users/search`          |      Admin     | Search users           |
| GET     | `/admin/orders`                |      Admin     | List orders            |
| PATCH   | `/admin/orders/:orderId/status`|      Admin     | Update order status    |
| GET     | `/admin/logs`                  |      Admin     | Audit logs             |
| GET     | `/admin/reports/revenue`       |      Admin     | Revenue report         |
| GET     | `/admin/reports/export`        |      Admin     | Export CSV/PDF reports |

> **Note:** A complete Postman Collection is included in the repository for testing all API endpoints.



## API Testing

The API can be tested using either **Swagger UI** or the included **Postman Collection**.

### Swagger UI

After starting the backend server, open:

```text
http://localhost:8000/api-docs
```

> **Note:** Swagger documentation is currently being expanded and may not include every endpoint.

---

### Postman Collection

A ready-to-use Postman Collection is included in the repository.

```text
Postman/
└── AI-Shorts-Generation-I.postman_collection.json
```

#### Steps

1. Open Postman.
2. Click **Import**.
3. Select the collection file from the `Postman` directory.
4. Update the `base_url` if necessary.
5. Authenticate and test the available endpoints.

## Example Requests & Responses

The following examples demonstrate some of the most commonly used API endpoints.

---

### 1. Create AI Project

**Endpoint**

```http
POST /api/v1/projects
```

**Request**

multipart/form-data

- productImage
- modelImage
- projectName
- productName
- productDescription
- userPrompt
- aspectRatio

**Success Response**

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

---

### 2. Generate AI Video

**Endpoint**

```http
POST /api/v1/projects/generate-video
```

**Request**

```json
{
  "projectId": "uuid"
}
```

**Success Response**

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

---

### 3. Get Current User

**Endpoint**

```http
GET /api/v1/auth/me
```

**Success Response**

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

## Author

**Atikur Rahman**

Backend Developer passionate about building scalable REST APIs, secure authentication systems, and AI-powered backend applications.

- **GitHub:** https://github.com/atikur-web-dev
- **Email:** atikurrahman160313@gmail.com

## License

This project is developed for learning, portfolio, and demonstration purposes.