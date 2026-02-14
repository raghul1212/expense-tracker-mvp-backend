import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Create expense with equal split
router.post('/', async (req, res) => {
  try {
    const { 
      group_id, 
      description, 
      amount, 
      category,
      expense_date,
      notes,
      paid_by_email,
      split_with_emails // Array of emails to split with
    } = req.body;

    // Verify payer exists
    const payer = await prisma.user.findUnique({
      where: { email: paid_by_email }
    });

    if (!payer) {
      return res.status(400).json({ error: 'Payer must be a member first' });
    }

    // Get user IDs for split
    const splitUsers = await prisma.user.findMany({
      where: { email: { in: split_with_emails } },
      select: { id: true }
    });

    if (splitUsers.length === 0) {
      return res.status(400).json({ error: 'No valid users to split with' });
    }

    // Calculate equal split using integer cents to avoid floating-point errors
    const totalAmount = parseFloat(amount);
    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / splitUsers.length);
    const remainderCents = totalCents - baseCents * splitUsers.length;

    // Create expense with splits in a transaction
    const expense = await prisma.expense.create({
      data: {
        groupId: group_id,
        description,
        amount: totalAmount,
        category: category || 'other',
        expenseDate: expense_date ? new Date(expense_date) : new Date(),
        notes,
        paidBy: payer.id,
        splits: {
          create: splitUsers.map((user: { id: string }, i: number) => {
            // Distribute extra pennies one each to the first N users
            const cents = baseCents + (i < remainderCents ? 1 : 0);
            return { userId: user.id, amount: (cents / 100).toFixed(2) };
          })
        }
      },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    // Shape response to match existing format
    const response = {
      ...expense,
      paid_by: expense.payer,
      splits: expense.splits.map((s: any) => ({
        user_id: s.userId,
        user_name: s.user.name,
        amount: s.amount,
        settled: s.settled
      }))
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Get all expenses for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: [
        { expenseDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const result = expenses.map(e => ({
      ...e,
      paid_by: e.payer,
      splits: e.splits.map(s => ({
        user_id: s.userId,
        user_name: s.user.name,
        amount: s.amount,
        settled: s.settled
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        payer: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const response = {
      ...expense,
      paid_by: expense.payer,
      splits: expense.splits.map(s => ({
        user_id: s.userId,
        user_name: s.user.name,
        amount: s.amount,
        settled: s.settled
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({ where: { id } });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;