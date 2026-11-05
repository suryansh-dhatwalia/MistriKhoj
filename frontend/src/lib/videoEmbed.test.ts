import { describe, expect, it } from 'vitest';
import { toVideoEmbed } from './videoEmbed';

describe('toVideoEmbed', () => {
  it('keeps the Vimeo privacy hash from a player link (as saved in the admin)', () => {
    expect(
      toVideoEmbed('https://player.vimeo.com/video/677741698?h=582d68ae61&badge=0&autopause=0&player_id=0&app_id=58479'),
    ).toEqual({ kind: 'iframe', src: 'https://player.vimeo.com/video/677741698?h=582d68ae61&dnt=1' });
  });

  it('converts vimeo.com page links, including unlisted ones', () => {
    expect(toVideoEmbed('https://vimeo.com/675509060')?.src).toBe('https://player.vimeo.com/video/675509060?dnt=1');
    expect(toVideoEmbed('https://vimeo.com/675509060/50def86385')?.src).toBe(
      'https://player.vimeo.com/video/675509060?h=50def86385&dnt=1',
    );
  });

  it('converts the common YouTube link shapes', () => {
    const embed = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0';
    expect(toVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')?.src).toBe(embed);
    expect(toVideoEmbed('https://youtu.be/dQw4w9WgXcQ')?.src).toBe(embed);
    expect(toVideoEmbed('https://youtube.com/shorts/dQw4w9WgXcQ')?.src).toBe(embed);
  });

  it('plays direct video files natively', () => {
    expect(toVideoEmbed('https://res.cloudinary.com/demo/video/upload/v1/clip.mp4')).toEqual({
      kind: 'file',
      src: 'https://res.cloudinary.com/demo/video/upload/v1/clip.mp4',
    });
  });

  it('rejects unsafe or unknown links', () => {
    expect(toVideoEmbed('http://vimeo.com/675509060')).toBeNull();
    expect(toVideoEmbed('javascript:alert(1)')).toBeNull();
    expect(toVideoEmbed('https://example.com/page')).toBeNull();
    expect(toVideoEmbed('')).toBeNull();
  });
});
