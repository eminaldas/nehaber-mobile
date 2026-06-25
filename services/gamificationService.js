import api from './api';

export async function getLeaderboard({ period = 'alltime', type = 'xp' } = {}) {
  const { data } = await api.get('/gamification/leaderboard', { params: { period, type } });
  return data; // { period, type, entries:[{rank,user_id,username,avatar_url,level,value,showcase_badges}] }
}

export async function getMyRewards() {
  const { data } = await api.get('/gamification/me/rewards');
  return data; // { items: [{id, payload, created_at}] }
}

export async function markRewardSeen(id) {
  await api.post(`/gamification/me/rewards/${id}/seen`);
}
