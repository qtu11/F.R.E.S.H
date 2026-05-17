import { NextResponse } from 'next/server';
import { getServerClient } from './server';

export function requireClient() {
  const client = getServerClient();
  if (!client) {
    throw { status: 503, message: 'Supabase not configured. Go to /admin/setup' };
  }
  return client;
}

export function handleError(err: any) {
  console.error('API Error:', err);
  if (err?.status) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
