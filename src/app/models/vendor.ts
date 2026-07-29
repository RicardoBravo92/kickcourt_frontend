export interface Vendor {
  id?: number;
  user?: string;
  business_name: string;
  description?: string;
  phone?: string;
  address?: string;
  institution_number?: string;
  is_approved?: boolean;
  commission_rate?: number;
  court_count?: number;
  created_at?: string;
}
