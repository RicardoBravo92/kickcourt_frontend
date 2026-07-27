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
