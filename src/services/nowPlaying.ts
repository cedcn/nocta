import { AudioLockScreenOptions, AudioMetadata, AudioPlayer, setAudioModeAsync } from 'expo-audio';

export const APP_ARTIST = 'Nocta';

const BASE_MODE = { playsInSilentMode: true, shouldPlayInBackground: true } as const;

let owner: AudioPlayer | null = null;

export const applyDefaultAudioMode = () =>
  setAudioModeAsync({ ...BASE_MODE, interruptionMode: 'mixWithOthers' }).catch(() => {});

// Lock screen / Dynamic Island / media notification controls only attach to a non-mixable session,
// so we switch to doNotMix while a player owns them and go back to mixing once it lets go.
export async function claimLockScreen(
  player: AudioPlayer,
  metadata: AudioMetadata,
  options?: AudioLockScreenOptions,
) {
  owner = player;
  await setAudioModeAsync({ ...BASE_MODE, interruptionMode: 'doNotMix' }).catch(() => {});
  if (owner !== player) return;
  try {
    player.setActiveForLockScreen(true, metadata, options);
  } catch {
    // Player was removed before the audio mode switch completed.
  }
}

export function updateLockScreen(player: AudioPlayer, metadata: AudioMetadata) {
  if (owner !== player) return;
  try {
    player.updateLockScreenMetadata(metadata);
  } catch {
    // Player already removed.
  }
}

// Must run before player.remove(), otherwise the native session keeps a dangling player.
export function releaseLockScreen(player: AudioPlayer) {
  if (owner !== player) return;
  owner = null;
  try {
    player.setActiveForLockScreen(false);
  } catch {
    // Player already removed.
  }
  applyDefaultAudioMode();
}
