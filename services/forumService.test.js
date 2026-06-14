jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
import api from './api';
import { listThreads, voteThread, addComment, createThread } from './forumService';

beforeEach(() => jest.clearAllMocks());

test('listThreads discover ucunu doğru param ile çağırır', async () => {
  api.get.mockResolvedValue({ data: { items: [], total: 0, page: 1, size: 20 } });
  await listThreads({ sort: 'new', category: 'gundem', page: 2 });
  expect(api.get).toHaveBeenCalledWith('/forum/threads/discover', {
    params: { sort: 'new', page: 2, size: 20, category: 'gundem' },
  });
});

test('voteThread doğru body gönderir', async () => {
  api.post.mockResolvedValue({ data: {} });
  await voteThread('t1', 'suspicious');
  expect(api.post).toHaveBeenCalledWith('/forum/threads/t1/vote', { vote_type: 'suspicious' });
});

test('addComment parent_id ve evidence_urls iletir', async () => {
  api.post.mockResolvedValue({ data: {}, status: 201 });
  await addComment('t1', { body: 'x', parentId: 'c1', evidenceUrls: ['u'] });
  expect(api.post).toHaveBeenCalledWith('/forum/threads/t1/comments', { body: 'x', parent_id: 'c1', evidence_urls: ['u'] });
});

test('createThread payload alanlarını eşler', async () => {
  api.post.mockResolvedValue({ data: {} });
  await createThread({ title: 'T', body: 'B', category: 'gundem', postType: 'iddia', tagNames: ['a'], imageUrls: [], articleId: null });
  expect(api.post).toHaveBeenCalledWith('/forum/threads', {
    title: 'T', body: 'B', category: 'gundem', post_type: 'iddia', tag_names: ['a'], image_urls: [], article_id: null,
  });
});
