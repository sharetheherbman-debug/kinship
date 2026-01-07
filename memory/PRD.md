# Kinship Journeys - Product Requirements Document

## Original Problem Statement
Build Kinship Journeys - an all-in-one family travel planning and collaboration PWA for global families.

## User Requirements (Updated)
- **Color Scheme**: Teal/Cyan (#14B8A6) - fresh, travel-inspired
- **Pricing**: R49/month ZAR (base), auto-convert to user's currency
- **Extra Members**: R19/month per 5 additional members (beyond 10)
- **Copyright**: 2026
- **Branding**: No Emergent dependencies or branding

## Architecture
- **Frontend**: React.js + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI (Python) + Socket.IO
- **Database**: MongoDB
- **Integrations**: OpenAI GPT-4 (user provides key), Stripe Payments

## User Personas
1. **Family Admin**: Creates and manages family groups, invites members
2. **Family Member**: Collaborates on trips, uses chat, tracks budgets
3. **Super Admin**: /superadmin-secret-access for management

## Core Features Implemented
- [x] JWT Authentication with currency selection
- [x] Multi-currency pricing (ZAR, USD, GBP, EUR, AUD)
- [x] Family Group Management
- [x] Trip Planning with live countdown timers
- [x] Itinerary Builder (manual + AI generation)
- [x] Real-time Family Chat (Socket.IO)
- [x] Budget Tracker with expense splitting
- [x] Packing List Management
- [x] Location Tracking with consent & settings
- [x] Document Vault with expiry alerts
- [x] Milestone Tracker (birthdays, anniversaries)
- [x] Weather Forecasts for destinations
- [x] AI Assistant (requires OpenAI API key)
- [x] Premium Subscription (Stripe)
- [x] Hidden Admin Panel

## Pricing Model
| Currency | Base (10 members) | Extra (per 5) |
|----------|-------------------|---------------|
| ZAR      | R49               | R19           |
| USD      | $2.50             | $1.00         |
| GBP      | £2.00             | £0.80         |
| EUR      | €2.50             | €1.00         |
| AUD      | A$4.00            | A$1.50        |

## Setup Required
1. Add OpenAI API key: `/app/backend/.env` → `OPENAI_API_KEY=your-key`
2. Stripe is pre-configured with test keys

## Next Tasks
1. Photo gallery with cloud storage
2. PWA service worker for offline support
3. Push notifications
4. Booking search integrations (flights/hotels)
