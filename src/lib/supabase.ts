
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Types based on our database schema
export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface Report {
  id: string;
  train_number: string;
  subsystem: string;
  location: string;
  notes?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  reviewed_by?: string;
  has_photos?: boolean;
}

export interface Photo {
  id: string;
  report_id: string;
  url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'Technician' | 'Manager' | 'Admin';
  full_name?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}
