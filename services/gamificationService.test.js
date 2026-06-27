jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
import api from './api';
import { getLeaderboard, getMyRewards, markRewardSeen } from './gamificationService';

beforeEach(() => jest.clearAllMocks());

test('getLeaderboard varsayılan param ile çağırır', async () => {
  api.get.mockResolvedValue({ data: { period: 'alltime', type: 'xp', entries: [] } });
  await getLeaderboard({});
  expect(api.get).toHaveBeenCalledWith('/gamification/leaderboard', { params: { period: 'alltime', type: 'xp' } });
});

test('getLeaderboard period ve type iletir', async () => {
  api.get.mockResolvedValue({ data: { period: 'weekly', type: 'analyses', entries: [] } });
  const res = await getLeaderboard({ period: 'weekly', type: 'analyses' });
  expect(api.get).toHaveBeenCalledWith('/gamification/leaderboard', { params: { period: 'weekly', type: 'analyses' } });
  expect(res.type).toBe('analyses');
});

test('getMyRewards ödül endpointini çağırır', async () => {
  api.get.mockResolvedValue({ data: { items: [] } });
  await getMyRewards();
  expect(api.get).toHaveBeenCalledWith('/gamification/me/rewards');
});

test('markRewardSeen seen endpointine POST atar', async () => {
  api.post.mockResolvedValue({ data: null });
  await markRewardSeen('n1');
  expect(api.post).toHaveBeenCalledWith('/gamification/me/rewards/n1/seen');
});
