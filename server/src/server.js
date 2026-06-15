import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || 'Error interno' });
});

app.listen(port, () => {
  console.log(`Gonzalez Style API en http://localhost:${port}`);
});
