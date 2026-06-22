jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
import api from './api';
import { getCategories } from './newsService';

beforeEach(() => jest.clearAllMocks());

test('getCategories ana kategorileri düz {slug,name} döner, alt kategorileri atar', async () => {
  api.get.mockResolvedValue({ data: [
    { slug: 'gündem', name: 'Gündem', subcategories: [{ slug: 'asayis', name: 'Asayiş' }] },
    { slug: 'spor',   name: 'Spor',   subcategories: [] },
  ]});
  const result = await getCategories();
  expect(api.get).toHaveBeenCalledWith('/news/categories');
  expect(result).toEqual([
    { slug: 'gündem', name: 'Gündem' },
    { slug: 'spor',   name: 'Spor' },
  ]);
});

test('getCategories beklenmedik yanıtta boş dizi döner', async () => {
  api.get.mockResolvedValue({ data: null });
  expect(await getCategories()).toEqual([]);
});
