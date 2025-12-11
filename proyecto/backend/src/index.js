import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import campsRouter from './routes/camps.routes.js';
import enrollmentsRouter from './routes/enrollments.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
});

app.use('/api/camps', campsRouter);
app.use('/api/enrollments', enrollmentsRouter);

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});



