import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl, parseDurationToSeconds } from '@/lib/parsers/youtube-url.parser';
import { TabularImporterService } from '@/server/services/tabular-importer.service';

describe('Phase 2 Importer & Parsing Unit Tests', () => {
  it('extracts YouTube Video ID from valid watch and short URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
  });

  it('rejects malformed YouTube URLs', () => {
    expect(parseYouTubeUrl('https://google.com').isValid).toBe(false);
    expect(parseYouTubeUrl('invalid-url').isValid).toBe(false);
  });

  it('parses duration strings into seconds correctly', () => {
    expect(parseDurationToSeconds('PT1H23M45S')).toBe(5025);
    expect(parseDurationToSeconds('1:23:45')).toBe(5025);
    expect(parseDurationToSeconds('15:30')).toBe(930);
    expect(parseDurationToSeconds('300')).toBe(300);
  });

  it('validates public Google Sheets URLs and rejects unsafe SSRF hosts', () => {
    const validUrl = 'https://docs.google.com/spreadsheets/d/12345/edit';
    expect(TabularImporterService.validateGoogleSheetsUrl(validUrl)).toContain('docs.google.com');

    expect(() => TabularImporterService.validateGoogleSheetsUrl('http://docs.google.com')).toThrow();
    expect(() => TabularImporterService.validateGoogleSheetsUrl('https://evil-site.com/sheet')).toThrow();
    expect(() => TabularImporterService.validateGoogleSheetsUrl('https://169.254.169.254/latest')).toThrow();
  });

  it('normalizes raw row headers into canonical contract', () => {
    const rawRow = {
      'Subject Name': 'Data Structures',
      Topic: 'Trees',
      'Lecture Title': 'Binary Tree Traversal',
      'YouTube URL': 'https://youtu.be/dQw4w9WgXcQ',
      Duration: '15:00',
    };

    const res = TabularImporterService.normalizeRow(rawRow, 0);
    expect(res.status).toBe('VALID');
    expect(res.normalizedRow?.subject).toBe('Data Structures');
    expect(res.youtubeVideoId).toBe('dQw4w9WgXcQ');
    expect(res.normalizedRow?.durationSeconds).toBe(900);
  });
});
