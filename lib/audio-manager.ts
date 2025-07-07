// Global audio manager to track all playing TTS audio
class AudioManager {
  private activeAudioElements: Set<HTMLAudioElement> = new Set();
  private listeners: Set<() => void> = new Set();

  registerAudio(audio: HTMLAudioElement) {
    this.activeAudioElements.add(audio);
    this.notifyListeners();

    // Remove from set when audio ends or is paused
    const cleanup = () => {
      this.activeAudioElements.delete(audio);
      this.notifyListeners();
    };

    audio.addEventListener('ended', cleanup);
    audio.addEventListener('pause', cleanup);
    audio.addEventListener('error', cleanup);
  }

  stopAllAudio() {
    this.activeAudioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
    });
    this.activeAudioElements.clear();
    this.notifyListeners();
  }

  getActiveAudioCount() {
    return this.activeAudioElements.size;
  }

  isPlaying() {
    return this.activeAudioElements.size > 0;
  }

  // Subscribe to audio state changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Global event listener
if (typeof window !== 'undefined') {
  window.addEventListener('tambo:stopAllTTS', () => {
    audioManager.stopAllAudio();
  });
}
