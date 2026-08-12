import { describe, it, expect } from 'vitest';

export function getKolkataTodayDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export function addDaysKolkata(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

describe('Phase 3 Date Utility Tests', () => {
  it('calculates Kolkata today date in YYYY-MM-DD format', () => {
    const today = getKolkataTodayDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('correctly calculates future date ladder step in Asia/Kolkata', () => {
    const next3Days = addDaysKolkata(3);
    expect(next3Days).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
