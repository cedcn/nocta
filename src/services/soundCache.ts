import { Directory, File, Paths } from 'expo-file-system';
import { SoundMetadata } from '../types';

const RAW_PREFIX = 'https://raw.githubusercontent.com/Tosencen/XMSLEEP/main/';
const JSDELIVR_PREFIX = 'https://cdn.jsdelivr.net/gh/Tosencen/XMSLEEP@main/';

// Kept in documents rather than caches so the OS doesn't purge sounds people rely on offline at night.
const soundsDir = new Directory(Paths.document, 'sounds');

const inflight = new Map<string, Promise<string>>();

const ensureDir = () => {
  if (!soundsDir.exists) soundsDir.create({ intermediates: true, idempotent: true });
};

const extensionOf = (url: string) => url.match(/\.(\w+)(?:\?|$)/)?.[1] ?? 'ogg';

const cachedFile = (sound: SoundMetadata) =>
  new File(soundsDir, `${sound.id}.${extensionOf(sound.remoteUrl ?? '')}`);

// raw.githubusercontent.com is unreachable in some regions, so jsDelivr goes first.
export const mirrorUrls = (url: string) =>
  url.startsWith(RAW_PREFIX) ? [JSDELIVR_PREFIX + url.slice(RAW_PREFIX.length), url] : [url];

export const isSoundCached = (sound: SoundMetadata) => {
  try {
    return cachedFile(sound).exists;
  } catch {
    return false;
  }
};

export async function resolveSoundUri(sound: SoundMetadata): Promise<string> {
  if (!sound.remoteUrl) throw new Error(`No source for ${sound.id}`);
  const file = cachedFile(sound);
  if (file.exists) return file.uri;

  const pending = inflight.get(sound.id);
  if (pending) return pending;

  const task = (async () => {
    ensureDir();
    let lastError: unknown;
    for (const url of mirrorUrls(sound.remoteUrl!)) {
      try {
        const downloaded = await File.downloadFileAsync(url, file, { idempotent: true });
        return downloaded.uri;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;
  })();
  inflight.set(sound.id, task);
  try {
    return await task;
  } finally {
    inflight.delete(sound.id);
  }
}

export const getCacheSize = () => {
  try {
    return soundsDir.exists ? soundsDir.size ?? 0 : 0;
  } catch {
    return 0;
  }
};

export const clearSoundCache = () => {
  try {
    if (soundsDir.exists) soundsDir.delete();
  } catch {
    // Nothing to clear.
  }
};
