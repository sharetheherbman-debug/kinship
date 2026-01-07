# Kinship Journeys - Product Requirements Document

## Original Problem Statement
Build Kinship Journeys - an all-in-one family travel planning and collaboration PWA for global families (e.g., members in South Africa collaborating with those in UK). Features: secure invite-only auth, photo galleries, collaborative trip planning, real-time chat, booking integrations, budget tracker, activity planner, family tracker, emergency hub, AI assistance, and more.

## User Choices
- **AI Provider**: OpenAI GPT-4 (user provides own API key)
- **Authentication**: JWT-based custom auth (no Emergent dependencies)
- **Theme**: Vibrant adventure (bold blues, oranges, greens)
- **Payment**: Stripe (test keys configured)
- **Deployment Target**: Webdock VPS

## Architecture
- **Frontend**: React.js with Tailwind CSS, Shadcn UI components, Framer Motion
- **Backend**: FastAPI (Python) with Socket.IO for real-time
- **Database**: MongoDB
- **Integrations**: OpenAI GPT-4, Stripe Payments, Socket.IO

## User Personas
1. **Family Admin**: Creates and manages family groups, invites members
2. **Family Member**: Collaborates on trips, uses chat, tracks budgets
3. **Super Admin**: Manages users, families, payments via admin panel

## Core Requirements (Static)
- [x] JWT Authentication (register/login)
- [x] Family Group Management (create/join with invite code)
- [x] Trip Planning & Itinerary Builder
- [x] Real-time Family Chat (Socket.IO)
- [x] Budget Tracker (multi-currency support)
- [x] Packing List Management
- [x] AI Assistant (requires user's OpenAI API key)
- [x] Premium Subscription (Stripe)
- [x] Hidden Admin Panel (/superadmin-secret-access)

## What's Been Implemented (January 2025)
### MVP Features
1. **Landing Page**: Hero section, features grid, testimonials, CTA
2. **Authentication**: Registration, login, JWT tokens
3. **Dashboard**: Family overview, quick actions, trip cards
4. **Family Management**: Create family, generate invite codes, join families
5. **Trip Planner**: Create trips, set dates/budget/destination
6. **Trip Detail**: 
   - Itinerary tab (add/delete activities, AI generation)
   - Packing list tab (categorized items, toggle packed)
   - Budget tab (expense tracking, progress bar)
7. **Real-time Chat**: Socket.IO messaging, typing indicators
8. **AI Assistant**: Chat interface, quick prompts (requires OpenAI key)
9. **Settings**: Profile view, invite code sharing, premium upgrade
10. **Admin Panel**: User management, family oversight, payment tracking

### Tech Stack
- React + Tailwind CSS + Shadcn UI
- FastAPI + Socket.IO
- MongoDB
- Stripe Checkout
- OpenAI GPT-4 integration (ready for API key)

## Prioritized Backlog
### P0 (Critical)
- [ ] User provides OpenAI API key for AI features

### P1 (High Priority)
- [ ] Photo gallery with upload functionality
- [ ] Location tracker with consent system
- [ ] Push notifications (PWA service worker)
- [ ] Offline support for itineraries

### P2 (Medium Priority)
- [ ] Booking search integration (flights/hotels)
- [ ] Emergency hub with SOS contacts
- [ ] Multi-timezone support
- [ ] Currency converter

### P3 (Nice to Have)
- [ ] AR/VR destination previews
- [ ] Gamified challenges with points
- [ ] Eco-impact carbon tracking
- [ ] Smart home prep (IFTTT)

## Next Tasks
1. Add OpenAI API key configuration in settings
2. Implement photo gallery with cloud storage
3. Add PWA service worker for offline support
4. Implement location sharing with consent
5. Add booking search APIs

## API Keys Required
- `OPENAI_API_KEY`: User must provide for AI features
- `STRIPE_API_KEY`: Already configured (sk_test_emergent)
