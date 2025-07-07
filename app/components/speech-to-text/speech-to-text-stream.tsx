'use client';

import { cn } from 'lib/utils';
import { Loader2, Mic, MicOff } from 'lucide-react';
import * as React from 'react';
import { convertToWav } from './audio-utils';

interface SpeechToTextStreamProps {
  onTranscript: (transcript: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
  onRecordingChange?: (recording: boolean) => void;
}

export function SpeechToTextStream({
  onTranscript,
  onSubmit,
  disabled = false,
  className,
  onRecordingChange,
}: SpeechToTextStreamProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const processingRef = React.useRef(false);
  const silenceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const isSpeakingRef = React.useRef(false);
  const recordingMimeTypeRef = React.useRef<string>('');

  // Voice activity detection
  const detectVoiceActivity = () => {
    if (!analyserRef.current) return false;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;

    // Threshold for voice detection
    const voiceThreshold = 20;

    return average > voiceThreshold;
  };

  const processAccumulatedAudio = async () => {
    if (audioChunksRef.current.length === 0 || processingRef.current) return;

    processingRef.current = true;
    setError(null);

    try {
      // Create blob from accumulated chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: recordingMimeTypeRef.current,
      });

      // Check minimum size
      if (audioBlob.size < 1000) {
        console.log('Audio chunk too small, skipping...');
        audioChunksRef.current = [];
        processingRef.current = false;
        return;
      }

      console.log('Converting audio to WAV format...');

      // Convert to WAV format
      let wavBlob: Blob | null;
      try {
        wavBlob = await convertToWav(audioBlob);
        if (!wavBlob) {
          console.log('Audio conversion returned null, skipping...');
          audioChunksRef.current = [];
          processingRef.current = false;
          return;
        }
        console.log('Conversion successful, WAV size:', wavBlob.size);
      } catch (conversionError) {
        console.error('Failed to convert to WAV:', conversionError);
        audioChunksRef.current = [];
        processingRef.current = false;
        return; // Don't throw, just skip this chunk
      }

      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result?.toString().split(',')[1];
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to read audio data'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(wavBlob);
      });

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64,
          type: 'audio',
          mimeType: 'audio/wav', // Always send as WAV
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process audio');
      }

      const data = await response.json();

      if (data.type === 'transcript' && data.text) {
        onTranscript(data.text);

        if (data.shouldSubmit) {
          await stopRecording();
          onSubmit();
        }
      }

      // Clear processed chunks
      audioChunksRef.current = [];
    } catch (err: any) {
      console.error('Error processing audio:', err);
      // Only show user-friendly errors
      if (
        !err.message?.includes('too short') &&
        !err.message?.includes('too small')
      ) {
        setError('Failed to process speech. Please try again.');
      }
    } finally {
      processingRef.current = false;
    }
  };

  const monitorSpeech = () => {
    const isCurrentlySpeaking = detectVoiceActivity();

    if (isCurrentlySpeaking && !isSpeakingRef.current) {
      // Speech started
      isSpeakingRef.current = true;

      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (!isCurrentlySpeaking && isSpeakingRef.current) {
      // Speech stopped, wait for a pause before processing
      isSpeakingRef.current = false;

      // Only process if we have accumulated audio
      if (audioChunksRef.current.length > 0) {
        silenceTimeoutRef.current = setTimeout(() => {
          processAccumulatedAudio();
        }, 1000); // Wait 1 second of silence
      }
    }

    // Continue monitoring if recording
    if (mediaRecorderRef.current?.state === 'recording') {
      requestAnimationFrame(monitorSpeech);
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

      // Set up audio context for voice activity detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      // Use webm format for recording (browser native)
      const mimeType = 'audio/webm;codecs=opus';

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error('Browser does not support audio recording');
      }

      recordingMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Process any remaining audio
        if (audioChunksRef.current.length > 0) {
          await processAccumulatedAudio();
        }
      };

      // Start recording
      mediaRecorder.start(100); // Small chunks for responsiveness
      setIsRecording(true);
      onRecordingChange?.(true);
      setIsProcessing(false);

      // Start monitoring speech
      monitorSpeech();
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check your permissions.');
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    onRecordingChange?.(false);

    // Clear any pending timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

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

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioChunksRef.current = [];
    isSpeakingRef.current = false;
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          'w-9 h-9 rounded-md transition-all duration-200',
          'flex items-center justify-center',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600',
          'text-neutral-600 dark:text-neutral-400',
          isRecording && [
            'bg-red-100 dark:bg-red-900/20',
            'text-red-600 dark:text-red-400',
            'hover:bg-red-200 dark:hover:bg-red-900/30',
          ],
          isProcessing && 'opacity-50 cursor-not-allowed',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {error && (
        <div className="absolute top-full mt-1 left-0 text-xs text-red-600 dark:text-red-400 whitespace-nowrap z-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-md shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
