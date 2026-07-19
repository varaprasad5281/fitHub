# 7% — Fitness & Accountability Platform

> _"Only 7% of people who start a fitness journey actually stick to it. Are you part of the 7%?"_

A full-stack fitness platform that helps users track workouts, log nutrition, compete on leaderboards, and connect with an accountability network — all behind a subscription model with Pro and Elite tiers.

---

## Features

### Free (Starter)

- User registration & authentication
- Profile setup (age, weight, height, fitness goal, activity level)
- View pricing & upgrade options

### Pro ($12.99/month or $99/year)

- **Workout Plans** — AI-generated personalised workout plans based on your profile
- **Workout Builder** — Create custom workouts with exercise selection
- **Exercise Library** — Image previews and instructions for every exercise
- **Workout History** — Last 7 completed workouts stored and reviewable
- **Nutrition Tracking** — Log daily meals (breakfast, lunch, dinner, snacks)
- **AI Meal Plans** — Generate daily meal plans tailored to your calorie target and dietary preference
- **Calorie & Macro Tracking** — Visual progress bars for calories, protein, carbs, fats
- **Daily Coaching** — AI-powered personalised coaching advice based on your data
- **Weekly Review** — Strategic long-term coaching insights
- **Progress Goals** — Set and track fitness goals with progress percentages
- **Streak Tracking** — Daily activity streaks with multipliers
- **Points & Levels** — XP-based levelling system

### Elite ($24.99/month or $199/year — everything in Pro plus:)

- **Global Leaderboard** — Weekly and all-time rankings across points, workouts, nutrition, and streaks
- **Friends & Social** — Add friends, send friend requests, build an accountability circle
- **Direct Messaging** — Chat directly with training partners
- **Social Activity Feed** — See friends' workouts, meals, and streaks in real time
- **Friends Leaderboard** — Private rankings among your friends
- **Community Challenges** — Create and join timed fitness challenges with prizes
- **Badges & Achievements** — Earn badges for milestones and consistency

---

## Tech Stack

### Frontend

| Technology           | Purpose                  |
| -------------------- | ------------------------ |
| React 18             | UI framework             |
| Vite                 | Build tool & dev server  |
| React Router v6      | Client-side routing      |
| TanStack Query v5    | Server state & caching   |
| Framer Motion        | Animations & transitions |
| Tailwind CSS         | Styling                  |
| shadcn/ui + Radix UI | Component library        |
| Recharts             | Data visualisation       |
| Sonner               | Toast notifications      |
| Stripe.js            | Payment UI               |

### Backend

| Technology             | Purpose                               |
| ---------------------- | ------------------------------------- |
| Node.js + Express      | REST API server                       |
| MongoDB + Mongoose     | Database & ODM                        |
| JWT                    | Authentication                        |
| bcryptjs               | Password hashing                      |
| Stripe                 | Subscription billing                  |
| Nodemailer             | Email (password reset)                |
| Anthropic Claude API   | AI coaching & meal/workout generation |
| Helmet + Rate Limiting | Security                              |

---

## Project Structure

```
7-percent/
├── src/                    # React frontend
│   ├── api/                # API client
│   ├── components/         # Reusable UI components
│   │   ├── challenges/
│   │   ├── coaching/
│   │   ├── conversion/     # Upsell & preview components
│   │   ├── friends/
│   │   ├── leaderboard/
│   │   ├── nutrition/
│   │   ├── workout/
│   │   └── ui/             # shadcn base components
│   ├── lib/                # Auth context, utilities
│   └── pages/              # Route-level page components
│
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/
│   │   ├── functions/      # Business logic handlers
│   │   └── entities.js     # Generic CRUD routes
│   ├── services/           # AI, email services
│   ├── middleware/         # Auth, rate limiting
│   └── index.js
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Anthropic API key (for AI features)

### 1. Clone the repository

```bash
git clone https://github.com/varaprasad5281/7-percent.git
cd 7-percent
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/7percent
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5174
```

### 5. Run the development servers

**Backend** (in `/server`):

```bash
npm run dev
```

**Frontend** (in project root):

```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

---

## Subscription Plans

| Feature                         | Starter |    Pro    |   Elite   |
| ------------------------------- | :-----: | :-------: | :-------: |
| Workout plans & builder         |   ❌    |    ✅     |    ✅     |
| Nutrition tracking & meal plans |   ❌    |    ✅     |    ✅     |
| Daily AI coaching               |   ❌    |    ✅     |    ✅     |
| Progress goals & streaks        |   ❌    |    ✅     |    ✅     |
| Global leaderboard              |   ❌    |    ❌     |    ✅     |
| Friends & social features       |   ❌    |    ❌     |    ✅     |
| Community challenges            |   ❌    |    ❌     |    ✅     |
| Badges & achievements           |   ❌    |    ❌     |    ✅     |
| **Price**                       |  Free   | $12.99/mo | $24.99/mo |

---

## License

MIT
# fitHub
