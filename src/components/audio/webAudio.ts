export type AudioContextConstructor = new () => AudioContext;

interface WebAudioWindow extends Window {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
}

export function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as WebAudioWindow;

  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

export function createBrowserAudioContext(): AudioContext | null {
  const AudioContextConstructor = getAudioContextConstructor();

  if (!AudioContextConstructor) {
    return null;
  }

  try {
    return new AudioContextConstructor();
  } catch {
    return null;
  }
}
