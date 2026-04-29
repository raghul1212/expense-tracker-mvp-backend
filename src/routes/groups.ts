import express from 'express';
import prisma from '../utils/prisma';

const router = express.Router();

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, currency, created_by_email, created_by_name } = req.body;

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email: created_by_email },
      update: {},
      create: { email: created_by_email, name: created_by_name }
    });

    // Create group and add creator as member in one transaction
    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        currency: currency || 'INR',
        createdBy: user.id,
        members: {
          create: { userId: user.id }
        }
      }
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group by ID with members
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { joinedAt: 'asc' }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      ...group,
      creator_name: group.creator.name,
      creator_email: group.creator.email,
      members: group.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        joined_at: m.joinedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Add member to group
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name }
    });

    // Add to group (skip if already member)
    await prisma.groupMember.upsert({
      where: {
        groupId_userId: { groupId: id, userId: user.id }
      },
      update: {},
      create: { groupId: id, userId: user.id }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get group balances
router.get('/:id/balances', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$queryRaw`SELECT * FROM get_group_balances(${id}::uuid)`;

    res.json(result);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

// Get settlement suggestions
router.get('/:id/settlements', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$queryRaw`SELECT * FROM get_settlement_suggestions(${id}::uuid)`;

    res.json(result);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

export default router;