# Kinship Journeys - Product Requirements Document

## Overview
Family travel planning PWA with modern, unique design - not stock standard.

## User Requirements Implemented
- **Design**: Modern, unique UI with teal/cyan color scheme (#14B8A6)
- **Pricing**: USD only - $4.99/month or $49.99/year (Save $10)
- **Extra members**: $1.99/month per 5 additional (beyond 10)
- **Copyright**: 2026
- **Branding**: No Emergent dependencies, clean branding

## Architecture
- **Frontend**: React.js + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + Socket.IO
- **Database**: MongoDB
- **Integrations**: OpenAI GPT-4 (user provides key), Stripe

## Pages Structure
- `/` - Landing Page (hero, feature preview, testimonial, CTA)
- `/features` - Full features page (9 main features)
- `/pricing` - Pricing page (monthly/yearly toggle, FAQs)
- `/auth` - Login/Register
- `/dashboard` - Family dashboard with countdown timer
- `/trips` - Trip planner
- `/trips/:id` - Trip detail (itinerary, packing, budget)
- `/chat` - Real-time family chat
- `/ai-assistant` - AI travel assistant
- `/tracking` - Location tracking dashboard
- `/documents` - Document vault
- `/settings` - User settings
- `/superadmin-secret-access` - Admin panel

## Core Features
- [x] JWT Authentication
- [x] Family Groups with invite codes
- [x] Trip Planning with live countdown timers
- [x] Itinerary Builder (manual + AI)
- [x] Real-time Family Chat (Socket.IO)
- [x] Budget Tracker with expense splitting
- [x] Packing Lists
- [x] Location Tracking with consent
- [x] Document Vault with expiry alerts
- [x] Milestone Tracker
- [x] Weather Forecasts
- [x] AI Assistant (requires OpenAI key)
- [x] Stripe Payments

## Components
- `Navbar` - Responsive nav with Features/Pricing links
- `Footer` - Full footer on all pages with 2026 copyright

## Setup Required
Add OpenAI API key: `/app/backend/.env` → `OPENAI_API_KEY=your-key`

## Next Tasks
1. Photo gallery with cloud storage
2. PWA service worker for offline support
3. Push notifications
4. Booking integrations
