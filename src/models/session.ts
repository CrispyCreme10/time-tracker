export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface DaySession {
  day: DayOfWeek;
  sessions: Session[]
}

export interface Session {
  start: Date,
  end: Date,
  total: string,
  notes: string
}