import { NextResponse } from 'next/server';
import { saveConfig } from '@/lib/supabase/config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const config = saveConfig(body);
    return NextResponse.json({ success: true, configured: config.configured });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
