'use client';

import { useEffect } from 'react';
import { bootstrapAuthSession } from '@/lib/api/client';

let bootstrapStarted = false;
const LEGACY_AUTH_STORAGE_KEYS = ['persist:auth', 'auth-storage'];

function clearLegacyAuthStorage() {
  if (typeof window === 'undefined') return;

  for (const key of LEGACY_AUTH_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function AuthBootstrapper() {
  useEffect(() => {
    if (bootstrapStarted) return;
    bootstrapStarted = true;

    clearLegacyAuthStorage();
    void bootstrapAuthSession();
  }, []);

  return null;
}
