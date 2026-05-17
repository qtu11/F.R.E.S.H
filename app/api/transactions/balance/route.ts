import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json(0);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json(0);

    const { data, error } = await supabase.from('users').select('wallet_balance').eq('id', userId).single();
    if (error) return handleError(error);
    return NextResponse.json(data?.wallet_balance || 0);
  } catch (err) { return handleError(err); }
}
