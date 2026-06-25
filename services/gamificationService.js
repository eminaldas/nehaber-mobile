import api from './api';

export async function getLeaderboard({ period = 'alltime', type = 'xp' } = {}) {
  const { data } = await api.get('/gamification/leaderboard', { params: { period, type } });
  return data; // { period, type, entries:[{rank,user_id,username,avatar_url,level,value,showcase_badges}] }
}
