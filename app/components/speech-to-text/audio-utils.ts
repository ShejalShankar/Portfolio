import { WaveFile } from 'wavefile';

export async function convertToWav(audioBlob: Blob): Promise<Blob | null> {
  // Skip if blob is too small (less than 10KB)
  if (audioBlob.size < 10000) {
    console.log('Audio blob too small for conversion:', audioBlob.size);
    return null;
  }

  // Convert blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Create audio context to decode the audio
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  try {
    // Decode the audio data with error handling
    let audioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (decodeError) {
      console.log('Unable to decode audio data, likely incomplete chunk');
      return null;
    }

    // Check if we have valid audio data
    if (!audioBuffer || audioBuffer.length === 0) {
      return null;
    }

    // Get the audio data
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Create interleaved PCM data
    const interleavedData = new Float32Array(length * numberOfChannels);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        interleavedData[i * numberOfChannels + channel] = channelData[i];
      }
    }

    // Convert float32 to int16
    const int16Data = new Int16Array(interleavedData.length);
    for (let i = 0; i < interleavedData.length; i++) {
      const s = Math.max(-1, Math.min(1, interleavedData[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Create WAV file
    const wav = new WaveFile();
    wav.fromScratch(numberOfChannels, sampleRate, '16', int16Data);

    // Get WAV buffer
    const wavBuffer = wav.toBuffer();

    // Return as blob
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } finally {
    await audioContext.close();
  }
}
