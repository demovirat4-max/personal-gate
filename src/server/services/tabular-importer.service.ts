import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parseYouTubeUrl, parseDurationToSeconds } from '@/lib/parsers/youtube-url.parser';
import { CanonicalImportRow, NormalizedRowResult, ImportSourceType } from '@/contracts/curriculum/import.contract';

const ALLOWED_GOOGLE_SHEETS_HOSTS = ['docs.google.com', 'drive.google.com'];

export class TabularImporterService {
  /**
   * Validates public Google Sheets export URL against SSRF rules
   */
  static validateGoogleSheetsUrl(urlStr: string): string {
    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      throw new Error('Invalid Google Sheets URL format');
    }

    if (parsed.protocol !== 'https:') {
      throw new Error('Google Sheets URL must use HTTPS');
    }

    if (!ALLOWED_GOOGLE_SHEETS_HOSTS.includes(parsed.hostname.toLowerCase())) {
      throw new Error(`Unapproved Google Sheets host: ${parsed.hostname}`);
    }

    // Convert standard view link to public CSV export URL if needed
    if (parsed.pathname.includes('/edit') || parsed.pathname.includes('/view')) {
      const match = parsed.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const docId = match[1];
        const gvizMatch = parsed.hash || parsed.search;
        const gidMatch = gvizMatch.match(/gid=(\d+)/);
        const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
        return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`;
      }
    }

    return urlStr;
  }

  /**
   * Fetches public CSV content from Google Sheets with strict size and timeout caps
   */
  static async fetchGoogleSheetsCsv(urlStr: string): Promise<string> {
    const safeUrl = this.validateGoogleSheetsUrl(urlStr);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch(safeUrl, {
        signal: controller.signal,
        headers: { Accept: 'text/csv,text/plain' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Failed to fetch Google Sheets CSV: HTTP ${res.status}`);
      }

      const text = await res.text();
      if (text.length > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error('Google Sheets CSV exceeds maximum allowed limit of 5MB');
      }

      return text;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Fetch request to Google Sheets timed out');
      }
      throw err;
    }
  }

  /**
   * Parses raw tabular records (CSV string or XLSX Buffer) into normalized rows
   */
  static parseRawRecords(sourceType: ImportSourceType, rawInput: string | Buffer): Array<Record<string, any>> {
    if (sourceType === 'XLSX_UPLOAD') {
      const buffer = typeof rawInput === 'string' ? Buffer.from(rawInput, 'base64') : rawInput;
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellFormula: false });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('XLSX workbook contains no worksheets');
      }
      const sheet = workbook.Sheets[firstSheetName];
      return XLSX.utils.sheet_to_json(sheet, { defval: '' });
    }

    // CSV or Google Sheets CSV
    const csvContent = typeof rawInput === 'string' ? rawInput : rawInput.toString('utf-8');
    const result = Papa.parse<Record<string, any>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      throw new Error(`CSV Parsing error: ${result.errors[0]?.message}`);
    }

    return result.data;
  }

  /**
   * Normalizes raw row object into canonical contract with error details
   */
  static normalizeRow(rawRow: Record<string, any>, index: number): NormalizedRowResult {
    const rowNumber = index + 1;
    const findValue = (...keys: string[]): string => {
      for (const key of keys) {
        for (const rawKey of Object.keys(rawRow)) {
          if (rawKey.trim().toLowerCase() === key.toLowerCase()) {
            return String(rawRow[rawKey] || '').trim();
          }
        }
      }
      return '';
    };

    const subject = findValue('Subject', 'Subject Name', 'Course Subject');
    const topic = findValue('Topic', 'Topic Name', 'Module');
    const subtopic = findValue('Subtopic', 'Sub-topic', 'Section') || null;
    const lectureTitle = findValue('Lecture Title', 'Title', 'Video Title', 'Lesson');
    const youtubeUrl = findValue('YouTube URL', 'Youtube Link', 'Video URL', 'URL');
    const teacher = findValue('Teacher', 'Instructor', 'Educator', 'Channel') || null;
    const courseOrPlaylist = findValue('Course or Playlist', 'Playlist', 'Course') || null;
    const orderStr = findValue('Lecture Order', 'Order', 'Index', 'Sequence');
    const priorityStr = findValue('Priority', 'Level').toUpperCase();
    const notes = findValue('Notes', 'Description', 'Summary') || null;
    const durationStr = findValue('Duration', 'Length', 'Time');

    if (!subject) {
      return {
        rowNumber,
        rawData: rawRow,
        status: 'REJECTED',
        errorCode: 'MISSING_SUBJECT',
        errorMessage: 'Subject column is required and cannot be empty',
        fieldName: 'subject',
      };
    }

    if (!topic) {
      return {
        rowNumber,
        rawData: rawRow,
        status: 'REJECTED',
        errorCode: 'MISSING_TOPIC',
        errorMessage: 'Topic column is required and cannot be empty',
        fieldName: 'topic',
      };
    }

    if (!lectureTitle) {
      return {
        rowNumber,
        rawData: rawRow,
        status: 'REJECTED',
        errorCode: 'MISSING_TITLE',
        errorMessage: 'Lecture Title column is required and cannot be empty',
        fieldName: 'lectureTitle',
      };
    }

    if (!youtubeUrl) {
      return {
        rowNumber,
        rawData: rawRow,
        status: 'REJECTED',
        errorCode: 'MISSING_YOUTUBE_URL',
        errorMessage: 'YouTube URL column is required and cannot be empty',
        fieldName: 'youtubeUrl',
      };
    }

    const ytInfo = parseYouTubeUrl(youtubeUrl);
    if (!ytInfo.isValid || !ytInfo.videoId) {
      return {
        rowNumber,
        rawData: rawRow,
        status: 'REJECTED',
        errorCode: 'MALFORMED_YOUTUBE_URL',
        errorMessage: 'Invalid YouTube Video URL or video ID could not be extracted',
        fieldName: 'youtubeUrl',
      };
    }

    const lectureOrder = parseInt(orderStr, 10);
    const validOrder = isNaN(lectureOrder) || lectureOrder < 1 ? index + 1 : lectureOrder;

    const priority = ['HIGH', 'NORMAL', 'LOW'].includes(priorityStr)
      ? (priorityStr as 'HIGH' | 'NORMAL' | 'LOW')
      : 'NORMAL';

    const durationSeconds = parseDurationToSeconds(durationStr);

    const normalizedRow: CanonicalImportRow = {
      subject,
      topic,
      subtopic,
      lectureTitle,
      youtubeUrl,
      teacher,
      courseOrPlaylist,
      lectureOrder: validOrder,
      priority,
      notes,
      durationSeconds,
    };

    return {
      rowNumber,
      rawData: rawRow,
      normalizedRow,
      youtubeVideoId: ytInfo.videoId,
      status: 'VALID',
    };
  }
}
