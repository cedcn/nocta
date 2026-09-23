import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type RingtoneId = 'chime' | 'ding' | 'marimba' | 'windchime';

let handlerConfigured = false;
const configuredChannels = new Set<string>();

// Foreground alerts are handled in-app (ringtone + haptics), so the system banner/sound
// would only double up; it still fires normally when the app is backgrounded.
export function configureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return false;
  }
}

// Android binds the sound to the channel at creation time, so each ringtone needs its own channel.
async function ensureChannel(ringtone: RingtoneId | null, channelName: string): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const id = `pomodoro-${ringtone ?? 'silent'}`;
  if (configuredChannels.has(id)) return id;
  await Notifications.setNotificationChannelAsync(id, {
    name: channelName,
    importance: Notifications.AndroidImportance.HIGH,
    sound: ringtone ? `${ringtone}.m4a` : null,
    vibrationPattern: [0, 400, 250, 400, 250, 400],
  });
  configuredChannels.add(id);
  return id;
}

export async function schedulePhaseEndNotification(options: {
  date: number;
  title: string;
  body: string;
  ringtone: RingtoneId | null;
  channelName: string;
}): Promise<string | null> {
  try {
    const channelId = await ensureChannel(options.ringtone, options.channelName);
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        sound: options.ringtone ? `${options.ringtone}.m4a` : false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: options.date,
        channelId,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or never scheduled.
  }
}
