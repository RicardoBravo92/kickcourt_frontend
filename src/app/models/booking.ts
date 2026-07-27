export interface Booking {
  id?: number;
  user?: string;
  field: number;
  field_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at?: string;
}
