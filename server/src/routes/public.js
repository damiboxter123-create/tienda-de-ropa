import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

export const publicRouter = Router();

publicRouter.get('/products', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

publicRouter.get('/categories', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
