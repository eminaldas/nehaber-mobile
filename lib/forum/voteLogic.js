const FIELD = {
  suspicious:  'vote_suspicious',
  authentic:   'vote_authentic',
  investigate: 'vote_investigate',
};

const dec = (n) => Math.max(0, (n || 0) - 1);

// Thread oyunu istemci tarafında optimistic uygular (ağırlık yok sayılır, ±1).
export function applyThreadVote(thread, voteType) {
  const next = { ...thread };
  const prev = thread.current_user_vote;

  if (prev && FIELD[prev]) next[FIELD[prev]] = dec(next[FIELD[prev]]);

  if (prev === voteType) {
    next.current_user_vote = null;        // toggle off
  } else {
    if (FIELD[voteType]) next[FIELD[voteType]] = (next[FIELD[voteType]] || 0) + 1;
    next.current_user_vote = voteType;
  }
  return next;
}

export function applyHelpful(comment) {
  const liked = comment.current_user_helpful;
  return {
    ...comment,
    helpful_count: liked ? dec(comment.helpful_count) : (comment.helpful_count || 0) + 1,
    current_user_helpful: !liked,
  };
}
