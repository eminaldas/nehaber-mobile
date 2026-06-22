jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), patch: jest.fn() } }));
import api from './api';
import { getFeedPreferences, addHiddenCategory, removeHiddenCategory } from './userService';

beforeEach(() => jest.clearAllMocks());

test('getFeedPreferences snake_case yanıtı camelCase döner', async () => {
  api.get.mockResolvedValue({ data: { hidden_categories: ['spor'], hidden_subcategories: [], blocked_sources: [] } });
  const r = await getFeedPreferences();
  expect(api.get).toHaveBeenCalledWith('/users/me/feed-preferences');
  expect(r).toEqual({ hiddenCategories: ['spor'], hiddenSubcategories: [], blockedSources: [] });
});

test('eksik alanlar boş diziye düşer', async () => {
  api.get.mockResolvedValue({ data: {} });
  expect(await getFeedPreferences()).toEqual({ hiddenCategories: [], hiddenSubcategories: [], blockedSources: [] });
});

test('addHiddenCategory doğru body gönderir', async () => {
  api.patch.mockResolvedValue({ data: {} });
  await addHiddenCategory('spor');
  expect(api.patch).toHaveBeenCalledWith('/users/me/feed-preferences', { add_hidden_category: 'spor' });
});

test('removeHiddenCategory doğru body gönderir', async () => {
  api.patch.mockResolvedValue({ data: {} });
  await removeHiddenCategory('spor');
  expect(api.patch).toHaveBeenCalledWith('/users/me/feed-preferences', { remove_hidden_category: 'spor' });
});
