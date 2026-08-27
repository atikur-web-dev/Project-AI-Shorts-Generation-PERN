# **AI Shorts Generator**

A full-stack **AI-powered visual content generation platform** that allows users to upload product/model images, generate professional marketing visuals using **Google Gemini AI**, manage projects, purchase AI credits through subscriptions, and organize generated assets through a secure web platform.

> **This is not a basic CRUD project.** It combines **AI integration, OAuth authentication, subscription & payment processing, Redis caching, PostgreSQL, cloud storage, API security, rate limiting, and production-oriented backend architecture** in a single application.

## **Key Features**

- **AI-powered image generation** using Google Gemini
- **Google & GitHub OAuth authentication**
- **JWT-based authentication with session/refresh-token management**
- **Subscription & AI credit system**
- **SSLCommerz Sandbox payment integration**
- **PostgreSQL + Prisma ORM**
- **Redis caching & rate limiting**
- **Cloudinary-based media storage**
- **Admin dashboard with real SQL analytics**
- **Protected APIs with Helmet, CORS, HPP & rate limiting**
- **Zod-based environment/configuration validation**
- **TypeScript across frontend & backend**
- **Dockerized Redis development environment**
- **Project history and generated asset management**

## **What Can You Do?**

### **User**

- Register/login with email & password
- Login using Google OAuth
- Login using GitHub OAuth
- Manage account and profile
- Upload product/model images
- Generate AI-powered visuals using prompts
- Manage generated projects
- View generated images/videos
- Track AI credits
- Purchase subscription plans
- Make payments through SSLCommerz Sandbox
- Access previous projects and generated assets

### **Admin**

- Access protected Admin Dashboard
- Monitor total users
- Monitor orders and revenue
- Track completed/pending/failed payments
- Monitor active subscriptions
- View total projects
- Monitor generated images and videos
- View recent system activity
- Analyze daily/weekly/monthly statistics

## **AI Generation Workflow**

**Upload Images → Add Creative Prompt → Gemini AI Processing → Generate Visual → Store Asset → Save Project**

The application transforms user-provided product/model images into professional marketing-oriented visual content without requiring a traditional photography setup.

## **Authentication & Security**

- JWT authentication
- Access token + refresh token architecture
- Session management
- Google OAuth 2.0
- GitHub OAuth
- Protected routes & APIs
- Password-based authentication
- Zod environment validation
- Helmet security headers
- CORS configuration
- HPP protection
- Express rate limiting
- Redis-backed rate limiting
- Secure HTTP-only cookie support

## **Payment & Subscription**

The platform includes a complete subscription-oriented architecture.

- Subscription plans
- AI credit allocation
- Order creation
- Payment processing
- Payment status tracking
- Completed/pending/failed order states
- SSLCommerz Sandbox integration
- Transaction ID tracking

> **Note:** SSLCommerz is configured for sandbox/testing purposes only.

## **Admin Analytics**

The Admin Dashboard uses **raw PostgreSQL SQL queries** for reporting and analytics instead of relying entirely on ORM abstractions.

It provides:

- Total users
- Total orders
- Total revenue
- Total projects
- Completed/pending/failed orders
- Active subscriptions
- Generated images/videos
- Today's activity
- Recent system activity
- Daily/weekly/monthly time-series data

> Using raw SQL for analytics demonstrates practical knowledge of **SQL, aggregation, joins, filtering, grouping, date-based reporting, and database-level querying**.

## **Tech Stack**

**Frontend:** React, TypeScript, Vite, Tailwind CSS

**Backend:** Node.js, Express.js, TypeScript

**Database:** PostgreSQL, Prisma ORM

**AI:** Google Gemini API

**Authentication:** JWT, Google OAuth, GitHub OAuth

**Caching:** Redis

**Storage:** Cloudinary

**Payment:** SSLCommerz Sandbox

**Validation:** Zod

**Security:** Helmet, CORS, HPP, Express Rate Limit

**Development:** Docker, Docker Compose

