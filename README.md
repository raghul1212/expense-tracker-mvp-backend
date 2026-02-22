# Expense Tracker - Split Easy

A simple expense tracker to split bills with friends.

## Features

- ✅ Create groups for different events
- ✅ Add expenses with automatic equal split
- ✅ View who owes whom
- ✅ Get settlement suggestions
- ✅ No sign-up required

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel (Frontend) + Render (Backend)

## Live Demo

🔗 [Expense Tracker - Split Easy](https://expense-tracker-mvp-ui.vercel.app/)

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase account)

### Setup

1. Clone the repository
```bash
git clone https://github.com/raghul1212/expense-tracker-mvp-backend.git
cd expense-tracker-mvp-backend
```

2. Setup Backend
```bash
npm install
cp .env.example .env
# Add your DATABASE_URL to .env
npm run dev
```

3. Test with these curl commands:

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Create group
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Group",
    "description": "Testing",
    "created_by_email": "test@example.com",
    "created_by_name": "Test User"
  }'

# Save the group ID from response

# 3. Add expense
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": "YOUR_GROUP_ID_HERE",
    "description": "Test Dinner",
    "amount": 300,
    "category": "food",
    "paid_by_email": "test@example.com",
    "split_with_emails": ["test@example.com", "friend@example.com"]
  }'

# 4. Get group balances
curl http://localhost:3000/api/v1/groups/YOUR_GROUP_ID_HERE/balances

# 5. Get expenses
curl http://localhost:3000/api/v1/expenses/group/YOUR_GROUP_ID_HERE
```

## License

[MIT](https://github.com/raghul1212/expense-tracker-mvp-backend?tab=MIT-1-ov-file)
