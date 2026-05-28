import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole, checkStoreAccess } from '@/lib/auth/middleware';
import { applyRescueCatalogImages } from '@/lib/data/rescue-products';

function withCatalogImages<T>(data: T): T {
  return applyRescueCatalogImages(data as { id?: string; image?: string }[] | { id?: string; image?: string } | null) as T;
}

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const storeId = searchParams.get('storeId');
    const live = searchParams.get('live');
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const nearby = searchParams.get('nearby');
    const topRated = searchParams.get('topRated');
    const endingSoon = searchParams.get('endingSoon');

    let builder = supabase.from('products').select('*');

    if (id) builder = builder.eq('id', id);
    else if (storeId) builder = builder.eq('store_id', storeId);
    else if (live === 'true') builder = builder.eq('status', 'live').gt('stock', 0);
    else if (category && category !== 'All') builder = builder.eq('category', category).eq('status', 'live').gt('stock', 0);

    const { data, error } = await builder;
    if (error) return handleError(error);

    // Filter out old seed trash products starting with 'p' (but keep 'rp' and UUIDs)
    const filteredData = (data || []).filter((p: any) => !p.id.startsWith('p') || p.id.startsWith('rp'));

    if (id) return NextResponse.json(withCatalogImages(toCamelCase(filteredData?.[0] || null)));
    if (query) {
      const q = query.toLowerCase();
      const filtered = filteredData.filter((p: any) =>
        p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.store_name?.toLowerCase().includes(q)
      );
      return NextResponse.json(withCatalogImages(toCamelCase(filtered)));
    }
    if (nearby) {
      const maxDist = parseFloat(nearby);
      return NextResponse.json(withCatalogImages(toCamelCase(filteredData.filter((p: any) => (p.distance ?? 999) <= maxDist))));
    }
    if (topRated) {
      return NextResponse.json(withCatalogImages(toCamelCase([...filteredData].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, parseInt(topRated)))));
    }
    if (endingSoon) {
      const hours = parseInt(endingSoon);
      const now = new Date();
      const threshold = new Date(now.getTime() + hours * 3600000);
      return NextResponse.json(withCatalogImages(toCamelCase(filteredData.filter((p: any) => {
        const expiry = new Date(p.expiry);
        return expiry <= threshold && expiry > now;
      }).sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()))));
    }

    return NextResponse.json(withCatalogImages(toCamelCase(filteredData)));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const rawBody = await req.json();
    const nutrition = typeof rawBody.nutrition === 'object' ? { ...rawBody.nutrition } : {};
    if (rawBody.description) nutrition.description = rawBody.description;
    if (rawBody.details) nutrition.details = rawBody.details;
    if (rawBody.mfgDate) nutrition.mfgDate = rawBody.mfgDate;
    if (rawBody.expiryDate) nutrition.expiryDate = rawBody.expiryDate;

    // Auto-resolve store_id for partner users if missing or empty
    let storeId = rawBody.storeId || rawBody.store_id;
    if (!storeId && auth.user.role === 'partner') {
      const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).maybeSingle();
      if (user?.organization_id) {
        const { data: branch } = await supabase.from('organization_branches').select('store_id').eq('organization_id', user.organization_id).maybeSingle();
        storeId = branch?.store_id;
      }
    }
    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, storeId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    // Lấy store_name chuẩn từ DB để tránh lỗi ràng buộc NOT NULL của bảng products
    const { data: storeObj, error: storeErr } = await supabase
      .from('stores')
      .select('name')
      .eq('id', storeId)
      .single();

    if (storeErr || !storeObj) {
      return NextResponse.json({ error: 'Cửa hàng liên kết không tồn tại hoặc đã bị xóa' }, { status: 404 });
    }
    const storeName = storeObj.name;

    const cleanBody = {
      ...rawBody,
      store_id: storeId,
      nutrition: JSON.stringify(nutrition)
    };
    delete cleanBody.description;
    delete cleanBody.details;
    delete cleanBody.mfgDate;
    delete cleanBody.expiryDate;
    delete cleanBody.storeId;
    delete cleanBody.storeName;

    const data = toSnakeCase(cleanBody);
    const newProduct = { 
      ...data, 
      id: crypto.randomUUID(), 
      store_name: storeName,
      created_at: new Date().toISOString() 
    };
    const { data: result, error } = await supabase.from('products').insert(newProduct).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const rawBody = await req.json();
    const id = rawBody.id;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Lấy thông tin store_id và nutrition hiện tại của sản phẩm
    const { data: existingProduct, error: getErr } = await supabase
      .from('products')
      .select('store_id, nutrition')
      .eq('id', id)
      .single();

    if (getErr || !existingProduct) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, existingProduct.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    // Phục hồi và merge nutrition cũ để tránh mất mát dữ liệu
    let existingNutrition = {};
    if (existingProduct.nutrition) {
      try {
        existingNutrition = typeof existingProduct.nutrition === 'string'
          ? JSON.parse(existingProduct.nutrition)
          : existingProduct.nutrition;
      } catch {
        existingNutrition = {};
      }
    }

    const nutrition = {
      ...existingNutrition,
      ...(typeof rawBody.nutrition === 'object' ? rawBody.nutrition : {})
    };
    if (rawBody.description !== undefined) nutrition.description = rawBody.description;
    if (rawBody.details !== undefined) nutrition.details = rawBody.details;
    if (rawBody.mfgDate !== undefined) nutrition.mfgDate = rawBody.mfgDate;
    if (rawBody.expiryDate !== undefined) nutrition.expiryDate = rawBody.expiryDate;

    const cleanBody = {
      ...rawBody,
      nutrition: JSON.stringify(nutrition)
    };
    delete cleanBody.description;
    delete cleanBody.details;
    delete cleanBody.mfgDate;
    delete cleanBody.expiryDate;

    const body = toSnakeCase(cleanBody);
    const { id: _, ...updates } = body;
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
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

    // Lấy thông tin sản phẩm để kiểm tra store_id
    const { data: product, error: getErr } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', id)
      .single();

    if (getErr || !product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, product.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return handleError(error);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
