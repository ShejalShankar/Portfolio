'use client';

import { cn } from 'lib/utils';
import { Loader2, Mic, MicOff } from 'lucide-react';
import * as React from 'react';

interface SpeechToTextStreamProps {
  onTranscript: (transcript: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
}

export function SpeechToTextStream({
  onTranscript,
  onSubmit,
  disabled = false,
  className,
}: SpeechToTextStreamProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const processingRef = React.useRef(false);
  const lastProcessedChunkRef = React.useRef(0);
  const mimeTypeRef = React.useRef<string>('');

  const processAudioChunk = async (audioBlob: Blob) => {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>(resolve => {
        reader.onloadend = () => {
          const result = reader.result?.toString().split(',')[1] || '';
          resolve(result);
        };
        reader.readAsDataURL(audioBlob);
      });

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64,
          type: 'audio',
          mimeType: mimeTypeRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process audio');
      }

      const data = await response.json();

      if (data.type === 'transcript') {
        onTranscript(data.text);

        if (data.shouldSubmit) {
          await stopRecording();
          onSubmit();
        }
      }
    } catch (err) {
      console.error('Error processing audio chunk:', err);
      setError(err.message || 'Failed to process audio');
    } finally {
      processingRef.current = false;
    }
  };

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
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Try different MIME types in order of preference
      // Prioritize formats that are widely supported by OpenAI
      const mimeTypes = [
        'audio/wav',
        'audio/mp4',
        'audio/mpeg',
        'audio/mp3',
        'audio/ogg;codecs=opus',
        'audio/webm;codecs=opus',
        'audio/webm',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Selected MIME type:', selectedMimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      mimeTypeRef.current = selectedMimeType;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = async event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Process accumulated audio every 2 seconds
          const now = Date.now();
          if (now - lastProcessedChunkRef.current > 2000) {
            lastProcessedChunkRef.current = now;
            const audioBlob = new Blob(audioChunksRef.current, {
              type: selectedMimeType,
            });
            await processAudioChunk(audioBlob);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        // Process any remaining audio
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: selectedMimeType,
          });
          await processAudioChunk(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check your permissions.');
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

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

    audioChunksRef.current = [];
    lastProcessedChunkRef.current = 0;
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
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
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Listening...
          </span>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-1 left-0 text-xs text-red-500 whitespace-nowrap z-10 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
