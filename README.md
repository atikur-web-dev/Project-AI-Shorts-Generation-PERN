# **AI Shorts Generator**

A full-stack **AI-powered visual content generation platform** that allows users to upload product/model images, generate professional marketing visuals using **Google Gemini AI**, manage projects, purchase AI credits through subscriptions, and organize generated assets through a secure web platform.

> This project combines **AI integration, OAuth 2.0, JWT authentication, subscription & payment processing, Redis caching, PostgreSQL, cloud storage, raw SQL analytics, API security, rate limiting, and production-oriented backend architecture** in a single application.

## **Project Highlights**

- **Google Gemini AI** integration for AI-powered visual generation
- **Google & GitHub OAuth 2.0** authentication
- **JWT Access + Refresh Token** authentication architecture
- **Session management** with secure HTTP-only cookies
- **Subscription & AI credit management**
- **SSLCommerz Sandbox** payment integration
- **Redis caching & distributed rate limiting**
- **PostgreSQL + Prisma ORM**
- **Raw PostgreSQL SQL** for Admin analytics and reporting
- **Cloudinary** cloud-based media storage
- **Zod** environment/configuration validation
- **Helmet, CORS, HPP & rate limiting** API protection
- **Docker/Docker Compose** development environment
- **TypeScript** across frontend and backend

## **What Can You Do?**

### **User**

- Register and login with email & password
- Login using **Google OAuth**
- Login using **GitHub OAuth**
- Manage account and profile
- Upload product/model images
- Generate AI-powered visuals using creative prompts
- Manage generated projects
- View generated images and videos
- Track available AI credits
- Purchase subscription plans
- Make payments through **SSLCommerz Sandbox**
- Access previous projects and generated assets

### **Admin**

- Access protected **Admin Dashboard**
- Monitor total users and projects
- Monitor orders and revenue
- Track completed, pending and failed payments
- Monitor active subscriptions
- Monitor generated images and videos
- View recent system activity
- Analyze daily, weekly and monthly statistics

## **System Architecture**

### **Frontend**

**React + TypeScript + Vite + Tailwind CSS**

### **Backend**

**Node.js + Express.js + TypeScript**

### **API Layer**

**REST API + Authentication + Validation + Security Middleware**

### **Database**

**PostgreSQL + Prisma ORM + Raw SQL Analytics**

### **External Services**

**Google Gemini + Google OAuth + GitHub OAuth + Cloudinary + SSLCommerz**

### **Infrastructure**

**Redis + Docker + Docker Compose**

## **AI Generation Workflow**

**Upload Product/Model Images**

→ **Enter Creative Prompt**

→ **Send Request to Gemini AI**

→ **Generate Visual**

→ **Upload Generated Asset to Cloudinary**

→ **Save Project & Metadata**

→ **Display in User Dashboard**

The platform transforms user-provided product/model images into professional marketing-oriented visual content without requiring a traditional photography setup.

## **Authentication & Security**

- **JWT authentication**
- **Access + Refresh Token architecture**
- **Session management**
- **Google OAuth 2.0**
- **GitHub OAuth**
- **Protected routes and APIs**
- **Role-based access control**
- **Password-based authentication**
- **Secure HTTP-only cookies**
- **Zod environment validation**
- **Helmet security headers**
- **CORS configuration**
- **HPP protection**
- **Express rate limiting**
- **Redis-backed rate limiting**

## **Payment & Subscription**

The platform includes a subscription-oriented **AI credit and payment system**.

- Subscription plans
- AI credit allocation
- Order creation
- Payment processing
- Payment status tracking
- Completed / pending / failed order states
- Transaction ID tracking
- **SSLCommerz Sandbox** integration

> **Note:** SSLCommerz is configured for **sandbox/testing purposes only**.

## **Admin Analytics**

The Admin Dashboard uses **raw PostgreSQL SQL queries** for reporting and analytics instead of relying entirely on ORM abstractions.

It provides:

- Total users
- Total orders
- Total revenue
- Total projects
- Completed / pending / failed orders
- Active subscriptions
- Generated images and videos
- Today's activity
- Recent system activity
- Daily / weekly / monthly time-series statistics

> Using raw SQL demonstrates practical knowledge of **SQL aggregation, JOINs, filtering, grouping, subqueries, date-based queries, and database-level reporting**.

## **How It Works**

### **User Flow**

**Register/Login → Upload Images → Create Project → Add Prompt → Generate AI Visual → Store Asset → Manage Project**

### **Subscription Flow**

**Choose Plan → Create Order → SSLCommerz Payment → Payment Verification → Update Order → Allocate AI Credits**

### **Admin Flow**

**Admin Login → Dashboard → SQL Analytics → Monitor Users, Projects, Orders, Revenue & Subscriptions**

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

