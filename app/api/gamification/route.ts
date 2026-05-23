import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireRole, requireAuth } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || auth.user.userId;

    // IDOR check: Chỉ cho phép xem gamification của chính mình hoặc admin
    if (auth.user.role !== 'admin' && auth.user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    if (!userId) {
      const [tiers, badges, missions] = await Promise.all([
        supabase.from('gamification_tiers').select('*').order('min_points'),
        supabase.from('gamification_badges').select('*'),
        supabase.from('gamification_missions').select('*').eq('active', true),
      ]);
      return NextResponse.json({
        tiers: toCamelCase(tiers.data || []),
        badges: toCamelCase(badges.data || []),
        missions: toCamelCase(missions.data || []),
      });
    }
    const [userData, userBadges, userMissions, pointsHistory, leaderboard] = await Promise.all([
      supabase.from('users').select('green_points,food_rescued,co2_reduced,total_orders').eq('id', userId).single(),
      supabase.from('user_badges').select('*, badge:gamification_badges(*)').eq('user_id', userId),
      supabase.from('user_missions').select('*, mission:gamification_missions(*)').eq('user_id', userId),
      supabase.from('points_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('users').select('id,name,avatar,green_points').not('green_points', 'eq', 0).order('green_points', { ascending: false }).limit(20),
    ]);
    const tiers = await supabase.from('gamification_tiers').select('*').order('min_points');
    const allMissions = await supabase.from('gamification_missions').select('*').eq('active', true);
    return NextResponse.json({
      user: toCamelCase(userData.data || { green_points: 0 }),
      userBadges: toCamelCase(userBadges.data || []),
      userMissions: toCamelCase(userMissions.data || []),
      pointsHistory: toCamelCase(pointsHistory.data || []),
      leaderboard: toCamelCase(leaderboard.data || []),
      tiers: toCamelCase(tiers.data || []),
      missions: toCamelCase(allMissions.data || []),
    });
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole('customer');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = await req.json();

    // Ngăn chặn IDOR: Kiểm tra userId được gửi trong request body phải khớp với user hiện tại
    if (body.userId !== auth.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    if (body.action === 'claim_mission') {
      const { data: progress } = await supabase.from('user_missions').select('*')
        .eq('user_id', body.userId).eq('mission_id', body.missionId).single();
      if (!progress || !progress.completed || progress.claimed) {
        return NextResponse.json({ error: 'Cannot claim' }, { status: 400 });
      }
      const { data: mission } = await supabase.from('gamification_missions').select('*').eq('id', body.missionId).single();
      if (!mission) {
        return NextResponse.json({ error: 'Mission not found' }, { status: 400 });
      }
      await supabase.from('user_missions').update({ claimed: true }).eq('user_id', body.userId).eq('mission_id', body.missionId);
      
      // Khắc phục lỗi RPC increment: Đọc điểm hiện tại và cộng dồn qua update
      const { data: user } = await supabase.from('users').select('green_points').eq('id', body.userId).single();
      const currentPoints = user?.green_points || 0;
      const newPoints = currentPoints + mission.points_reward;
      
      await supabase.from('users').update({ green_points: newPoints }).eq('id', body.userId);
      await supabase.from('points_history').insert({
        user_id: body.userId, points: mission.points_reward, type: 'earned',
        source: `mission:${mission.title}`, description: `Completed mission: ${mission.title}`, created_at: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }
    if (body.action === 'update_progress') {
      const { data: existing } = await supabase.from('user_missions').select('*')
        .eq('user_id', body.userId).eq('mission_id', body.missionId).single();
      if (existing) {
        const newProgress = (existing.progress || 0) + body.amount;
        const mission = await supabase.from('gamification_missions').select('*').eq('id', body.missionId).single();
        const completed = newProgress >= (mission.data?.requirement_value || 0);
        await supabase.from('user_missions').update({
          progress: newProgress, completed, completed_at: completed ? new Date().toISOString() : null,
        }).eq('user_id', body.userId).eq('mission_id', body.missionId);
      } else {
        await supabase.from('user_missions').insert({
          user_id: body.userId, mission_id: body.missionId, progress: body.amount,
        });
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) { return handleError(err); }
}
