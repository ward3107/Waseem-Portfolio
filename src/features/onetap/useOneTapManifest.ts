import { useEffect } from 'react';

/**
 * Give the owner QR launcher and the recipient's card separate install identities.
 * Attaching the manifest only while the standalone route is mounted prevents
 * accidental installation of the business-card app from the main portfolio.
 */
export function useOneTapManifest(manifestUrl: string): void {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [manifestUrl]);
}
