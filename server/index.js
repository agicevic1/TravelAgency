import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import customersRouter from './routes/customers.js';
import bookingsRouter from './routes/bookings.js';
import dashboardRouter from './routes/dashboard.js';
import financialRouter from './routes/financial.js';
import slmRouter from './routes/slm.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//app.use(cors());
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role'],
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/financial', financialRouter);
app.use('/api/slm', slmRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TravelPlus API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
