export interface Field {
  id: number;
  name: string;
  field_type: 5 | 7 | 11;
  surface: 'SYNTHETIC' | 'NATURAL' | 'INDOOR';
  price_per_hour: number;
  is_active: boolean;
  description?: string;
  photo?: string;
}

export interface FieldSchedule {
  id: number;
  field: number;
  day_of_week: number;
  day_of_week_display: string;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export interface FieldBlock {
  id: number;
  field: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_by?: string;
  created_at?: string;
}
