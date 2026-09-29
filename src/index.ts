import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { seedDatabase } from './database/seed';

import complaintsRouter from './routes/complaints';
import clustersRouter from './routes/clusters';
import districtsRouter from './routes/districts';
import priorityRouter from './routes/priority';
import reviewRouter from './routes/review';
import briefsRouter from './routes/briefs';
import verificationRouter from './routes/verification';
import auditRouter from './routes/audit';
import demoRouter from './routes/demo';

const app = express();

const allowedOrigins = CONFIG.FRONTEND_URL === '*'
  ? true
  : [CONFIG.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database with demo seeds
seedDatabase();

// Mount API routes
app.use('/api', complaintsRouter);
app.use('/api', clustersRouter);
app.use('/api', districtsRouter);
app.use('/api', priorityRouter);
app.use('/api', reviewRouter);
app.use('/api', briefsRouter);
app.use('/api', verificationRouter);
app.use('/api', auditRouter);
app.use('/api', demoRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'JAN-SETU AI Backend',
    mode: CONFIG.AI_PROVIDER_MODE,
    timestamp: new Date().toISOString()
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`====================================================`);
  console.log(` JAN-SETU AI Backend Command Center Running `);
  console.log(` Port: ${CONFIG.PORT} | Mode: ${CONFIG.AI_PROVIDER_MODE} `);
  console.log(`====================================================`);
});
