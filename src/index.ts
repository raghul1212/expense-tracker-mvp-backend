import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes (we'll create these next)
import groupRoutes from './routes/groups';
import expenseRoutes from './routes/expenses';
import userRoutes from './routes/users';
import { connect } from 'node:http2';
import { disconnectClient, getDbClient } from './utils/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/expenses', expenseRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

function initializeProcessEvents() {
    process.on('uncaughtException', (error) => {
        console.log(error);
    });    
    process.once('exit', () => {
        disconnectClient();
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

const bootstrap = async () => {
  try {
    await getDbClient();
    initializeProcessEvents();
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
};

bootstrap();