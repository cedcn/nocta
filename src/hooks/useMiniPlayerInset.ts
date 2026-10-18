import { useAudio } from '../context/AudioContext';

export const MINI_PLAYER_HEIGHT = 64;
const MINI_PLAYER_GAP = 12;

export function useMiniPlayerVisible() {
  const { playingSounds, meditation, soundStates, timerRemaining } = useAudio();
  return (
    playingSounds.length > 0 ||
    meditation !== null ||
    timerRemaining !== null ||
    Object.values(soundStates).includes('loading')
  );
}

// Extra bottom padding a scrolling screen needs so the mini player never covers its last items.
export function useMiniPlayerInset() {
  return useMiniPlayerVisible() ? MINI_PLAYER_HEIGHT + MINI_PLAYER_GAP : 0;
}
