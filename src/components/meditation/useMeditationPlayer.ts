import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, AudioPlayer, AudioStatus } from 'expo-audio';
import { useAudio } from '../../context/AudioContext';
import { BILIBILI_HEADERS, resolveAudioStream } from '../../services/bilibili';
import { MeditationSession } from '../../data/meditation';

const LOAD_TIMEOUT_MS = 20000;
const MAX_REPEAT = 3;

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  buffering: boolean;
}

export function useMeditationPlayer(session: MeditationSession | undefined) {
  const { pauseAll, timerRemaining } = useAudio();
  const [state, setState] = useState<PlayerState>({
    playing: false,
    currentTime: 0,
    duration: session?.duration ?? 0,
    buffering: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loop, setLoop] = useState(true);
  const [repeatCount, setRepeatCount] = useState(0);

  const playerRef = useRef<AudioPlayer | null>(null);
  const urlsRef = useRef<string[]>([]);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatRef = useRef(0);
  const playCountRef = useRef(0);
  // Seeking to the very end should not count as a natural finish (mirrors MeditationPlayerManager).
  const ignoreNextEndedRef = useRef(false);

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = null;
  };

  const release = useCallback(() => {
    clearLoadTimeout();
    const player = playerRef.current;
    playerRef.current = null;
    if (player) {
      player.pause();
      player.remove();
    }
  }, []);

  const handleEnded = useCallback((player: AudioPlayer) => {
    const count = repeatRef.current;
    if (count <= 0) return;
    if (ignoreNextEndedRef.current) {
      ignoreNextEndedRef.current = false;
      return;
    }
    if (playCountRef.current >= count) {
      player.pause();
      player.seekTo(0);
      return;
    }
    playCountRef.current += 1;
    player.seekTo(0);
    player.play();
  }, []);

  const tryUrl = useCallback(
    (index: number, loopEnabled: boolean) => {
      release();
      const uri = urlsRef.current[index];
      if (!uri) {
        setLoading(false);
        setError(true);
        return;
      }
      const player = createAudioPlayer({ uri, headers: BILIBILI_HEADERS }, { updateInterval: 500 });
      playerRef.current = player;
      player.loop = loopEnabled;

      const fallback = () => {
        if (playerRef.current === player) tryUrl(index + 1, player.loop);
      };
      loadTimeoutRef.current = setTimeout(fallback, LOAD_TIMEOUT_MS);

      player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (playerRef.current !== player) return;
        if (status.playbackState === 'failed') {
          fallback();
          return;
        }
        if (status.isLoaded) {
          clearLoadTimeout();
          setLoading(false);
        }
        setState({
          playing: status.playing,
          currentTime: status.currentTime,
          duration: status.duration > 0 ? status.duration : session?.duration ?? 0,
          buffering: status.isBuffering,
        });
        if (status.didJustFinish) handleEnded(player);
      });

      playCountRef.current = repeatRef.current > 0 ? 1 : 0;
      ignoreNextEndedRef.current = false;
      pauseAll();
      player.play();
    },
    [handleEnded, pauseAll, release, session?.duration],
  );

  const load = useCallback(
    async (force = false) => {
      if (!session) return;
      setLoading(true);
      setError(false);
      try {
        const stream = await resolveAudioStream(session.sourceId, { force });
        urlsRef.current = session.audioUrl ? [session.audioUrl, ...stream.urls] : stream.urls;
        tryUrl(0, loop);
      } catch {
        setLoading(false);
        setError(true);
      }
    },
    [loop, session, tryUrl],
  );

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || error) {
      load(error);
      return;
    }
    if (player.playing) {
      player.pause();
    } else {
      pauseAll();
      player.play();
    }
  }, [error, load, pauseAll]);

  const seekTo = useCallback(
    (seconds: number) => {
      const player = playerRef.current;
      if (!player) return;
      const target = Math.max(0, Math.min(seconds, state.duration));
      if (repeatRef.current > 0 && state.duration > 0 && target >= state.duration - 0.5) {
        ignoreNextEndedRef.current = true;
      }
      player.seekTo(target);
      setState((s) => ({ ...s, currentTime: target }));
    },
    [state.duration],
  );

  const skip = useCallback((delta: number) => seekTo(state.currentTime + delta), [seekTo, state.currentTime]);

  const toggleLoop = useCallback(() => {
    const next = !loop;
    setLoop(next);
    if (next) {
      setRepeatCount(0);
      repeatRef.current = 0;
      playCountRef.current = 0;
      ignoreNextEndedRef.current = false;
    }
    if (playerRef.current) playerRef.current.loop = next;
  }, [loop]);

  const cycleRepeat = useCallback(() => {
    const next = (repeatCount + 1) % (MAX_REPEAT + 1);
    setRepeatCount(next);
    repeatRef.current = next;
    playCountRef.current = next > 0 ? 1 : 0;
    ignoreNextEndedRef.current = false;
    if (next > 0) {
      setLoop(false);
      if (playerRef.current) playerRef.current.loop = false;
    }
  }, [repeatCount]);

  // The shared sleep timer only stops white noise; pause meditation when it reaches zero too.
  useEffect(() => {
    if (timerRemaining === 0) playerRef.current?.pause();
  }, [timerRemaining]);

  useEffect(() => release, [release]);

  return { state, loading, error, loop, repeatCount, load, togglePlay, seekTo, skip, toggleLoop, cycleRepeat };
}
