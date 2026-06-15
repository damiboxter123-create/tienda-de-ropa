import { supabase, supabaseReady } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getSessionToken() {
  if (!supabaseReady) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'No se pudo completar la accion');
  }
  return data;
}
