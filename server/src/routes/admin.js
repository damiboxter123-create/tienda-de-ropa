import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { supabaseAdmin } from '../supabase.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/summary', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('products').select('stock, featured');
  if (error) return res.status(500).json({ error: error.message });

  res.json({
    products: data.length,
    featured: data.filter((product) => product.featured).length,
    outOfStock: data.filter((product) => product.stock <= 0).length,
    stock: data.reduce((sum, product) => sum + Number(product.stock || 0), 0)
  });
});

adminRouter.get('/products', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

adminRouter.post('/products', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(cleanProduct(req.body))
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

adminRouter.put('/products/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(cleanProduct(req.body))
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

adminRouter.delete('/products/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

adminRouter.get('/categories', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

adminRouter.post('/categories', async (req, res) => {
  const slug = String(req.body.name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: req.body.name, slug })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

function cleanProduct(input) {
  return {
    name: input.name,
    description: input.description,
    price: Number(input.price),
    stock: Number(input.stock),
    sizes: Array.isArray(input.sizes) ? input.sizes : [],
    colors: Array.isArray(input.colors) ? input.colors : [],
    image_urls: Array.isArray(input.image_urls) ? input.image_urls : [],
    category_id: input.category_id || null,
    featured: Boolean(input.featured)
  };
}
