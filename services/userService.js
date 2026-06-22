import api from './api';

export async function getFeedPreferences() {
  const { data } = await api.get('/users/me/feed-preferences');
  return {
    hiddenCategories:    data.hidden_categories    ?? [],
    hiddenSubcategories: data.hidden_subcategories ?? [],
    blockedSources:      data.blocked_sources      ?? [],
  };
}

export async function addHiddenCategory(slug) {
  const { data } = await api.patch('/users/me/feed-preferences', { add_hidden_category: slug });
  return data;
}

export async function removeHiddenCategory(slug) {
  const { data } = await api.patch('/users/me/feed-preferences', { remove_hidden_category: slug });
  return data;
}
