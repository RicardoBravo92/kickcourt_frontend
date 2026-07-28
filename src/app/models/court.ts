export type SportType = 'FOOTBALL' | 'PADEL' | 'TENNIS' | 'BASKETBALL' | 'VOLLEYBALL' | 'HOCKEY';
export type SurfaceType = 'SYNTHETIC' | 'NATURAL' | 'INDOOR' | 'CLAY' | 'GRASS' | 'HARD' | 'WOOD' | 'SAND';

export interface Court {
  id: number;
  name: string;
  sport_type: SportType;
  sport_type_display?: string;
  surface: SurfaceType;
  surface_display?: string;
  players_per_side: number;
  price_per_hour: number;
  is_active: boolean;
  description?: string;
  photo?: string;
  vendor?: number;
  vendor_name?: string;
}

export interface CourtSchedule {
  id: number;
  court: number;
  court_name?: string;
  day_of_week: number;
  day_of_week_display: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export interface CourtBlock {
  id: number;
  court: number;
  court_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_by?: string;
  created_at?: string;
}
