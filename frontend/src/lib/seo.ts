import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute or root-relative canonical path. Defaults to the current URL without tracking noise. */
  canonicalPath?: string;
  /** Keep thin/empty/error pages out of search results. */
  noindex?: boolean;
}

const SITE_NAME = 'MistriKhoj';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): () => void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !element;
  const previous = element?.getAttribute('content') ?? null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return () => {
    if (created) element?.remove();
    else if (previous !== null) element?.setAttribute('content', previous);
  };
}

/**
 * Sets the document title and description / Open Graph / robots / canonical tags for the
 * current page and restores the previous values when the page unmounts.
 */
export function usePageMeta({ title, description, canonicalPath, noindex }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    const restores = [
      setMeta('meta[name="description"]', 'name', 'description', description),
      setMeta('meta[property="og:title"]', 'property', 'og:title', document.title),
      setMeta('meta[property="og:description"]', 'property', 'og:description', description),
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website'),
      setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, follow' : 'index, follow'),
    ];

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalCreated = !canonical;
    const previousHref = canonical?.getAttribute('href') ?? null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', new URL(canonicalPath ?? window.location.pathname, window.location.origin).href);

    return () => {
      document.title = previousTitle;
      restores.forEach((restore) => restore());
      if (canonicalCreated) canonical?.remove();
      else if (previousHref !== null) canonical?.setAttribute('href', previousHref);
    };
  }, [title, description, canonicalPath, noindex]);
}
