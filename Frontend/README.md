# AI Shorts Generator - Frontend

A modern React.js frontend for the AI Shorts Generator application. Built with TypeScript, Tailwind CSS, and React Router for a professional, clean user experience.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (green/white color scheme)
- **React Router** - Navigation and routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Vite** - Build tool

## Folder Structure

```
Frontend-React/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── context/         # React Context
│   │   └── AuthContext.tsx
│   ├── pages/           # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateProject.tsx
│   │   └── Callback.tsx
│   ├── services/        # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── projectService.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
├── vite.config.ts       # Vite config
└── README.md            # This file
```

## Features

- **Landing Page** - Professional landing page with features overview
- **OAuth Authentication** - Google and GitHub login integration
- **Dashboard** - User dashboard with project management
- **Project Creation** - Upload images and create AI projects
- **Video Generation** - Generate videos from existing projects
- **Protected Routes** - Route protection for authenticated users
- **Responsive Design** - Mobile-friendly interface
- **Green/White Theme** - Clean, professional color scheme

## Color Scheme

The application uses a green and white color scheme (no gradients):
- Primary green: #2e7d32
- Dark green: #1b5e20
- Light green: #e8f5e9
- White: #ffffff
- Light gray: #f5f5f5

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd Frontend-React
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Backend Configuration

Make sure your backend `.env` file has:
```
CLIENT_URL=http://localhost:5173
```

Update the OAuth redirect URLs in your backend:
- Google OAuth redirect: `http://localhost:5173/callback`
- GitHub OAuth redirect: `http://localhost:5173/callback`

## How It Works

### Authentication Flow

1. User clicks "Login with Google" or "Login with GitHub"
2. Redirected to OAuth provider
3. After successful auth, backend redirects to `/callback?accessToken=...`
4. Frontend stores access token in localStorage
5. User redirected to dashboard

### Protected Routes

- `/dashboard` - Requires authentication
- `/create-project` - Requires authentication
- `/callback` - OAuth callback handler

### API Integration

All API calls go through centralized services:
- `api.ts` - Axios instance with interceptors
- `authService.ts` - Authentication operations
- `projectService.ts` - Project operations

### Credits System

- Creating a project costs 5 credits
- Generating a video costs 10 credits
- Credits are managed by the backend
- New users get 30 free credits

## Architecture

### Component Structure

- **Components**: Reusable UI components (Navbar, LoadingSpinner)
- **Pages**: Main application pages (Landing, Login, Dashboard, etc.)
- **Context**: Global state management (AuthContext)
- **Services**: API communication layer
- **Types**: TypeScript type definitions

### Why This Architecture?

- **TypeScript**: Type safety and better developer experience
- **React Router**: Client-side routing with protected routes
- **Context API**: Simple state management without external libraries
- **Tailwind CSS**: Utility-first CSS for rapid development
- **Axios**: Robust HTTP client with interceptors
- **Vite**: Fast build tool with HMR

## Development Notes

- The frontend uses React 18 with hooks
- TypeScript provides type safety throughout
- Tailwind CSS for consistent styling
- React Router for navigation
- Axios for API calls with automatic token injection
- Context API for authentication state
- Lucide React for beautiful icons

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors, make sure to run:
```bash
npm install
```

### CORS Issues

If you encounter CORS errors, ensure your backend has:
```typescript
origin: "http://localhost:5173"
```

### OAuth Redirect Issues

Make sure your OAuth redirect URLs match:
- Backend: `CLIENT_URL=http://localhost:5173`
- OAuth providers: `http://localhost:5173/callback`

## Future Enhancements

- Add payment integration UI
- Add project editing capabilities
- Add user profile page
- Add subscription management
- Add video preview modal
- Add project sharing features
- Add analytics dashboard
