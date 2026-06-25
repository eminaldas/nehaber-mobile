jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
import api from './api';
import { getLeaderboard } from './gamificationService';

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
