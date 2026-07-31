import React from 'react';

/**
 * Page header inside the admin shell. `actions` is a slot for buttons like
 * "+ Add project" on list screens, "Save" on editor screens.
 */
const Topbar: React.FC<{ title: string; actions?: React.ReactNode }> = ({
  title,
  actions,
}) => (
  <header className="sticky top-0 z-30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
        {title}
      </h1>
      <div className="flex items-center gap-2 shrink-0">{actions}</div>
    </div>
  </header>
);

export default Topbar;
