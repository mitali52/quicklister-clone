'use client';

import { useEffect } from 'react';
import { bootstrapAuthSession } from '@/lib/api/client';

let bootstrapStarted = false;

export function AuthBootstrapper() {
  useEffect(() => {
    if (bootstrapStarted) return;
    bootstrapStarted = true;

    void bootstrapAuthSession();
  }, []);

  return null;
}
