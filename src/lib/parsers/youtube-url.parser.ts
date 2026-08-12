/**
 * Deterministic YouTube Video ID and Playlist ID Regex Extractors
 */

const YT_VIDEO_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;

const YT_PLAYLIST_REGEX = /[?&]list=([^#\&\?]+)/;

export interface ExtractedYouTubeInfo {
  videoId: string | null;
  playlistId: string | null;
  isValid: boolean;
}

export function parseYouTubeUrl(url: string): ExtractedYouTubeInfo {
  if (!url || typeof url !== 'string') {
    return { videoId: null, playlistId: null, isValid: false };
  }

  const trimmed = url.trim();
  const videoMatch = trimmed.match(YT_VIDEO_REGEX);
  const playlistMatch = trimmed.match(YT_PLAYLIST_REGEX);

  const videoId = videoMatch ? videoMatch[1] : null;
  const playlistId = playlistMatch ? playlistMatch[1] : null;

  return {
    videoId,
    playlistId,
    isValid: Boolean(videoId),
  };
}

export function parseDurationToSeconds(input: string | number | undefined | null): number {
  if (input === undefined || input === null || input === '') return 0;
  if (typeof input === 'number') return Math.max(0, Math.floor(input));

  const str = String(input).trim();

  // Check numeric string
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Check ISO 8601 duration string (e.g. PT1H23M45S)
  const isoMatch = str.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || '0', 10);
    const minutes = parseInt(isoMatch[2] || '0', 10);
    const seconds = parseInt(isoMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Check HH:MM:SS or MM:SS format
  const parts = str.split(':').map((p) => parseInt(p, 10));
  if (parts.every((p) => !isNaN(p))) {
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  return 0;
}
