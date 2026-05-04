# Agendify — Frontend

> React + TypeScript interface for the Agendify AI-powered Twitter promotion platform.

**Live:** [agendifyx.up.railway.app](https://agendifyx.up.railway.app) &nbsp;|&nbsp; **Backend repo:** [Agendify-Backend](https://github.com/Eilonasraf/Agendify-Backend)

---

## Overview

Agendify lets users promote their stance on any topic by automatically finding opposing voices on Twitter, generating AI-crafted replies, and deploying them through a bot pool. This repo is the full React frontend — authentication, campaign management, promote workflow, and engagement analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| Styling | Bootstrap 5 + custom CSS |
| Charts | Chart.js + react-chartjs-2 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Auth | JWT + Google OAuth (`@react-oauth/google`) |
| Notifications | React Toastify |
| Icons | React Icons + Font Awesome |

---

## Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Landing page |
| Login | `/login` | Email/password + Google OAuth |
| Register | `/register` | Account creation with avatar upload |
| Dashboard | `/dashboard` | Overview of activity and stats |
| Agendas | `/agendas` | List of all promotion campaigns |
| New Campaign | `/agendas/new` | Create a new campaign |
| Campaign Detail | `/agendas/:id` | Tweets, replies, and engagement metrics |
| Promote | `/promote` | Run the AI promote pipeline |
| Results | `/promote/results` | Review and approve generated replies |
| Profile | `/profile` | User settings |
| Pricing | `/pricing` | Plans overview |
| About | `/about` | Project info |

---

## Project Structure

```
src/
├── components/
│   ├── App.tsx             # Root component + route setup
│   ├── Navbar.tsx          # Navigation bar
│   ├── PromoteForm.tsx     # Topic/stance input form
│   └── TweetEmbed.tsx      # Tweet card renderer
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── AgendasPage.tsx
│   ├── NewClusterPage.tsx
│   ├── PromotionClusterPage.tsx
│   ├── PromotePage.tsx
│   ├── PromoteResultsPage.tsx
│   ├── ProfilePage.tsx
│   ├── PricingPage.tsx
│   └── AboutPage.tsx
├── context/
│   └── AuthContext.tsx     # Global auth state
├── services/
│   └── api-client.ts       # Axios instance + API calls
├── styles/                 # Per-page CSS modules
└── assets/                 # Images and icons
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Agendify Backend running (see [Agendify-Backend](https://github.com/Eilonasraf/Agendify-Backend))

### Installation

```bash
git clone https://github.com/Eilonasraf/Agendify-Frontend.git
cd Agendify-Frontend
npm install
```

### Environment

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Build

```bash
npm run build
```
