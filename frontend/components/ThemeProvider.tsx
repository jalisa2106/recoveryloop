'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
};
