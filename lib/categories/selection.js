// Seçim → backend hidden_categories listesi farkı (saf, framework-free).
// allSlugs: tüm ana kategori slug'ları; selected: kullanıcının görmek istedikleri;
// currentHidden: backend'deki mevcut gizli liste.
export function diffSelection(allSlugs, selected, currentHidden) {
  const selectedSet = new Set(selected);
  const hiddenSet   = new Set(currentHidden);
  const toAdd    = allSlugs.filter(s => !selectedSet.has(s) && !hiddenSet.has(s));
  const toRemove = allSlugs.filter(s =>  selectedSet.has(s) &&  hiddenSet.has(s));
  return { toAdd, toRemove };
}
