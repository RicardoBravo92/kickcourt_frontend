import { buildHttpParams, extractResults } from './paginated';

describe('extractResults', () => {
  it('returns the array as-is when the response is not paginated', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(extractResults(items)).toBe(items);
  });

  it('returns the results when the response is paginated', () => {
    const response = {
      count: 2,
      next: null,
      previous: null,
      results: [{ id: 1 }, { id: 2 }],
    };
    expect(extractResults(response)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('buildHttpParams', () => {
  it('returns empty params when no filters are provided', () => {
    expect(buildHttpParams().toString()).toBe('');
    expect(buildHttpParams(null).toString()).toBe('');
  });

  it('skips undefined, null and empty string values', () => {
    const params = buildHttpParams({ a: undefined, b: null, c: '', d: 0, e: false });
    expect(params.get('a')).toBeNull();
    expect(params.get('b')).toBeNull();
    expect(params.get('c')).toBeNull();
    expect(params.get('d')).toBe('0');
    expect(params.get('e')).toBe('false');
  });

  it('stringifies defined values', () => {
    const params = buildHttpParams({ search: 'tenis', is_active: true, vendor: 7 });
    expect(params.get('search')).toBe('tenis');
    expect(params.get('is_active')).toBe('true');
    expect(params.get('vendor')).toBe('7');
  });
});
