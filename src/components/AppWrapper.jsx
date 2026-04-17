import React from 'react';
import { AuthCacheProvider } from '@/components/AuthCacheProvider';

export default function AppWrapper({ children }) {
  return (
    <AuthCacheProvider>
      {children}
    </AuthCacheProvider>
  );
}