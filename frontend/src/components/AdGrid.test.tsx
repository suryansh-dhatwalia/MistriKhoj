import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AdGrid } from './AdGrid';
import { AD_GRID_CLASS, AD_MEDIA_FRAME_CLASS, chunkIntoRows } from '../lib/adLayout';
import type { HomeAd } from '../data/ads';

const ad = (id: number, type: 'image' | 'video' = 'image'): HomeAd => ({
  id: String(id),
  companyName: `Sponsor ${id}`,
  title: `Ad ${id}`,
  description: 'desc',
  imageUrl: type === 'image' ? `https://x.test/${id}.png` : undefined,
  videoUrl: type === 'video' ? `https://x.test/${id}.mp4` : undefined,
  ctaText: 'Open',
  link: 'https://example.com',
  type,
});

const renderGrid = (ads: HomeAd[]) =>
  render(
    <MemoryRouter>
      <AdGrid ads={ads} />
    </MemoryRouter>,
  );

describe('ad layout', () => {
  it('is a one-column grid on phones and two columns from sm, never a single row', () => {
    renderGrid([ad(1), ad(2), ad(3), ad(4)]);
    const grid = screen.getByTestId('ad-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('sm:grid-cols-2');
    expect(grid.className).not.toMatch(/flex-nowrap|overflow-x|grid-flow-col|lg:grid-cols-3/);
    expect(AD_GRID_CLASS).toContain('sm:grid-cols-2');
  });

  it('renders ads in document order so 1,2 / 3,4 fill rows left to right', () => {
    renderGrid([ad(1), ad(2), ad(3), ad(4), ad(5)]);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual(['Ad 1', 'Ad 2', 'Ad 3', 'Ad 4', 'Ad 5']);
    expect(chunkIntoRows(titles, 2)).toEqual([['Ad 1', 'Ad 2'], ['Ad 3', 'Ad 4'], ['Ad 5']]);
  });

  it('gives every card the same fixed-ratio, letter-boxed media frame', () => {
    renderGrid([ad(1), ad(2, 'video')]);
    const frames = screen.getAllByTestId('ad-media-frame');
    expect(frames).toHaveLength(2);
    for (const frame of frames) {
      expect(frame.className).toBe(AD_MEDIA_FRAME_CLASS);
      const media = frame.querySelector('video, img:not([aria-hidden])');
      expect(media?.className).toContain('object-contain');
    }
  });

  it('videos have controls and never autoplay', () => {
    renderGrid([ad(2, 'video')]);
    const video = document.querySelector('video')!;
    expect(video.hasAttribute('controls')).toBe(true);
    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('renders nothing when there are no ads', () => {
    const { container } = renderGrid([]);
    expect(container.firstChild).toBeNull();
    expect(within(container).queryByTestId('ad-grid')).toBeNull();
  });
});
