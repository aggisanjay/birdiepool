# BirdiePool 🏌️‍♂️

> **Play. Win. Give Back.** — Turn your golf scores into prizes and charitable impact.

A subscription-based golf charity platform where users enter their Stableford scores, participate in monthly prize draws, and donate a portion of their subscription to a chosen charity.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (JWT) |
| Payments | Stripe (Subscriptions + Webhooks) |
| Email | Resend |
| Deployment | Vercel |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/birdiepool.git
cd birdiepool
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in your Supabase, Stripe, and other keys
```

### 3. Database Setup

Run migrations in Supabase SQL Editor in order:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions.sql
supabase/migrations/004_seed.sql
```

### 4. Stripe Setup

1. Create two products: Monthly (£9.99/mo) and Yearly (£89.90/yr)
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Subscribe to: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### 5. Run Development Server

```bash
npm run dev
```

---

## Key Features

- **Score Management** — Rolling 5-score system (newest replaces oldest)
- **Monthly Draw** — Random or algorithmic (frequency-weighted) number generation
- **Prize Pool** — 40% jackpot / 35% 4-match / 25% 3-match split
- **Jackpot Rollover** — Unclaimed 5-match jackpots roll to next month
- **Charity Contributions** — Min 10% of subscription to chosen charity
- **Winner Verification** — Photo proof upload + admin approval workflow
- **Admin Dashboard** — Full draw management, user administration, analytics

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login, signup pages
│   ├── (protected)/        # User dashboard (auth-gated)
│   ├── (admin)/            # Admin panel (role-gated)
│   ├── (public)/           # Charities, landing pages
│   └── api/                # REST API endpoints
├── components/
│   ├── ui/                 # Shared primitives (Button, Card, Badge, Toast)
│   ├── layout/             # Navbar, Sidebar, Footer
│   ├── landing/            # Hero, HowItWorks, Pricing, CTA
│   ├── dashboard/          # User dashboard components
│   ├── admin/              # Admin-specific components
│   └── shared/             # AnimatedCounter, NumberBall
├── lib/
│   ├── draw-engine/        # Random, algorithmic draws, matching, prizes
│   ├── supabase/           # Browser & server clients
│   ├── stripe/             # Client & price config
│   ├── email/              # Resend client + templates
│   └── utils/              # Validators, formatters, errors, constants
├── hooks/                  # useUser, useScores, useDraws, useSubscription
├── stores/                 # Zustand app store
└── types/                  # TypeScript type definitions
supabase/
└── migrations/             # SQL migrations (run in order)
tests/
└── unit/                   # Vitest unit tests
```

---

## Admin Setup

After deployment, make your first admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@yourdomain.com';
```

---

## Running Tests

```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel → Framework: Next.js
3. Add all environment variables from `.env.example`
4. Deploy
5. Update Supabase Site URL and Stripe webhook URL with your Vercel domain

---

## Draw Flow

```
Admin creates draw (draft)
       ↓
Admin simulates (preview without committing)
       ↓
Admin executes draw (generates numbers, matches scores, creates winners)
       ↓
Admin publishes results (users notified)
       ↓
Winners upload proof → Admin verifies → Admin marks paid
       ↓
Draw marked completed
```

---

## License

MIT
