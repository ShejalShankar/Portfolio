'use client';

import { TamboProvider } from '@tambo-ai/react';
import { components, tools } from 'lib/tambo';

interface TamboWrapperProps {
  children: React.ReactNode;
}

export function TamboWrapper({ children }: TamboWrapperProps) {
  return (
    <TamboProvider
      components={components}
      tools={tools}
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
    >
      {children}
    </TamboProvider>
  );
}
