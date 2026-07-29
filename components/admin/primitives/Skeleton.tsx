import React from 'react';

/**
 * Loading placeholder — a rounded pulsing block. Sized by whatever Tailwind
 * classes the caller passes in `className` (h-*, w-*).
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded ${className}`}
  />
);

export default Skeleton;
