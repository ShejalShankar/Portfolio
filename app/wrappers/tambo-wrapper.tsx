'use client';

import { TamboProvider } from '@tambo-ai/react';
import { components } from 'lib/tambo';

interface TamboWrapperProps {
  children: React.ReactNode;
}

export function TamboWrapper({ children }: TamboWrapperProps) {
  return (
    <TamboProvider
      components={components}
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
    >
      {children}
    </TamboProvider>
  );
}
