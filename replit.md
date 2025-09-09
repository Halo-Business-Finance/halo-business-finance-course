# FinPilot Learning Management System

## Overview

FinPilot is a comprehensive business finance and commercial lending training platform built as a React-based learning management system. The platform provides professional certification programs for finance professionals, featuring interactive learning modules, progress tracking, gamification elements, and advanced security features. The system serves both individual learners and enterprise clients with role-based access controls and administrative capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React stack with TypeScript, built on Vite for fast development and optimized builds. The UI is constructed using shadcn/ui components with Radix UI primitives and Tailwind CSS for styling. The design system follows IBM Carbon Design principles with custom color schemes and spacing tokens.

**Key architectural decisions:**
- **Component Architecture**: Modular component design with shared UI components in `/src/components/ui/`
- **Routing**: React Router DOM for client-side routing with protected routes for authenticated content
- **State Management**: React Context for authentication and course selection state, with React Query for server state
- **Styling**: Tailwind CSS with custom design tokens and responsive design patterns
- **TypeScript**: Comprehensive type safety throughout the application with relaxed linting for rapid development

### Backend Architecture
The system uses a serverless architecture with Supabase as the primary backend service, providing authentication, real-time database, and API functions.

**Key architectural decisions:**
- **Database**: PostgreSQL via Supabase with Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth with role-based access control (RBAC)
- **API Layer**: Supabase RPC functions for complex business logic and secure data operations
- **Real-time Features**: Supabase real-time subscriptions for live chat and notifications

### Data Storage Solutions
The application uses PostgreSQL as the primary database with a comprehensive schema for educational content management.

**Key architectural decisions:**
- **Content Management**: Structured tables for courses, modules, lessons, and assessments
- **User Progress**: Detailed tracking of learning progress, quiz results, and time spent
- **Security Logging**: Comprehensive audit logging for PII access and administrative actions
- **File Storage**: Supabase Storage for media files, documents, and user-generated content

### Authentication and Authorization
Multi-layered security system with role-based permissions and data masking capabilities.

**Key architectural decisions:**
- **Role Hierarchy**: Super Admin > Tech Support Admin > Admin > Instructor > User
- **Data Masking**: Automatic PII masking based on user roles using `mask_sensitive_data()` function
- **Access Logging**: Detailed audit trails for all administrative access to sensitive data
- **Security Functions**: Custom RPC functions for secure role checking and data access validation

### Learning Management Features
Advanced educational technology stack with adaptive learning and gamification.

**Key architectural decisions:**
- **Adaptive Learning**: AI-powered lesson recommendations based on user performance and learning style
- **Progress Tracking**: Comprehensive analytics including time spent, completion rates, and skill development
- **Interactive Content**: Support for multiple lesson types (video, interactive simulations, drag-drop exercises)
- **Assessment System**: Advanced quiz engine with multiple question types and adaptive difficulty
- **Gamification**: Achievement system, leaderboards, and progress streaks to enhance engagement

## External Dependencies

### Core Services
- **Supabase**: Primary backend-as-a-service providing PostgreSQL database, authentication, real-time subscriptions, and serverless functions
- **Neon Database**: Serverless PostgreSQL database with connection pooling for production workloads

### UI and Development
- **Radix UI**: Unstyled, accessible UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for responsive design and styling
- **Lucide React**: Consistent icon library for user interface elements
- **React Query (TanStack Query)**: Server state management and caching for API interactions

### Learning and Content
- **React Three Fiber & Drei**: 3D graphics capabilities for interactive learning simulations
- **Recharts**: Data visualization library for progress charts and analytics dashboards
- **Fabric.js**: Canvas manipulation for interactive drawing and diagram exercises
- **Embla Carousel**: Smooth carousel component for content navigation

### Development and Analytics
- **Vite**: Fast build tool and development server with Hot Module Replacement
- **TypeScript**: Static type checking for improved code reliability
- **ESLint**: Code linting with React-specific rules and TypeScript support
- **Framer Motion**: Animation library for smooth UI transitions and interactive elements

### Communication and Support
- **Firecrawl**: Web crawling service for content extraction and analysis
- **Email Integration**: Automated email notifications and course completion certificates
- **Live Chat Support**: Built-in customer support chat system with real-time messaging

### Security and Compliance
- **GDPR Compliance Tools**: Data rights management, consent tracking, and privacy controls
- **Security Monitoring**: Real-time threat detection and automated security event logging
- **Data Encryption**: End-to-end encryption for sensitive user data and financial information