import { PriorityLevel, ProgressStatus, ResourceType, VideoResource } from '../types';

/**
 * Extract YouTube playlist ID from URLs (e.g. list=PL... or /playlist?list=PL...)
 */
export function extractYouTubePlaylistId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  const playlistMatch = cleanUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (playlistMatch && playlistMatch[1]) {
    return playlistMatch[1];
  }

  // Direct playlist URL format: youtube.com/playlist/ID
  const directMatch = cleanUrl.match(/youtube\.com\/playlist\/([a-zA-Z0-9_-]+)/i);
  if (directMatch && directMatch[1]) {
    return directMatch[1];
  }

  return null;
}

/**
 * Resolves the appropriate YouTube embed URL for either a video, a playlist, or a video within a playlist.
 */
export function getYouTubeEmbedUrl(
  url?: string | null,
  videoId?: string | null,
  playlistId?: string | null
): string | null {
  if (!url && !videoId && !playlistId) return null;

  const cleanUrl = url ? url.trim() : '';

  const effectiveVideoId = videoId || (cleanUrl ? extractYouTubeVideoId(cleanUrl) : null);
  const effectivePlaylistId = playlistId || (cleanUrl ? extractYouTubePlaylistId(cleanUrl) : null);

  if (effectiveVideoId && effectivePlaylistId) {
    return `https://www.youtube-nocookie.com/embed/${effectiveVideoId}?list=${effectivePlaylistId}&autoplay=1&rel=0&enablejsapi=1`;
  }

  if (effectiveVideoId) {
    return `https://www.youtube-nocookie.com/embed/${effectiveVideoId}?autoplay=1&rel=0&enablejsapi=1`;
  }

  if (effectivePlaylistId) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${effectivePlaylistId}&autoplay=1&rel=0&enablejsapi=1`;
  }

  // Check if it's already an embed URL
  if (cleanUrl.includes('youtube.com/embed/') || cleanUrl.includes('youtube-nocookie.com/embed/')) {
    return cleanUrl.includes('?')
      ? `${cleanUrl}&autoplay=1&rel=0&enablejsapi=1`
      : `${cleanUrl}?autoplay=1&rel=0&enablejsapi=1`;
  }

  return null;
}

/**
 * Extract standard YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // If this is purely a playlist link without a specific video (e.g., youtube.com/playlist?list=...)
  if (cleanUrl.includes('/playlist?') && !cleanUrl.includes('v=')) {
    return null;
  }

  // Handle youtu.be/ID
  const shortMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Handle youtube.com/watch?v=ID or /embed/ID or /v/ID or /shorts/ID or /live/ID
  const longMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/i);
  if (longMatch && longMatch[1]) return longMatch[1];

  // If already 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

/**
 * Parse RFC 4180 compliant CSV text into an array of row arrays
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Skip CR in CRLF
        if (nextChar === '\n') {
          // Will be handled in next char
        }
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push trailing field
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Checks if the CSV matches a section-based curated syllabus format (like the GATE CSE Sheet)
 */
function isSectionBasedCuratedSheet(rows: string[][]): boolean {
  const textSample = rows.slice(0, 30).map((r) => r.join(' ').toLowerCase()).join(' ');
  return (
    (textSample.includes('operating system') || textSample.includes('computer network') || textSample.includes('gate cse')) &&
    (textSample.includes('youtube videos') || textSample.includes('nptel lectures') || textSample.includes('revision and pyq'))
  );
}

/**
 * Parses section-based curated GATE CSE syllabus sheet
 */
function parseCuratedSectionSheet(rows: string[][]): VideoResource[] {
  const subjectMap: Record<string, string> = {
    'operating system': 'Operating Systems',
    'computer organization': 'Computer Organization & Architecture',
    'coa': 'Computer Organization & Architecture',
    'computer network': 'Computer Networks',
    'cn': 'Computer Networks',
    'compiler design': 'Compiler Design',
    'cd': 'Compiler Design',
    'theory of computation': 'Theory of Computation',
    'toc': 'Theory of Computation',
    'c-programming': 'Programming & Data Structures',
    'c programming': 'Programming & Data Structures',
    'data structures': 'Programming & Data Structures',
    'ds': 'Programming & Data Structures',
    'algorithms': 'Algorithms',
    'digital logic': 'Digital Logic',
    'database': 'Databases',
    'dbms': 'Databases',
    'discrete': 'Discrete Mathematics',
    'linear algebra': 'Engineering Mathematics',
    'probability': 'Engineering Mathematics',
    'calculus': 'Engineering Mathematics',
    'aptitude': 'General Aptitude',
  };

  const resources: VideoResource[] = [];
  let currentSubject: string | null = null;
  let currentTextbook = '';
  let currentChapters = '';
  let currentTestLinks: { name: string; url: string }[] = [];

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    const cells = row.map((c) => c.trim()).filter((c) => c.length > 0);
    if (cells.length === 0) continue;

    const rowStr = cells.join(' ').toLowerCase();

    // Check if this row is a subject section header
    let matchedSubject: string | null = null;
    for (const [key, sname] of Object.entries(subjectMap)) {
      if (rowStr.includes(key) && cells.length <= 2 && !rowStr.includes('http') && !rowStr.includes('relavant')) {
        matchedSubject = sname;
        break;
      }
    }

    if (matchedSubject) {
      currentSubject = matchedSubject;
      currentTextbook = '';
      currentChapters = '';
      currentTestLinks = [];
      continue;
    }

    if (!currentSubject) continue;

    // Check for standard textbook info
    if (rowStr.includes('standard textbook') || rowStr.includes('textbook')) {
      const bookName = cells.find((c) => !c.toLowerCase().includes('standard textbook') && !c.startsWith('http'));
      if (bookName) currentTextbook = bookName;
    }

    if (rowStr.includes('relavant chapters') || rowStr.includes('chapters in book')) {
      const chapCell = cells.find((c) => c.toLowerCase().includes('ch ') || c.toLowerCase().includes('chapters'));
      if (chapCell) currentChapters = chapCell;
    }

    // Check for tests or practice links
    const testUrls = cells.filter((c) => c.includes('gateoverflow.in/exam/'));
    if (testUrls.length > 0) {
      testUrls.forEach((url, i) => {
        currentTestLinks.push({
          name: `Test ${currentTestLinks.length + 1}`,
          url,
        });
      });
    }

    // Extract YouTube and playlist links
    for (const cell of cells) {
      const ytMatches = cell.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s,]+)/gi);
      const colonMatch = cell.match(/^([^:]+):\s*(https?:\/\/.+)$/i);

      if (ytMatches) {
        for (const yurl of ytMatches) {
          const playlistId = extractYouTubePlaylistId(yurl);
          const videoId = extractYouTubeVideoId(yurl);

          const subtopicTitle = colonMatch ? colonMatch[1].trim() : null;
          const firstCell = cells[0];
          const rowTitle = firstCell && !firstCell.startsWith('http') && firstCell !== cell ? firstCell : '';

          let topic = subtopicTitle || rowTitle || `${currentSubject} Lecture`;
          let resType: ResourceType = playlistId ? 'playlist' : 'video';

          if (topic.toLowerCase().includes('revision') || topic.toLowerCase().includes('pyq')) {
            resType = 'revision';
          } else if (topic.toLowerCase().includes('nptel')) {
            resType = 'nptel';
          } else if (subtopicTitle) {
            resType = 'topic_playlist';
          }

          // Generate channel name heuristic
          let channel = 'YouTube';
          if (resType === 'nptel') {
            channel = 'NPTEL (IIT Faculty)';
          } else if (yurl.includes('PLIPZ2_p3RNH') || yurl.includes('GO Classes')) {
            channel = 'GO Classes';
          } else if (yurl.includes('PLG9aCp4uE-s')) {
            channel = 'Knowledge Gate';
          } else if (yurl.includes('PLC36xJgs4dx')) {
            channel = 'Gate Smashers';
          } else if (yurl.includes('PLbE3-5DBkMUk') || yurl.includes('PLBlnK6fEyqRj')) {
            channel = 'Neso Academy';
          } else if (yurl.includes('PLAXnLdrLnQp') || yurl.includes('PLIC0AxWOdm5')) {
            channel = 'Abdul Bari';
          } else if (yurl.includes('PLhLZ_zxDsyOI') || yurl.includes('PL3eEXnCBViH')) {
            channel = 'Amit Khurana';
          } else if (yurl.includes('PLZHQObOWTQDP')) {
            channel = '3Blue1Brown';
          } else if (yurl.includes('PLEbnTDJUr_I')) {
            channel = 'Ravindrababu Ravula';
          }

          const idKey = `${currentSubject}-${topic}-${playlistId || videoId || rIdx}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .slice(0, 50);

          resources.push({
            id: `sheet-${idKey}`,
            subject: currentSubject,
            topic,
            url: yurl,
            videoId,
            playlistId,
            resourceType: resType,
            channel,
            priority: resType === 'playlist' || resType === 'revision' ? 'High' : 'Medium',
            textbookRef: currentTextbook || undefined,
            recommendedChapters: currentChapters || undefined,
            testLinks: currentTestLinks.length > 0 ? [...currentTestLinks] : undefined,
            rowIndex: rIdx,
          });
        }
      }
    }
  }

  return resources;
}

