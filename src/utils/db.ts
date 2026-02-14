import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import prisma from './prisma';

dotenv.config();

let client : any = null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const getDbClient = async () => {
    if (!client) {
        client = await prisma.$connect();
        console.log('Connected to database successfully');
    }
    return client;
};

export const disconnectClient = () => {
    if (client) {
        client.$disconnect();
        client = null;
        console.log('Disconnected from database');
    }
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;