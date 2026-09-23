import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import type { RingtoneId } from '../../services/notifications';

export const RINGTONES: Record<RingtoneId, number> = {
  chime: require('../../../assets/ringtones/chime.m4a'),
  ding: require('../../../assets/ringtones/ding.m4a'),
  marimba: require('../../../assets/ringtones/marimba.m4a'),
  windchime: require('../../../assets/ringtones/windchime.m4a'),
};

export const RINGTONE_IDS = Object.keys(RINGTONES) as RingtoneId[];

const RING_TIMES = 3;

let alarm: AudioPlayer | null = null;
let preview: AudioPlayer | null = null;

const release = (player: AudioPlayer | null) => {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    // Already released.
  }
};

export function stopRingtone() {
  release(alarm);
  alarm = null;
  stopPreview();
}

export function playRingtone(id: RingtoneId) {
  stopRingtone();
  const player = createAudioPlayer(RINGTONES[id]);
  let played = 1;
  player.addListener('playbackStatusUpdate', (status) => {
    if (!status.didJustFinish || alarm !== player) return;
    if (played < RING_TIMES) {
      played++;
      player.seekTo(0).then(() => player.play());
    } else {
      release(player);
      alarm = null;
    }
  });
  alarm = player;
  player.play();
}

export function stopPreview() {
  release(preview);
  preview = null;
}

export function previewRingtone(id: RingtoneId, onDone?: () => void) {
  stopPreview();
  const player = createAudioPlayer(RINGTONES[id]);
  player.addListener('playbackStatusUpdate', (status) => {
    if (!status.didJustFinish || preview !== player) return;
    release(player);
    preview = null;
    onDone?.();
  });
  preview = player;
  player.play();
}
