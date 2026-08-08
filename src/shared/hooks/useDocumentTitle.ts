import { useEffect } from 'react';

/**
 * Set document.title for the lifetime of the mounted component. React Router
 * doesn't manage <title> — without this, every route shares the static title
 * from index.html and Google indexes duplicates.
 */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
