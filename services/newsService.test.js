jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
import api from './api';
import { getCategories, getNewsFeed } from './newsService';

beforeEach(() => jest.clearAllMocks());

test('getCategories ana + alt kategorileri {slug,name} olarak korur', async () => {
  api.get.mockResolvedValue({ data: [
    { slug: 'gündem', name: 'Gündem', subcategories: [{ slug: 'türkiye', name: 'Türkiye', extra: 1 }] },
    { slug: 'spor',   name: 'Spor',   subcategories: [] },
  ]});
  const result = await getCategories();
  expect(api.get).toHaveBeenCalledWith('/news/categories');
  expect(result).toEqual([
    { slug: 'gündem', name: 'Gündem', subcategories: [{ slug: 'türkiye', name: 'Türkiye' }] },
    { slug: 'spor',   name: 'Spor',   subcategories: [] },
  ]);
});

test('getCategories alt kategori alanı yoksa boş diziye düşer', async () => {
  api.get.mockResolvedValue({ data: [{ slug: 'gündem', name: 'Gündem' }] });
  expect(await getCategories()).toEqual([{ slug: 'gündem', name: 'Gündem', subcategories: [] }]);
});

test('getCategories beklenmedik yanıtta boş dizi döner', async () => {
  api.get.mockResolvedValue({ data: null });
  expect(await getCategories()).toEqual([]);
});

test('getNewsFeed category + subcategory paramlarını iletir', async () => {
  api.get.mockResolvedValue({ data: { items: [], total: 0, page: 1 } });
  await getNewsFeed({ page: 2, category: 'spor', subcategory: 'futbol' });
  expect(api.get).toHaveBeenCalledWith('/news', { params: { page: 2, page_size: 20, category: 'spor', subcategory: 'futbol' } });
});

test('getNewsFeed subcategory verilmezse param eklemez', async () => {
  api.get.mockResolvedValue({ data: { items: [], total: 0, page: 1 } });
  await getNewsFeed({ category: 'spor' });
  expect(api.get).toHaveBeenCalledWith('/news', { params: { page: 1, page_size: 20, category: 'spor' } });
});
