import { diffSelection } from './selection';

const ALL = ['gündem', 'ekonomi', 'spor', 'sağlık'];

test('seçilmeyen ve gizli olmayanlar gizlenir', () => {
  expect(diffSelection(ALL, ['gündem', 'ekonomi'], [])).toEqual({
    toAdd: ['spor', 'sağlık'], toRemove: [],
  });
});

test('seçilen ama gizli olanlar geri açılır', () => {
  expect(diffSelection(ALL, ['gündem', 'spor'], ['spor', 'sağlık'])).toEqual({
    toAdd: ['ekonomi'], toRemove: ['spor'],
  });
});

test('hem ekleme hem çıkarma birlikte', () => {
  expect(diffSelection(ALL, ['gündem', 'spor', 'sağlık'], ['spor'])).toEqual({
    toAdd: ['ekonomi'], toRemove: ['spor'],
  });
});

test('değişiklik yoksa ikisi de boş', () => {
  expect(diffSelection(ALL, ['gündem', 'ekonomi'], ['spor', 'sağlık'])).toEqual({
    toAdd: [], toRemove: [],
  });
});
