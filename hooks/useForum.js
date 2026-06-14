import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listThreads, getMyBookmarks, getThreadDetail, voteThread, toggleBookmark,
  addComment, helpfulVote, reportThread, reportComment, createThread, deleteThread,
} from '../services/forumService';
import { applyThreadVote } from '../lib/forum/voteLogic';

const PAGE = (last) => {
  const loaded = last.page * last.size;
  return loaded < last.total ? last.page + 1 : undefined;
};

export function useThreads(sort = 'hot') {
  return useInfiniteQuery({
    queryKey: ['forum', 'threads', sort],
    queryFn: ({ pageParam = 1 }) =>
      sort === 'bookmarks'
        ? getMyBookmarks({ page: pageParam })
        : listThreads({ sort, page: pageParam }),
    getNextPageParam: PAGE,
    initialPageParam: 1,
  });
}

export function useThread(id) {
  return useQuery({ queryKey: ['forum', 'thread', id], queryFn: () => getThreadDetail(id), enabled: !!id });
}

export function useVote(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voteType) => voteThread(id, voteType),
    onMutate: async (voteType) => {
      await qc.cancelQueries({ queryKey: ['forum', 'thread', id] });
      const prev = qc.getQueryData(['forum', 'thread', id]);
      if (prev) qc.setQueryData(['forum', 'thread', id], { ...prev, ...applyThreadVote(prev, voteType) });
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['forum', 'thread', id], ctx.prev); },
    onSuccess: (data) => {
      const cur = qc.getQueryData(['forum', 'thread', id]);
      if (cur) qc.setQueryData(['forum', 'thread', id], { ...cur, ...data });
    },
  });
}

export function useAddComment(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => addComment(id, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'thread', id] }),
  });
}

export function useHelpful(threadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => helpfulVote(commentId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['forum', 'thread', threadId] }),
  });
}

export function useBookmarkToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => toggleBookmark(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => createThread(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}

export function useReportThread() {
  return useMutation({ mutationFn: ({ id, reason }) => reportThread(id, reason) });
}
export function useReportComment() {
  return useMutation({ mutationFn: ({ id, reason }) => reportComment(id, reason) });
}
export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteThread(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}
