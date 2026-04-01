import { Howl } from "howler";

interface MusicSettings {
  api: string;
  songIds: number[];
  volume: number;
  urlField: string;
}

let settings: MusicSettings | null = null;
let currentHowl: Howl | null = null;
let isPlaying = false;
let onStateChange: ((playing: boolean) => void) | null = null;
let playedIds = new Set<number>();
let unplayedPool: number[] = [];
let currentSongId: number | null = null;
let isInitialized = false;
let isPlayingNext = false;

function initPool() {
  if (!settings) return;
  playedIds.clear();
  unplayedPool = [...settings.songIds];
}

function pickRandomId(): number {
  if (!settings || settings.songIds.length === 0) return 0;

  if (unplayedPool.length === 0) {
    initPool();
  }

  const randomIndex = Math.floor(Math.random() * unplayedPool.length);
  const id = unplayedPool[randomIndex];
  unplayedPool.splice(randomIndex, 1);
  playedIds.add(id);
  return id;
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object")
      return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

async function fetchSongUrl(id: number): Promise<string | null> {
  if (!settings) return null;
  try {
    const url = settings.api.replace("{id}", String(id));
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const songUrl = getNestedValue(data, settings.urlField);
    return typeof songUrl === "string" ? songUrl : null;
  } catch {
    return null;
  }
}

function stopCurrent() {
  if (currentHowl) {
    currentHowl.stop();
    currentHowl.unload();
    currentHowl = null;
    currentSongId = null;
  }
}

function playSong(songUrl: string, songId: number): void {
  stopCurrent();
  currentSongId = songId;
  currentHowl = new Howl({
    src: [songUrl],
    html5: true,
    volume: settings?.volume ?? 0.3,
    onplay: () => {
      isPlaying = true;
      isPlayingNext = false;
      onStateChange?.(true);
    },
    onpause: () => {
      isPlaying = false;
      onStateChange?.(false);
    },
    onstop: () => {
      isPlaying = false;
      onStateChange?.(false);
    },
    onend: () => {
      isPlaying = false;
      isPlayingNext = false;
      onStateChange?.(false);
      playNext();
    },
    onloaderror: () => {
      console.warn("[Music] 加载失败");
      isPlayingNext = false;
      playNext();
    },
  });
  currentHowl.play();
}

async function playNext() {
  if (isPlayingNext) return;
  isPlayingNext = true;

  const id = pickRandomId();
  if (!id) {
    isPlayingNext = false;
    return;
  }
  const songUrl = await fetchSongUrl(id);
  if (songUrl) {
    playSong(songUrl, id);
  } else {
    isPlayingNext = false;
    setTimeout(playNext, 2000);
  }
}

export function initMusic(onChange: (playing: boolean) => void) {
  onStateChange = onChange;
  if (!isInitialized) {
    initPool();
    isInitialized = true;
  }
  const wasPlaying = sessionStorage.getItem("music-playing") === "true";
  if (wasPlaying && !currentHowl) {
    playNext();
  }
}

export function configureMusic(musicConfig: MusicSettings) {
  settings = musicConfig;
  if (!isInitialized) {
    initPool();
  }
}

export function toggleMusic(): boolean {
  if (!currentHowl) {
    playNext();
    return true;
  }
  if (isPlaying) {
    currentHowl.pause();
    sessionStorage.setItem("music-playing", "false");
  } else {
    currentHowl.play();
    sessionStorage.setItem("music-playing", "true");
  }
  return !isPlaying;
}

export function getMusicState(): boolean {
  return isPlaying;
}
