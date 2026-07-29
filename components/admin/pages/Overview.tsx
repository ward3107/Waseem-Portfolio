import React from 'react';
import Topbar from '../layout/Topbar';
import Skeleton from '../primitives/Skeleton';

const Overview: React.FC = () => (
  <>
    <Topbar title="Overview" />
    <div className="p-4 sm:p-6 space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </>
);

export default Overview;
