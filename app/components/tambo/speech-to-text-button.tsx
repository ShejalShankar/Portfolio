'use client';

import { cn } from 'lib/utils';
import { Loader2, Mic, MicOff } from 'lucide-react';
import * as React from 'react';

interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
}

export function SpeechToTextButton({
  onTranscript,
  onSubmit,
  disabled = false,
  className,
}: SpeechToTextButtonProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const websocketRef = React.useRef<WebSocket | null>(null);
  const transcriptBufferRef = React.useRef<string>('');
  const silenceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptTimeRef = React.useRef<number>(Date.now());

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Initialize WebSocket connection
      const ws = new WebSocket('/api/speech-to-text/websocket');
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsProcessing(false);
        setIsRecording(true);
      };

      ws.onmessage = async event => {
        const data = JSON.parse(event.data);

        if (data.type === 'transcript') {
          const newText = data.text;
          transcriptBufferRef.current = newText;
          onTranscript(newText);
          lastTranscriptTimeRef.current = Date.now();

          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Check if we should submit
          if (data.shouldSubmit) {
            await stopRecording();
            onSubmit();
          }
        } else if (data.type === 'error') {
          setError(data.message);
          await stopRecording();
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
        stopRecording();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (isRecording) {
          stopRecording();
        }
      };

      // Setup MediaRecorder
      // Try different mime types in order of preference
      const mimeTypes = [
        'audio/webm', // Keep webm as first option but without codec specification
        'audio/ogg',
        'audio/wav',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Convert blob to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1];
            if (base64) {
              ws.send(
                JSON.stringify({
                  type: 'audio',
                  data: base64,
                })
              );
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording with timeslice for streaming
      mediaRecorder.start(250); // Send audio chunks every 250ms
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone');
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(JSON.stringify({ type: 'stop' }));
      websocketRef.current.close();
      websocketRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    audioChunksRef.current = [];
    transcriptBufferRef.current = '';
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          isRecording &&
            'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
          isProcessing && 'opacity-50 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {error && (
        <div className="absolute top-full mt-1 left-0 right-0 text-xs text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}
