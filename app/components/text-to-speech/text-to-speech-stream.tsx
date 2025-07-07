'use client';

import { cn } from 'lib/utils';
import * as React from 'react';

interface TextToSpeechStreamProps {
  text: string;
  voiceId?: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  className?: string;
  showControls?: boolean;
}

export function TextToSpeechStream({
  text,
  voiceId = process.env.ELEVENLABS_VOICE_ID,
  autoPlay = true,
  onStart,
  onEnd,
  className,
  showControls = true,
}: TextToSpeechStreamProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = React.useRef(false);

  const streamTextToSpeech = React.useCallback(async () => {
    if (!text || hasStartedRef.current) return;

    hasStartedRef.current = true;
    setError(null);

    try {
      // Make a POST request to our API route
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Create blob URL from response
      const audioBlob = await response.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(blobUrl);

      // Create audio element and play
      const audio = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => {
        if (autoPlay) {
          audio.play().catch(err => {
            console.error('Autoplay failed:', err);
            // Don't show error for autoplay failures
          });
        }
      };

      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        onEnd?.();
      };

      audio.onerror = () => {
        setError('Failed to load audio');
      };
    } catch (err) {
      console.error('Text-to-speech error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate speech'
      );
    }
  }, [text, voiceId, autoPlay, onStart, onEnd]);

  // Auto-play on mount if enabled
  React.useEffect(() => {
    if (autoPlay && text && !hasStartedRef.current) {
      streamTextToSpeech();
    }
  }, [text, autoPlay, streamTextToSpeech]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (!showControls) {
    return null;
  }

  // Only show error if one occurs, otherwise render nothing
  if (error) {
    return (
      <span className={cn('text-xs text-red-600 dark:text-red-400', className)}>
        {error}
      </span>
    );
  }

  return null;
}
