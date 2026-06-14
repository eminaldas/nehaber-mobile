import { applyThreadVote, applyHelpful } from './voteLogic';

const base = { vote_suspicious: 10, vote_authentic: 5, vote_investigate: 2, current_user_vote: null };

describe('applyThreadVote', () => {
  test('yeni oy ekler', () => {
    const r = applyThreadVote(base, 'suspicious');
    expect(r.vote_suspicious).toBe(11);
    expect(r.current_user_vote).toBe('suspicious');
  });
  test('aynı oya tekrar = geri çekme', () => {
    const voted = { ...base, vote_suspicious: 11, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'suspicious');
    expect(r.vote_suspicious).toBe(10);
    expect(r.current_user_vote).toBe(null);
  });
  test('oy değiştirme eskiyi düşürür yeniyi artırır', () => {
    const voted = { ...base, vote_suspicious: 11, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'authentic');
    expect(r.vote_suspicious).toBe(10);
    expect(r.vote_authentic).toBe(6);
    expect(r.current_user_vote).toBe('authentic');
  });
  test('sayım 0in altına inmez', () => {
    const voted = { vote_suspicious: 0, vote_authentic: 0, vote_investigate: 0, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'suspicious');
    expect(r.vote_suspicious).toBe(0);
  });
});

describe('applyHelpful', () => {
  test('beğeni ekler', () => {
    const r = applyHelpful({ helpful_count: 3, current_user_helpful: false });
    expect(r.helpful_count).toBe(4);
    expect(r.current_user_helpful).toBe(true);
  });
  test('beğeni geri çeker', () => {
    const r = applyHelpful({ helpful_count: 4, current_user_helpful: true });
    expect(r.helpful_count).toBe(3);
    expect(r.current_user_helpful).toBe(false);
  });
});
