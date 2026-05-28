import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole, checkStoreAccess } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const logs = searchParams.get('logs');
    if (logs && storeId) {
      if (logs === 'true') {
        const { data: storeIntegrations, error: intError } = await supabase
          .from('integrations')
          .select('id')
          .eq('store_id', storeId);
        
        if (intError) return handleError(intError);
        
        const integrationIds = (storeIntegrations || []).map((i: any) => i.id);
        if (integrationIds.length === 0) {
          return NextResponse.json([]);
        }

        const { data, error } = await supabase.from('webhook_logs')
          .select('*, integration:integrations(*)')
          .in('integration_id', integrationIds)
          .order('created_at', { ascending: false }).limit(50);
        
        if (error) return handleError(error);
        return NextResponse.json(toCamelCase(data || []));
      } else {
        const { data, error } = await supabase.from('webhook_logs')
          .select('*, integration:integrations(*)')
          .eq('integration_id', logs)
          .order('created_at', { ascending: false }).limit(50);
        if (error) return handleError(error);
        return NextResponse.json(toCamelCase(data || []));
      }
    }
    let builder = supabase.from('integrations').select('*');
    if (storeId) builder = builder.eq('store_id', storeId);
    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());

    if (body.event) { // webhook_log
      if (!body.integration_id) {
        return NextResponse.json({ error: 'integration_id is required' }, { status: 400 });
      }
      const { data: integration, error: getErr } = await supabase
        .from('integrations')
        .select('store_id')
        .eq('id', body.integration_id)
        .single();

      if (getErr || !integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
      }

      // Kiểm tra quyền hạn Store Access (IDOR check)
      const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, integration.store_id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
      }

      const newLog = { ...body, created_at: new Date().toISOString() };
      const { data, error } = await supabase.from('webhook_logs').insert(newLog).select().single();
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data), { status: 201 });
    }

    if (!body.store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, body.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const newIntegration = { ...body, id: crypto.randomUUID(), connected_at: new Date().toISOString(), last_sync_at: new Date().toISOString() };
    const { data, error } = await supabase.from('integrations').insert(newIntegration).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Lấy thông tin store_id của tích hợp để kiểm tra quyền
    const { data: integration, error: getErr } = await supabase
      .from('integrations')
      .select('store_id')
      .eq('id', id)
      .single();

    if (getErr || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, integration.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    updates.last_sync_at = new Date().toISOString();
    const { data, error } = await supabase.from('integrations').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Lấy thông tin store_id của tích hợp để kiểm tra quyền
    const { data: integration, error: getErr } = await supabase
      .from('integrations')
      .select('store_id')
      .eq('id', id)
      .single();

    if (getErr || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, integration.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    await supabase.from('integrations').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
