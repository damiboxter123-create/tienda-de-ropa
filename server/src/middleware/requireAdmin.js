import { supabaseAdmin, supabaseAuth } from '../supabase.js';

export async function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Sesion requerida' });

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Sesion invalida' });

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, email')
      .eq('id', data.user.id)
      .single();

    if (adminError || !admin) return res.status(403).json({ error: 'Usuario no autorizado' });

    req.user = data.user;
    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ error: 'No se pudo validar el acceso' });
  }
}
