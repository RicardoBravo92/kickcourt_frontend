export interface Booking {
  id?: number;
  user?: string;
  user_id?: number;
  user_email?: string;
  user_phone?: string;
  user_role?: string;
  court: number;
  court_name?: string;
  vendor_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price?: number;
  commission?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at?: string;
}