/**
 * Maps raw CSV rows to VideoResource objects based on column headers
 */
export function mapCSVToResources(csvText: string): VideoResource[] {
  const parsedRows = parseCSV(csvText);
  if (parsedRows.length < 2) return [];

  // If this matches the curated GATE CSE sheet layout
  if (isSectionBasedCuratedSheet(parsedRows)) {
    const sectionResources = parseCuratedSectionSheet(parsedRows);
    if (sectionResources.length > 0) {
      return sectionResources;
    }
  }

  // Find standard header indices
  const headers = parsedRows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const findColIndex = (candidates: string[]) => {
    return headers.findIndex((h) => candidates.some((cand) => h.includes(cand)));
  };

  const subjectIdx = findColIndex(['subject', 'category', 'module']);
  const topicIdx = findColIndex(['topic', 'title', 'concept', 'name', 'lecture']);
  const urlIdx = findColIndex(['youtube', 'url', 'link', 'video', 'playlist']);
  const channelIdx = findColIndex(['channel', 'instructor', 'author', 'source', 'creator']);
  const priorityIdx = findColIndex(['priority', 'importance', 'urgency', 'level']);
  const statusIdx = findColIndex(['status', 'progress', 'state']);
  const notesIdx = findColIndex(['notes', 'takeaway', 'remarks', 'comment', 'description']);

  const resources: VideoResource[] = [];

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (!row || row.length === 0) continue;

    const subject = subjectIdx >= 0 && row[subjectIdx] ? row[subjectIdx] : 'General';
    const topic = topicIdx >= 0 && row[topicIdx] ? row[topicIdx] : (urlIdx >= 0 && row[urlIdx] ? `Topic ${i}` : '');
    const url = urlIdx >= 0 && row[urlIdx] ? row[urlIdx] : '';

    if (!topic && !url) continue;

    const channel = channelIdx >= 0 && row[channelIdx] ? row[channelIdx] : 'YouTube';
    
    // Parse priority
    let priority: PriorityLevel = 'Medium';
    if (priorityIdx >= 0 && row[priorityIdx]) {
      const pStr = row[priorityIdx].toLowerCase();
      if (pStr.includes('high') || pStr.includes('p1') || pStr.includes('h') || pStr.includes('imp')) {
        priority = 'High';
      } else if (pStr.includes('low') || pStr.includes('p3') || pStr.includes('l')) {
        priority = 'Low';
      }
    }

    // Default status if provided in sheet
    let defaultStatus: ProgressStatus = 'not_started';
    if (statusIdx >= 0 && row[statusIdx]) {
      const sStr = row[statusIdx].toLowerCase();
      if (sStr.includes('done') || sStr.includes('completed') || sStr.includes('finish')) {
        defaultStatus = 'done';
      } else if (sStr.includes('progress') || sStr.includes('started') || sStr.includes('watching')) {
        defaultStatus = 'in_progress';
      }
    }

    const defaultNotes = notesIdx >= 0 && row[notesIdx] ? row[notesIdx] : '';
    const videoId = extractYouTubeVideoId(url);
    const playlistId = extractYouTubePlaylistId(url);

    let resType: ResourceType = playlistId ? 'playlist' : 'video';
    if (topic.toLowerCase().includes('revision') || topic.toLowerCase().includes('pyq')) {
      resType = 'revision';
    } else if (topic.toLowerCase().includes('nptel')) {
      resType = 'nptel';
    }

    // Create unique deterministic ID based on subject + topic or URL
    const idKey = (subject + '-' + topic).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
    const id = `${idKey || 'vid'}-${i}`;

    resources.push({
      id,
      subject,
      topic,
      url,
      videoId,
      playlistId,
      resourceType: resType,
      channel,
      priority,
      defaultStatus,
      defaultNotes,
      rowIndex: i,
    });
  }

  return resources;
}
