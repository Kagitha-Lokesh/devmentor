import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export default function Revision() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 border-4 border-default border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-muted mt-3 font-semibold uppercase tracking-wider">Loading Revision Platform...</p>
      </div>
    }>
      <Outlet />
    </Suspense>
  );
}
