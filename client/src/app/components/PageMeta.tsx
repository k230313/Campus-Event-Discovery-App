// ============================================
// File:    PageMeta.tsx
// Author:  OpenAI Codex
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Applies route-level document titles and meta descriptions.
// ============================================

import { useEffect } from 'react';

type PageMetaProps = {
  title: string;
  description: string;
};

/**
 * Applies per-page document metadata for the currently mounted route.
 * @param {PageMetaProps} props - Document title and description for the current page.
 * @returns {null} No visual output; updates document head via side effects.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionMeta?.getAttribute('content') ?? '';

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        descriptionMeta?.setAttribute('content', previousDescription);
      } else {
        descriptionMeta?.remove();
      }
    };
  }, [description, title]);

  return null;
}
