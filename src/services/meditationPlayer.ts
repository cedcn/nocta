import { useSyncExternalStore } from 'react';
import { AudioPlayer, AudioStatus, createAudioPlayer } from 'expo-audio';
import { BILIBILI_HEADERS, resolveAudioStream } from './bilibili';
import { releaseLockScreen } from './nowPlaying';
import { MeditationSession } from '../data/meditation';

const LOAD_TIMEOUT_MS = 20000;
export const MAX_REPEAT = 3;

export interface MeditationProgress {
  playing: boolean;
  currentTime: number;
  duration: number;
  buffering: boolean;
}

// Progress ticks twice a second; keeping it out of React context avoids re-rendering every useAudio() consumer.
const IDLE_PROGRESS: MeditationProgress = { playing: false, currentTime: 0, duration: 0, buffering: false };
let progress = IDLE_PROGRESS;
const listeners = new Set<() => void>();

const setProgress = (next: MeditationProgress) => {
  progress = next;
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getProgress = () => progress;

export const useMeditationProgress = () => useSyncExternalStore(subscribe, getProgress);

export interface MeditationCallbacks {
  /** The active player changed (initial load or a mirror fallback), or went away. */
  onPlayer: (player: AudioPlayer | null) => void;
  onLoading: (loading: boolean) => void;
  onError: () => void;
  /** Playback reached its natural end with no loop or repeats left. */
  onFinished: () => void;
}

export interface MeditationPlayback {
  readonly player: AudioPlayer | null;
  /** Playing, or set to start playing once loading finishes. */
  readonly active: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setLoop: (loop: boolean) => void;
  setRepeat: (count: number) => void;
  setVolume: (volume: number) => void;
  release: () => void;
}

export function createMeditationPlayback(
  session: MeditationSession,
  options: { loop: boolean; repeat: number; volume: number },
  callbacks: MeditationCallbacks,
): MeditationPlayback {
  let player: AudioPlayer | null = null;
  let urls: string[] = [];
  let loop = options.loop;
  let repeat = options.repeat;
  let volume = options.volume;
  let playCount = repeat > 0 ? 1 : 0;
  // Seeking to the very end should not count as a natural finish (mirrors MeditationPlayerManager).
  let ignoreNextEnded = false;
  let failed = false;
  let released = false;
  let loading = false;
  let loaded = false;
  // What the user asked for; applied once the stream is ready, so taps during loading aren't lost.
  let wantPlaying = true;
  let loadTimeout: ReturnType<typeof setTimeout> | null = null;

  const clearLoadTimeout = () => {
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = null;
  };

  const releasePlayer = () => {
    clearLoadTimeout();
    const current = player;
    player = null;
    if (current) {
      releaseLockScreen(current);
      current.pause();
      current.remove();
    }
  };

  const setLoading = (next: boolean) => {
    if (loading === next) return;
    loading = next;
    callbacks.onLoading(next);
  };

  const setWantPlaying = (next: boolean) => {
    wantPlaying = next;
    if (!loaded) setProgress({ ...progress, playing: next });
  };

  const fail = () => {
    releasePlayer();
    failed = true;
    setLoading(false);
    callbacks.onPlayer(null);
    callbacks.onError();
  };

  const handleEnded = (ended: AudioPlayer) => {
    if (ended.loop) return;
    if (repeat > 0) {
      if (ignoreNextEnded) {
        ignoreNextEnded = false;
        return;
      }
      if (playCount < repeat) {
        playCount += 1;
        ended.seekTo(0);
        ended.play();
        return;
      }
    }
    callbacks.onFinished();
  };

  const tryUrl = (index: number) => {
    releasePlayer();
    const uri = urls[index];
    if (!uri) {
      fail();
      return;
    }
    const next = createAudioPlayer({ uri, headers: BILIBILI_HEADERS }, { updateInterval: 500 });
    player = next;
    loaded = false;
    next.loop = loop;
    next.volume = volume;

    const fallback = () => {
      if (player === next) tryUrl(index + 1);
    };
    loadTimeout = setTimeout(fallback, LOAD_TIMEOUT_MS);

    next.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (player !== next) return;
      if (status.playbackState === 'failed') {
        fallback();
        return;
      }
      if (status.isLoaded && !loaded) {
        loaded = true;
        clearLoadTimeout();
        setLoading(false);
      }
      setProgress({
        playing: loaded ? status.playing : wantPlaying,
        currentTime: status.currentTime,
        duration: status.duration > 0 ? status.duration : session.duration,
        buffering: status.isBuffering,
      });
      if (status.didJustFinish) handleEnded(next);
    });

    playCount = repeat > 0 ? 1 : 0;
    ignoreNextEnded = false;
    if (wantPlaying) next.play();
    callbacks.onPlayer(next);
  };

  const load = async (force: boolean) => {
    failed = false;
    setLoading(true);
    try {
      const stream = await resolveAudioStream(session.sourceId, { force });
      if (released) return;
      urls = session.audioUrl ? [session.audioUrl, ...stream.urls] : stream.urls;
      tryUrl(0);
    } catch {
      if (!released) fail();
    }
  };

  setProgress({ ...IDLE_PROGRESS, playing: true, duration: session.duration });
  load(false);

  const play = () => {
    setWantPlaying(true);
    player?.play();
  };

  const pause = () => {
    setWantPlaying(false);
    player?.pause();
  };

  return {
    get player() {
      return player;
    },
    get active() {
      if (failed) return false;
      return loaded && player ? player.playing : wantPlaying;
    },
    play,
    pause,
    toggle: () => {
      if (failed) {
        wantPlaying = true;
        load(true);
        return;
      }
      const playing = loaded && player ? player.playing : wantPlaying;
      if (playing) pause();
      else play();
    },
    seekTo: (seconds: number) => {
      if (!player) return;
      const duration = progress.duration;
      const target = Math.max(0, Math.min(seconds, duration));
      if (repeat > 0 && duration > 0 && target >= duration - 0.5) ignoreNextEnded = true;
      player.seekTo(target);
      setProgress({ ...progress, currentTime: target });
    },
    setLoop: (next: boolean) => {
      loop = next;
      if (next) {
        repeat = 0;
        playCount = 0;
        ignoreNextEnded = false;
      }
      if (player) player.loop = next;
    },
    setRepeat: (count: number) => {
      repeat = count;
      playCount = count > 0 ? 1 : 0;
      ignoreNextEnded = false;
      if (count > 0) {
        loop = false;
        if (player) player.loop = false;
      }
    },
    // Kept for later fallback players too, so sleep-timer fades reach whichever mirror is playing.
    setVolume: (next: number) => {
      volume = next;
      if (!player) return;
      try {
        player.volume = next;
      } catch {
        // Player may have been removed concurrently.
      }
    },
    release: () => {
      released = true;
      releasePlayer();
      setProgress(IDLE_PROGRESS);
    },
  };
}

