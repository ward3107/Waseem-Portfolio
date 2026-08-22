import React from 'react';
import type { JourneyAct } from './journeyConfig';

/**
 * One act of the journey — a transparent wrapper around the existing feature
 * section(s) for that act. It carries the anchor id (for the rail + engine) and
 * a `data-act` hook the scroll engine reads to find act boundaries. It sets no
 * background of its own: the fixed journey ground shows through, which is the
 * whole point. The inner sections keep their cards, blobs and copy untouched.
 */
interface ActProps {
  act: JourneyAct;
  children: React.ReactNode;
}

const Act: React.FC<ActProps> = ({ act, children }) => (
  <div id={act.anchor} data-act={act.id} className="relative scroll-mt-24">
    {children}
  </div>
);

export default Act;
