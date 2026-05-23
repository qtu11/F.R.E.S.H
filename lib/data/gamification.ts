export interface GamificationTier {
  id: string; name: string; minPoints: number; maxPoints: number;
  color: string; icon: string; benefits: string; multiplier: number;
}
export interface GamificationBadge {
  id: string; name: string; description: string; icon: string;
  category: string; threshold: number; tierId: string;
}
export interface UserBadge { id: string; userId: string; badgeId: string; earnedAt: string; badge?: GamificationBadge; }
export interface Mission {
  id: string; title: string; description: string; type: string;
  requirementType: string; requirementValue: number; pointsReward: number;
  icon: string; active: boolean;
}
export interface UserMission {
  id: string; userId: string; missionId: string; progress: number;
  completed: boolean; completedAt?: string; claimed: boolean; mission?: Mission;
}
export interface PointsEntry {
  id: string; userId: string; points: number; type: string;
  source: string; referenceId?: string; description?: string; createdAt: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const gamificationService = {
  async getAll(userId: string) { return api(`/gamification?userId=${encodeURIComponent(userId)}`); },
  async claimMission(userId: string, missionId: string) {
    return api('/gamification', { method: 'POST', body: JSON.stringify({ action: 'claim_mission', userId, missionId }) });
  },
  async updateProgress(userId: string, missionId: string, amount: number) {
    return api('/gamification', { method: 'POST', body: JSON.stringify({ action: 'update_progress', userId, missionId, amount }) });
  },
};
