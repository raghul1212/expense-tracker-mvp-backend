# Expense Tracker - Split Easy

A simple expense tracker to split bills with friends.

## Features

- ✅ Create groups for different events
- ✅ Add expenses with automatic equal split
- ✅ View who owes whom
- ✅ Get settlement suggestions
- ✅ No sign-up required

## Tech Stack

**Frontend:** React + TypeScript + Tailwind CSS
**Backend:** Node.js + Express + TypeScript
**Database:** PostgreSQL (Supabase)
**Deployment:** Vercel (Frontend) + Render (Backend)

## Live Demo

🔗 [https://your-app.vercel.app](https://your-app.vercel.app)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your DATABASE_URL to .env
npm run dev
```

3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Add VITE_API_URL to .env
npm run dev
```

4. Visit http://localhost:5173

## License

MIT
```