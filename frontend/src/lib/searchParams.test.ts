import { describe, expect, it } from 'vitest';
import {
  buildResultsPath,
  parseResultsParams,
  prettifySlug,
  resultsHeading,
  slugify,
} from './searchParams';

describe('results URL <-> filters', () => {
  it('builds a shareable URL from a selected state and city', () => {
    expect(buildResultsPath({ state: 'Assam', city: 'Guwahati' })).toBe('/mistris?state=assam&city=guwahati');
    expect(buildResultsPath({ state: 'Uttar Pradesh' })).toBe('/mistris?state=uttar-pradesh');
  });

  it('omits defaults and ignores a city without a state', () => {
    expect(buildResultsPath({})).toBe('/mistris');
    expect(buildResultsPath({ city: 'Guwahati' })).toBe('/mistris');
    expect(buildResultsPath({ state: 'Assam', page: 1, sort: 'random' })).toBe('/mistris?state=assam');
  });

  it('round-trips every filter so refresh and sharing preserve them', () => {
    const filters = { state: 'assam', city: 'guwahati', category: 'electrician', q: 'wiring', minExp: 5, sort: 'rating' as const, page: 3 };
    const path = buildResultsPath(filters);
    expect(parseResultsParams(new URLSearchParams(path.split('?')[1]))).toEqual(filters);
  });

  it('tolerates junk or hand-edited values', () => {
    const parsed = parseResultsParams(new URLSearchParams('state=ASSAM&city=Guwahati&sort=evil&page=-4&minExp=abc'));
    expect(parsed).toMatchObject({ state: 'assam', city: 'guwahati', sort: 'random', page: 1, minExp: 0 });
    expect(parseResultsParams(new URLSearchParams('city=guwahati')).city).toBe('');
  });

  it('puts the selected state and city in the heading', () => {
    expect(resultsHeading({ city: 'Guwahati', state: 'Assam' })).toBe('Mistris in Guwahati, Assam');
    expect(resultsHeading({ category: 'Electrician', state: 'Assam' })).toBe('Electrician in Assam');
    expect(resultsHeading({})).toBe('All Mistris');
    expect(prettifySlug('uttar-pradesh')).toBe('Uttar Pradesh');
    expect(slugify('Jammu & Kashmir')).toBe('jammu-and-kashmir');
  });
});
