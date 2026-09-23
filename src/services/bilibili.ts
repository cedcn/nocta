export const BILIBILI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Referer: 'https://www.bilibili.com',
};

const REQUEST_TIMEOUT_MS = 15000;
// Signed CDN URLs expire (deadline ≈ 2h); refresh well before that.
const CACHE_TTL_MS = 60 * 60 * 1000;

interface DashAudio {
  id: number;
  baseUrl?: string;
  base_url?: string;
  backupUrl?: string[] | null;
  backup_url?: string[] | null;
  bandwidth: number;
}

export interface AudioStream {
  urls: string[];
  quality: number;
}

const cache = new Map<string, { stream: AudioStream; expiresAt: number }>();

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: BILIBILI_HEADERS, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { code: number; message?: string; data?: T };
    if (json.code !== 0 || !json.data) throw new Error(`Bilibili error ${json.code}: ${json.message ?? ''}`);
    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

async function getCid(bvid: string) {
  const data = await getJson<{ cid: number }>(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
  return data.cid;
}

async function getAudioStream(bvid: string, cid: number): Promise<AudioStream> {
  const data = await getJson<{ dash?: { audio?: DashAudio[] | null } }>(
    `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&fnval=16&fnver=0&fourk=1`,
  );
  const audios = data.dash?.audio ?? [];
  if (audios.length === 0) throw new Error('No audio stream');
  const best = audios.reduce((a, b) => (b.bandwidth > a.bandwidth ? b : a));
  const urls = [best.baseUrl ?? best.base_url, ...(best.backupUrl ?? best.backup_url ?? [])].filter(
    (u): u is string => !!u,
  );
  if (urls.length === 0) throw new Error('No audio url');
  return { urls, quality: best.id };
}

// Returns the primary URL followed by CDN mirrors, so the caller can fall back when one host fails.
export async function resolveAudioStream(bvid: string, { force = false } = {}): Promise<AudioStream> {
  const cached = cache.get(bvid);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.stream;
  const cid = await getCid(bvid);
  const stream = await getAudioStream(bvid, cid);
  cache.set(bvid, { stream, expiresAt: Date.now() + CACHE_TTL_MS });
  return stream;
}
